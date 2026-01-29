import React, { useState } from 'react';
import useFarmStore from '../../store/farmStore';
import FieldMap from './FieldMap';

const FieldForm = ({ onComplete }) => {
    const { currentFarm, createField } = useFarmStore();
    const [formData, setFormData] = useState({
        name: '',
        field_number: '',
        soil_type: '',
        drainage: '',
        slope: '',
        irrigation: false,
        area_unit: 'hectares',
        notes: '',
        boundary_coordinates: []
    });
    const [calculatedArea, setCalculatedArea] = useState(0);
    const [calculatedPerimeter, setCalculatedPerimeter] = useState(0);
    const [coordsText, setCoordsText] = useState('');
    const [loading, setLoading] = useState(false);

    const calculateMetrics = (text) => {
        const lines = text.trim().split('\n');
        const points = lines.map(line => {
            const [lat, lng] = line.split(',').map(v => parseFloat(v.trim()));
            return { lat, lng };
        }).filter(p => !isNaN(p.lat) && !isNaN(p.lng));

        if (points.length < 3) return;

        // Radius of Earth in meters
        const R = 6371000;

        // 1. Perimeter Calculation (Haversine)
        let totalPerimeter = 0;
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];

            const dLat = (p2.lat - p1.lat) * Math.PI / 180;
            const dLon = (p2.lng - p1.lng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            totalPerimeter += R * c;
        }

        // 2. Area Calculation (Shoelace on projected coords)
        const avgLat = points.reduce((acc, p) => acc + p.lat, 0) / points.length;
        const latRatio = 111320;
        const lngRatio = 111320 * Math.cos(avgLat * Math.PI / 180);

        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const x1 = p1.lng * lngRatio;
            const y1 = p1.lat * latRatio;
            const x2 = p2.lng * lngRatio;
            const y2 = p2.lat * latRatio;
            area += (x1 * y2 - x2 * y1);
        }
        area = Math.abs(area) / 2;

        const areaHa = (area / 10000).toFixed(2);
        const areaAc = (area / 4046.86).toFixed(2);

        setCalculatedArea(formData.area_unit === 'hectares' ? areaHa : areaAc);
        setCalculatedPerimeter((totalPerimeter / 1000).toFixed(2));
        setFormData(prev => ({
            ...prev,
            boundary_coordinates: points.map(p => ({ lat: p.lat, lng: p.lng }))
        }));
    };

    const handleCoordsChange = (e) => {
        const text = e.target.value;
        setCoordsText(text);
        calculateMetrics(text);
    };

    const handleBoundarySave = (data) => {
        setFormData({ ...formData, boundary_coordinates: data.coordinates });
        setCalculatedArea(data.area);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.boundary_coordinates.length === 0) {
            alert('Please draw a field boundary on the map first.');
            return;
        }

        setLoading(true);
        try {
            await createField(currentFarm.id, {
                ...formData,
                area: calculatedArea
            });
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Define Field Boundary & Profile</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label>Field Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label>Lot #</label>
                                <input
                                    type="text"
                                    value={formData.field_number}
                                    onChange={(e) => setFormData({ ...formData, field_number: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label>Soil Type</label>
                                <input
                                    type="text"
                                    value={formData.soil_type}
                                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Drainage</label>
                                <input
                                    type="text"
                                    value={formData.drainage}
                                    onChange={(e) => setFormData({ ...formData, drainage: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label>Slope</label>
                                <input
                                    type="text"
                                    value={formData.slope}
                                    onChange={(e) => setFormData({ ...formData, slope: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Area Unit</label>
                                <select
                                    value={formData.area_unit}
                                    onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                                >
                                    <option value="hectares">Hectares</option>
                                    <option value="acres">Acres</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                checked={formData.irrigation}
                                onChange={(e) => setFormData({ ...formData, irrigation: e.target.checked })}
                                style={{ width: 'auto' }}
                                id="irrigation-toggle"
                            />
                            <label htmlFor="irrigation-toggle" style={{ margin: 0 }}>Irrigation Available</label>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--bg-main)', borderStyle: 'dashed', padding: '16px', marginBottom: '16px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>OR PASTE BOUNDARY COORDINATES (lat,lng)</label>
                        <textarea
                            rows="4"
                            value={coordsText}
                            onChange={handleCoordsChange}
                            placeholder="45.4215,-75.6972&#10;45.4220,-75.6980..."
                            style={{ fontSize: '12px', fontFamily: 'monospace', marginBottom: '12px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div style={{ background: 'white', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PROJECTED AREA</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{calculatedArea} {formData.area_unit === 'hectares' ? 'ha' : 'ac'}</div>
                            </div>
                            <div style={{ background: 'white', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PERIMETER</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{calculatedPerimeter} km</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label>Operational Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="3"
                            style={{ resize: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Saving...' : 'Establish Field'}
                        </button>
                        <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Discard</button>
                    </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '550px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <FieldMap
                            center={currentFarm?.coordinates?.coordinates ? [currentFarm.coordinates.coordinates[1], currentFarm.coordinates.coordinates[0]] : [37.7749, -122.4194]}
                            onBoundaryCreate={handleBoundarySave}
                            editable={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldForm;
