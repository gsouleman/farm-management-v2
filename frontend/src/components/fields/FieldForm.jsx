import React, { useState } from 'react';
import useFarmStore from '../../store/farmStore';
import useUIStore from '../../store/uiStore';
import useCropStore from '../../store/cropStore';
import useInfrastructureStore from '../../store/infrastructureStore';
import useCropDefinitionStore from '../../store/cropDefinitionStore';
import useInfrastructureDefinitionStore from '../../store/infrastructureDefinitionStore';
import FieldMap from './FieldMap';

const FieldForm = ({ onComplete, initialData }) => {
    const { farms, currentFarm, setCurrentFarm, createField, updateField, fetchFields } = useFarmStore();
    const { showNotification, showAlert } = useUIStore();
    const { createCrop } = useCropStore();
    const { createInfrastructure } = useInfrastructureStore();
    const { definitions: cropLibrary, fetchDefinitions: fetchCropLib } = useCropDefinitionStore();
    const { definitions: infraLibrary, fetchDefinitions: fetchInfraLib } = useInfrastructureDefinitionStore();

    const [selectedFarmId, setSelectedFarmId] = useState(currentFarm?.id || (farms.length === 1 ? farms[0].id : ''));
    const [drawingMode, setDrawingMode] = useState('main'); // main, crop, infra
    const [pendingAllocations, setPendingAllocations] = useState([]);
    const [activeAllocation, setActiveAllocation] = useState({
        name: '',
        type: '', // for infra
        sub_type: '',
        category: ''
    });

    React.useEffect(() => {
        if (!selectedFarmId && farms.length === 1) {
            setSelectedFarmId(farms[0].id);
        }
    }, [farms, selectedFarmId]);

    const [formData, setFormData] = useState({
        name: '',
        field_number: '',
        status: 'active',
        soil_type: '',
        drainage: '',
        slope: '',
        irrigation: false,
        area_unit: 'hectares',
        notes: '',
        boundary_coordinates: [],
        carbon_sequestration: 0,
        water_efficiency: 100
    });

    React.useEffect(() => {
        fetchCropLib();
        fetchInfraLib();

        if (initialData) {
            setFormData({
                ...initialData,
                boundary_coordinates: initialData.boundary?.coordinates?.[0]?.map(c => ({ lat: c[1], lng: c[0] })) || []
            });
            setCalculatedArea(initialData.area || 0);
        }
    }, [fetchCropLib, fetchInfraLib, initialData]);

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

        // Leaflet/GeoJSON uses [lng, lat]
        const mapCoords = points.map(p => [p.lng, p.lat]);
        setFormData(prev => ({
            ...prev,
            boundary_coordinates: mapCoords
        }));
    };

    const handleCoordsChange = (e) => {
        const text = e.target.value;
        setCoordsText(text);
        calculateMetrics(text);
    };

    const handleBoundarySave = (data) => {
        if (drawingMode === 'main') {
            setFormData({ ...formData, boundary_coordinates: data.coordinates });
            setCalculatedArea(data.area);
            setCalculatedPerimeter(data.perimeter);
        } else {
            // Check if name/type selected before allowing allocation save
            if (!activeAllocation.name) {
                showNotification('Please select a type from the library first', 'error');
                return;
            }

            const newAlloc = {
                ...activeAllocation,
                coordinates: data.coordinates,
                area: data.area,
                mode: drawingMode // crop or infra
            };

            setPendingAllocations([...pendingAllocations, newAlloc]);
            setDrawingMode('main'); // Revert after drawing
            setActiveAllocation({ name: '', type: '', sub_type: '', category: '' });
            showNotification(`${newAlloc.name} allocated to map!`, 'success');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.boundary_coordinates.length === 0) {
            showAlert('NO_BOUNDARY');
            return;
        }

        setLoading(true);
        try {
            // 1. Create or Update the Parcel (Field)
            let field;
            if (initialData?.id) {
                field = await updateField(initialData.id, {
                    ...formData,
                    area: calculatedArea
                });
            } else {
                field = await createField(selectedFarmId, {
                    ...formData,
                    area: calculatedArea
                });
            }

            // 2. Create Internal Allocations
            for (const alloc of pendingAllocations) {
                if (alloc.mode === 'crop') {
                    await createCrop(field.id, {
                        crop_type: alloc.name,
                        variety: alloc.sub_type || 'Standard',
                        planted_area: parseFloat(alloc.area),
                        boundary_coordinates: alloc.coordinates,
                        year: new Date().getFullYear(),
                        planting_date: new Date().toISOString().split('T')[0],
                        status: 'planted'
                    });
                } else {
                    await createInfrastructure(selectedFarmId, {
                        name: `${alloc.name} - ${formData.name}`,
                        type: alloc.name,
                        sub_type: alloc.sub_type,
                        field_id: field.id,
                        area_sqm: parseFloat(alloc.area) * 10000,
                        boundary_coordinates: alloc.coordinates,
                        status: 'operational',
                        construction_date: new Date().toISOString().split('T')[0]
                    });
                }
            }

            // Sync data
            await fetchFields(selectedFarmId);
            showNotification('Strategic Parcel and all internal allocations created!', 'success');

            if (onComplete) onComplete(field);
        } catch (error) {
            console.error(error);
            showNotification('Failed to register strategic parcel', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Register Strategic Parcel - {currentFarm?.name || 'New Parcel'}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label htmlFor="name">Parcel Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="e.g. North Plot A"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="field_number">Lot #</label>
                                <input
                                    id="field_number"
                                    name="field_number"
                                    type="text"
                                    value={formData.field_number}
                                    onChange={(e) => setFormData({ ...formData, field_number: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>
                                Registration Mode: {drawingMode === 'main' ? '🏗️ Parcel Boundary' : drawingMode === 'crop' ? '🥗 Crop Allocation' : '🏢 Infra Allocation'}
                            </label>
                            <div style={{ display: 'flex', backgroundColor: '#edf2f7', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                                {['main', 'crop', 'infra'].map(mode => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setDrawingMode(mode)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            backgroundColor: drawingMode === mode ? 'var(--primary)' : 'transparent',
                                            color: drawingMode === mode ? 'white' : '#4a5568',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {mode.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {farms.length > 1 && (
                            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fffaf0', border: '1px solid #feebc8', borderRadius: '8px' }}>
                                <label htmlFor="farm_select" style={{ color: '#9c4221', fontWeight: 'bold' }}>Select Farm for this Parcel</label>
                                <select
                                    id="farm_select"
                                    value={selectedFarmId}
                                    onChange={(e) => setSelectedFarmId(e.target.value)}
                                    required
                                    style={{ borderColor: '#fbd38d' }}
                                >
                                    <option value="">-- Choose Farm --</option>
                                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                                <p style={{ fontSize: '10px', color: '#c05621', margin: '4px 0 0 0' }}>💡 Registration will be associated with this specific enterprise.</p>
                            </div>
                        )}

                        {drawingMode !== 'main' && (
                            <div className="card animate-scale-in" style={{ padding: '16px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', marginBottom: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label>{drawingMode === 'crop' ? 'Select Crop' : 'Select Infra'}</label>
                                        <select
                                            value={activeAllocation.name}
                                            onChange={(e) => {
                                                const name = e.target.value;
                                                let sub_type = '';
                                                if (drawingMode === 'crop') {
                                                    const crop = cropLibrary.find(c => c.name === name);
                                                    if (crop && crop.varieties?.length > 0) {
                                                        sub_type = crop.varieties[0];
                                                    }
                                                }
                                                setActiveAllocation({ ...activeAllocation, name, sub_type });
                                            }}
                                        >
                                            <option value="">-- Select from Library --</option>
                                            {drawingMode === 'crop'
                                                ? cropLibrary.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)
                                                : infraLibrary.map(i => <option key={i.id} value={i.name}>{i.icon} {i.name}</option>)
                                            }
                                        </select>
                                    </div>
                                    <div>
                                        <label>{drawingMode === 'crop' ? 'Variety' : 'Label'}</label>
                                        <input
                                            type="text"
                                            placeholder={drawingMode === 'crop' ? "e.g. Local V1" : "e.g. Area A"}
                                            value={activeAllocation.sub_type}
                                            onChange={(e) => setActiveAllocation({ ...activeAllocation, sub_type: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <p style={{ fontSize: '10px', color: '#0369a1', margin: '8px 0 0 0' }}>
                                    ✨ Mode active: Draw the sub-area on the map to save this allocation.
                                </p>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label htmlFor="soil_type">Soil Type</label>
                                <select
                                    id="soil_type"
                                    name="soil_type"
                                    value={formData.soil_type}
                                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                                >
                                    <option value="">-- Select Soil --</option>
                                    <option value="sandy">Sandy</option>
                                    <option value="loamy">Loamy</option>
                                    <option value="clay">Clay</option>
                                    <option value="silt">Silt</option>
                                    <option value="peaty">Peaty</option>
                                    <option value="chalky">Chalky</option>
                                    <option value="saline">Saline</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="drainage">Drainage</label>
                                <select
                                    id="drainage"
                                    name="drainage"
                                    value={formData.drainage}
                                    onChange={(e) => setFormData({ ...formData, drainage: e.target.value })}
                                >
                                    <option value="">-- Select Drainage --</option>
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor</option>
                                    <option value="very_poor">Very Poor</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label htmlFor="slope">Slope</label>
                                <select
                                    id="slope"
                                    name="slope"
                                    value={formData.slope}
                                    onChange={(e) => setFormData({ ...formData, slope: e.target.value })}
                                >
                                    <option value="">-- Select Slope --</option>
                                    <option value="level">Level (0-2%)</option>
                                    <option value="gentle">Gentle (2-5%)</option>
                                    <option value="moderate">Moderate (5-10%)</option>
                                    <option value="steep">Steep ({'>'}10%)</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="area_unit">Area Unit</label>
                                <select
                                    id="area_unit"
                                    name="area_unit"
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
                                id="irrigation-toggle"
                                name="irrigation"
                                type="checkbox"
                                checked={formData.irrigation}
                                onChange={(e) => setFormData({ ...formData, irrigation: e.target.checked })}
                                style={{ width: 'auto' }}
                            />
                            <label htmlFor="irrigation-toggle" style={{ margin: 0 }}>Irrigation Available</label>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--bg-main)', borderStyle: 'dashed', padding: '16px', marginBottom: '16px' }}>
                        <label htmlFor="boundary_manual" style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>OR PASTE BOUNDARY COORDINATES (lat,lng)</label>
                        <textarea
                            id="boundary_manual"
                            name="boundary_manual"
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
                        <label htmlFor="notes">Operational Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="3"
                            style={{ resize: 'none' }}
                        />
                    </div>

                    <div className="card" style={{ padding: '16px', backgroundColor: '#f0fff4', border: '1px solid #c6f6d5', marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#2f855a' }}>Sustainability & ESG Tracking</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label htmlFor="carbon">Carbon Sequestration (tonnes/ha)</label>
                                <input
                                    id="carbon"
                                    type="number"
                                    step="0.01"
                                    value={formData.carbon_sequestration}
                                    onChange={(e) => setFormData({ ...formData, carbon_sequestration: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label htmlFor="water">Water Efficiency (%)</label>
                                <input
                                    id="water"
                                    type="number"
                                    value={formData.water_efficiency}
                                    onChange={(e) => setFormData({ ...formData, water_efficiency: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Saving...' : 'Register Parcel'}
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
                            manualCoordinates={formData.boundary_coordinates}
                            parcelName={formData.name}
                            subAllocations={pendingAllocations}
                            currentLabel={activeAllocation.sub_type || activeAllocation.name}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldForm;
