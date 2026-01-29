import React, { useState } from 'react';
import useFarmStore from '../../store/farmStore';

const FarmForm = ({ onComplete }) => {
    const { createFarm } = useFarmStore();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        farm_type: 'crop_production',
        total_area: '',
        area_unit: 'hectares',
        latitude: '',
        longitude: '',
        perimeter: ''
    });
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
        // Simplified planar projection for area (accurate enough for farms)
        const avgLat = points.reduce((acc, p) => acc + p.lat, 0) / points.length;
        const latRatio = 111320; // meters per degree lat
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

        setFormData(prev => ({
            ...prev,
            total_area: areaHa,
            area_unit: 'hectares',
            latitude: points[0].lat.toString(),
            longitude: points[0].lng.toString(),
            perimeter: (totalPerimeter / 1000).toFixed(2) // km
        }));
    };

    const handleCoordsChange = (e) => {
        const text = e.target.value;
        setCoordsText(text);
        calculateMetrics(text);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createFarm(formData);
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Register New Agricultural Enterprise</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label>Business Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Green Valley Farm"
                            required
                        />
                    </div>
                    <div>
                        <label>Operation Type</label>
                        <select
                            value={formData.farm_type}
                            onChange={(e) => setFormData({ ...formData, farm_type: e.target.value })}
                        >
                            <option value="crop_production">Field Crops</option>
                            <option value="livestock">Livestock / Animals</option>
                            <option value="mixed">Mixed Operations</option>
                            <option value="orchard">Orchard / Fruit</option>
                            <option value="vineyard">Vineyard</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Street Address</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Rural Route or Physical Address"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <label>City</label>
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>State / Province</label>
                        <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Postal Code</label>
                        <input
                            type="text"
                            value={formData.postal_code}
                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label>Country</label>
                        <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Total Size</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.total_area}
                            onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Area Unit</label>
                        <select
                            value={formData.area_unit}
                            onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                        >
                            <option value="hectares">Hectares (ha)</option>
                            <option value="acres">Acres (ac)</option>
                            <option value="sq_meters">Sq Meters (m²)</option>
                        </select>
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#f8f9fa', borderStyle: 'dashed', marginBottom: '20px' }}>
                    <label style={{ color: 'var(--primary)', fontWeight: '700' }}>🗺️ Boundary Coordinates (lat,lng per line)</label>
                    <textarea
                        rows="5"
                        value={coordsText}
                        onChange={handleCoordsChange}
                        placeholder="45.4215,-75.6972&#10;45.4220,-75.6980&#10;45.4210,-75.6990"
                        style={{ marginTop: '10px', fontSize: '13px', fontFamily: 'monospace' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
                        <div className="card" style={{ padding: '12px', textAlign: 'center', backgroundColor: 'white' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Surface Area</div>
                            <div style={{ fontWeight: 'bold' }}>{formData.total_area || '0'} ha</div>
                        </div>
                        <div className="card" style={{ padding: '12px', textAlign: 'center', backgroundColor: 'white' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Surface Area</div>
                            <div style={{ fontWeight: 'bold' }}>{(formData.total_area * 2.47105).toFixed(2) || '0'} ac</div>
                        </div>
                        <div className="card" style={{ padding: '12px', textAlign: 'center', backgroundColor: 'white' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Perimeter</div>
                            <div style={{ fontWeight: 'bold' }}>{formData.perimeter || '0'} km</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#f8f9fa', borderStyle: 'solid', borderColor: '#eee' }}>
                    <label style={{ color: 'var(--primary)', fontWeight: '700' }}>📍 Secondary Location Info</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                        <div>
                            <label style={{ fontSize: '11px' }}>Latitude (auto-filled)</label>
                            <input
                                type="text"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                placeholder="e.g. 45.4215"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>Longitude (auto-filled)</label>
                            <input
                                type="text"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                placeholder="e.g. -75.6972"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                        {loading ? 'Processing...' : 'Register Farm'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default FarmForm;
