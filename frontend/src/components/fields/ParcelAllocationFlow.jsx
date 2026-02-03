import React, { useState, useEffect } from 'react';
import useFarmStore from '../../store/farmStore';
import useCropStore from '../../store/cropStore';
import useInfrastructureStore from '../../store/infrastructureStore';
import useUIStore from '../../store/uiStore';
import useCropDefinitionStore from '../../store/cropDefinitionStore';
import FieldMap from '../fields/FieldMap';
import { INFRASTRUCTURE_TYPES } from '../../constants/agriculturalData';

const ParcelAllocationFlow = ({ field, onComplete }) => {
    const { currentFarm, fetchFields } = useFarmStore();
    const { createCrop } = useCropStore();
    const { createInfrastructure } = useInfrastructureStore();
    const { showNotification } = useUIStore();
    const { definitions, fetchDefinitions } = useCropDefinitionStore();

    const [allocationType, setAllocationType] = useState('crop'); // 'crop' or 'infrastructure'
    const [selectedItem, setSelectedItem] = useState('');
    const [subType, setSubType] = useState('');
    const [allocatedArea, setAllocatedArea] = useState(0);
    const [boundary, setBoundary] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDefinitions();
    }, [fetchDefinitions]);

    // Group active definitions by category
    const groupedCrops = definitions.filter(d => d.is_active).reduce((acc, crop) => {
        const cat = crop.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(crop);
        return acc;
    }, {});

    const handleSaveAllocation = async () => {
        if (!selectedItem) {
            showNotification('Please select a crop or infrastructure type', 'error');
            return;
        }
        if (boundary.length === 0) {
            showNotification('Please draw the allocation area on the map', 'error');
            return;
        }

        setLoading(true);
        try {
            if (allocationType === 'crop') {
                await createCrop(field.id, {
                    crop_type: selectedItem,
                    variety: subType || 'Standard',
                    planted_area: parseFloat(allocatedArea),
                    boundary_coordinates: boundary,
                    year: new Date().getFullYear(),
                    planting_date: new Date().toISOString().split('T')[0],
                    status: 'planted'
                });
            } else {
                await createInfrastructure(currentFarm.id, {
                    name: `${selectedItem} - ${field.name}`,
                    type: selectedItem,
                    sub_type: subType,
                    field_id: field.id,
                    area_sqm: parseFloat(allocatedArea) * 10000, // ha to sqm
                    boundary_coordinates: boundary,
                    status: 'operational',
                    construction_date: new Date().toISOString().split('T')[0]
                });
            }

            showNotification(`${allocationType === 'crop' ? 'Crop' : 'Infrastructure'} allocation saved!`, 'success');

            // Reset for next allocation or finish
            setSelectedItem('');
            setSubType('');
            setBoundary([]);
            setAllocatedArea(0);

            // Refresh fields to show on map if user stays
            fetchFields(currentFarm.id);
        } catch (error) {
            console.error('Allocation failed:', error);
            showNotification('Failed to save allocation', 'error');
        } finally {
            setLoading(false);
        }
    };

    const parentBounds = field.boundary?.coordinates?.[0]?.map(c => [c[1], c[0]]) || [];

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', border: '2px solid var(--primary)' }}>
            <div className="card-header" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '20px' }}>
                <div className="flex j-between a-center">
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px' }}>Parcel Successfully Registered: {field.name}</h2>
                        <p style={{ margin: '4px 0 0 0', opacity: 0.8, fontSize: '13px' }}>Next Step: Allocate internal space for Crops or Infrastructure</p>
                    </div>
                    <button onClick={onComplete} style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Finish Setup
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card" style={{ padding: '16px', backgroundColor: '#f8fafc' }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>01. Select Allocation Type</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button
                                onClick={() => { setAllocationType('crop'); setSelectedItem(''); }}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '2px solid',
                                    borderColor: allocationType === 'crop' ? 'var(--primary)' : '#e2e8f0',
                                    backgroundColor: allocationType === 'crop' ? '#ebf8ff' : 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                🥗 CROP
                            </button>
                            <button
                                onClick={() => { setAllocationType('infrastructure'); setSelectedItem(''); }}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '2px solid',
                                    borderColor: allocationType === 'infrastructure' ? 'var(--primary)' : '#e2e8f0',
                                    backgroundColor: allocationType === 'infrastructure' ? '#ebf8ff' : 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                🏗️ INFRA
                            </button>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '16px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>
                            02. {allocationType === 'crop' ? 'Crop Selection' : 'Infrastructure Type'}
                        </label>

                        {allocationType === 'crop' ? (
                            <select
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                            >
                                <option value="">-- Select Crop --</option>
                                {Object.entries(groupedCrops).map(([category, items]) => (
                                    <optgroup key={category} label={category}>
                                        {items.map(item => (
                                            <option key={item.id} value={item.name}>{item.icon} {item.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        ) : (
                            <select
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                            >
                                <option value="">-- Select Infrastructure --</option>
                                {INFRASTRUCTURE_TYPES.map(type => (
                                    <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                                ))}
                            </select>
                        )}

                        <div style={{ marginTop: '16px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                                {allocationType === 'crop' ? 'Variety / Hybrid' : 'Sub-type / Label'}
                            </label>
                            <input
                                type="text"
                                value={subType}
                                onChange={(e) => setSubType(e.target.value)}
                                placeholder={allocationType === 'crop' ? 'e.g. CMS 8704' : 'e.g. Main Warehouse'}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                            />
                        </div>
                    </div>

                    <div className="card" style={{ padding: '16px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f' }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#856404', textTransform: 'uppercase', marginBottom: '8px' }}>Allocation Metrics</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '13px' }}>Surface Area:</span>
                            <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)' }}>{allocatedArea} <small style={{ fontSize: '12px' }}>HA</small></span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#856404', marginTop: '8px' }}>
                            {boundary.length === 0 ? '⚠️ Draw on map to calculate surface area' : '✅ Area calculated from boundary'}
                        </p>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <button
                            className="primary"
                            onClick={handleSaveAllocation}
                            disabled={loading || !selectedItem || boundary.length === 0}
                            style={{ width: '100%', padding: '16px', fontSize: '14px' }}
                        >
                            {loading ? 'Saving...' : `Register ${allocationType === 'crop' ? 'Crop' : 'Infrastructure'} Area`}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '550px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e2e8f0', position: 'relative' }}>
                        <FieldMap
                            center={parentBounds[0]}
                            fields={[field]}
                            farmBoundary={field.boundary}
                            editable={true}
                            currentLabel={subType || selectedItem}
                            onBoundaryCreate={(data) => {
                                setBoundary(data.coordinates);
                                setAllocatedArea(data.area);
                            }}
                        />
                        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, backgroundColor: 'rgba(255,255,255,0.9)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--primary)', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>
                            📍 Boundary Lock: {field.name}
                        </div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', fontStyle: 'italic' }}>
                        Draw the specific {allocationType} area inside the {field.name} boundary above.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ParcelAllocationFlow;
