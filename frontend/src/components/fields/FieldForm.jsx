import React, { useState } from 'react';
import useFarmStore from '../../store/farmStore';
import useUIStore from '../../store/uiStore';
import useCropStore from '../../store/cropStore';
import useInfrastructureStore from '../../store/infrastructureStore';
import useCropDefinitionStore from '../../store/cropDefinitionStore';
import useInfrastructureDefinitionStore from '../../store/infrastructureDefinitionStore';
import FieldMap from './FieldMap';
import { getCameroonRegion, getRecommendedVarieties, calculateCentroid } from '../../utils/locationUtils';

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

    const [calculatedPerimeter, setCalculatedPerimeter] = useState(0);
    const [coordsText, setCoordsText] = useState('');
    const [loading, setLoading] = useState(false);
    const [detectedRegion, setDetectedRegion] = useState('Center');
    const [isMapEditable, setIsMapEditable] = useState(false); // New toggle state

    const handleBoundaryUpdate = (data) => {
        // Update both coordinates and metrics from map interaction
        setFormData(prev => ({ ...prev, boundary_coordinates: data.coordinates }));
        setCalculatedArea(data.area);
        setCalculatedPerimeter(data.perimeter);

        // Update text field to reflect map changes [lat, lng format]
        const text = data.coordinates.map(c => `${c[1].toFixed(6)},${c[0].toFixed(6)}`).join('\n');
        setCoordsText(text);

        if (data.coordinates.length > 0) {
            const region = getCameroonRegion(data.coordinates[0][1], data.coordinates[0][0]);
            setDetectedRegion(region);
        }
    };

    const updateFarmLocation = async (coords) => {
        if (!selectedFarmId) return;
        const farm = farms.find(f => f.id === selectedFarmId);
        // Only update if current coordinates are missing or default
        const currentCoords = farm?.coordinates?.coordinates;
        if (!currentCoords || (currentCoords[0] === 0 && currentCoords[1] === 0)) {
            const centroid = calculateCentroid(coords);
            if (centroid) {
                await useFarmStore.getState().updateFarm(selectedFarmId, {
                    coordinates: { type: 'Point', coordinates: [centroid[1], centroid[0]] } // [lng, lat]
                });
                showNotification(`Farm location updated to Parcel ${formData.name || ''} centroid`, 'info');
            }
        }
    };

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

        // Detect region and update farm
        const region = getCameroonRegion(points[0].lat, points[0].lng);
        setDetectedRegion(region);
        updateFarmLocation(mapCoords);
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

            // Trigger region detection and farm update on map draw too
            if (data.coordinates.length > 0) {
                const region = getCameroonRegion(data.coordinates[0][1], data.coordinates[0][0]);
                setDetectedRegion(region);
                updateFarmLocation(data.coordinates);
            }
        } else {
            if (!activeAllocation.name) {
                showNotification('Please select a type from the library first', 'error');
                return;
            }

            const newAlloc = {
                ...activeAllocation,
                coordinates: data.coordinates,
                area: data.area,
                mode: drawingMode
            };

            setPendingAllocations([...pendingAllocations, newAlloc]);
            setDrawingMode('main');
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

            await fetchFields(selectedFarmId);
            showNotification('Strategic Parcel and internal allocations created!', 'success');
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
                <h3 style={{ margin: 0, fontSize: '18px' }}>Register Strategic Parcel</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px' }}>
                <form onSubmit={handleSubmit}>
                    {/* Enterprise Selection */}
                    {farms.length > 1 && (
                        <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fffaf0', border: '1px solid #feebc8', borderRadius: '8px' }}>
                            <label htmlFor="farm_select" style={{ color: '#9c4221', fontWeight: 'bold' }}>Assign to Enterprise</label>
                            <select id="farm_select" value={selectedFarmId} onChange={(e) => setSelectedFarmId(e.target.value)} required style={{ borderColor: '#fbd38d' }}>
                                <option value="">-- Choose Farm --</option>
                                {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Interactive Mode Slider */}
                    <div style={{
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: isMapEditable ? '#f0fff4' : '#f7fafc',
                        border: `1px solid ${isMapEditable ? '#68d391' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: isMapEditable ? '#2f855a' : '#4a5568' }}>
                                {isMapEditable ? '🟢 INTERACTIVE EDITING ENABLED' : '⚪ MAP INTERACTION DISABLED'}
                            </div>
                            <div style={{ fontSize: '10px', color: '#718096' }}>Drag markers on the map to resize parcel</div>
                        </div>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                            <input
                                type="checkbox"
                                checked={isMapEditable}
                                onChange={(e) => setIsMapEditable(e.target.checked)}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: isMapEditable ? '#48bb78' : '#cbd5e0',
                                transition: '.4s',
                                borderRadius: '24px'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    content: '""',
                                    height: '18px', width: '18px',
                                    left: isMapEditable ? '28px' : '4px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    transition: '.4s',
                                    borderRadius: '50%'
                                }}></span>
                            </span>
                        </label>
                    </div>

                    {/* Basic Info & Coordinates Card */}
                    <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="name">Parcel Name</label>
                            <input id="name" type="text" placeholder="e.g. North Plot A" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        </div>

                        <div style={{ background: 'var(--bg-main)', borderStyle: 'dashed', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>PASTE BOUNDARY COORDINATES (lat,lng)</label>
                            <textarea
                                id="boundary_manual"
                                rows="3"
                                value={coordsText}
                                onChange={handleCoordsChange}
                                placeholder="4.123,9.456&#10;4.125,9.458..."
                                style={{ fontSize: '12px', fontFamily: 'monospace', marginBottom: '12px' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div style={{ background: 'white', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AREA</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{calculatedArea} {formData.area_unit === 'hectares' ? 'ha' : 'ac'}</div>
                                </div>
                                <div style={{ background: 'white', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PERIMETER</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{calculatedPerimeter} km</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mode Selection Slider */}
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
                                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                                        backgroundColor: drawingMode === mode ? 'var(--primary)' : 'transparent',
                                        color: drawingMode === mode ? 'white' : '#4a5568'
                                    }}
                                >
                                    {mode.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Allocation Card (Dynamic) */}
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
                                                if (crop) {
                                                    const recs = getRecommendedVarieties(name, detectedRegion, crop.varieties);
                                                    sub_type = recs[0] || '';
                                                }
                                            }
                                            setActiveAllocation({ ...activeAllocation, name, sub_type });
                                        }}
                                    >
                                        <option value="">-- Select --</option>
                                        {drawingMode === 'crop'
                                            ? cropLibrary.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)
                                            : infraLibrary.map(i => <option key={i.id} value={i.name}>{i.icon} {i.name}</option>)
                                        }
                                    </select>
                                </div>
                                <div>
                                    <label>{drawingMode === 'crop' ? 'Variety (Local)' : 'Label'}</label>
                                    {drawingMode === 'crop' ? (
                                        <select value={activeAllocation.sub_type} onChange={(e) => setActiveAllocation({ ...activeAllocation, sub_type: e.target.value })}>
                                            <option value="">-- Select Variety --</option>
                                            {getRecommendedVarieties(
                                                activeAllocation.name,
                                                detectedRegion,
                                                cropLibrary.find(c => c.name === activeAllocation.name)?.varieties || []
                                            ).map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    ) : (
                                        <input type="text" placeholder="e.g. Area A" value={activeAllocation.sub_type} onChange={(e) => setActiveAllocation({ ...activeAllocation, sub_type: e.target.value })} />
                                    )}
                                </div>
                            </div>
                            <p style={{ fontSize: '10px', color: '#0369a1', marginTop: '8px' }}>Region: {detectedRegion} | Draw on map to allocate.</p>
                        </div>
                    )}

                    {/* Additional Details */}
                    <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label>Soil Type</label>
                                <select value={formData.soil_type} onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}>
                                    <option value="">-- Select Soil --</option>
                                    <option value="sandy">Sandy</option><option value="loamy">Loamy</option><option value="clay">Clay</option>
                                </select>
                            </div>
                            <div>
                                <label>Drainage</label>
                                <select value={formData.drainage} onChange={(e) => setFormData({ ...formData, drainage: e.target.value })}>
                                    <option value="">-- Select Drainage --</option>
                                    <option value="excellent">Excellent</option><option value="good">Good</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving...' : 'Register Parcel'}</button>
                        <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Discard</button>
                    </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '550px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <FieldMap
                            center={currentFarm?.coordinates?.coordinates ? [currentFarm.coordinates.coordinates[1], currentFarm.coordinates.coordinates[0]] : [37.7749, -122.4194]}
                            onBoundaryCreate={handleBoundarySave}
                            onBoundaryUpdate={handleBoundaryUpdate}
                            editable={true}
                            isMapEditable={isMapEditable}
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
