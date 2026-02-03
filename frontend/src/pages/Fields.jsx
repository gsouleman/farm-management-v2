import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFarmStore from '../store/farmStore';
import useUIStore from '../store/uiStore';
import useCropStore from '../store/cropStore';
import useInfrastructureStore from '../store/infrastructureStore';
import FieldForm from '../components/fields/FieldForm';
import FarmForm from '../components/farms/FarmForm';
import ParcelAllocationFlow from '../components/fields/ParcelAllocationFlow';
import { getCameroonRegion } from '../utils/locationUtils';

const Fields = () => {
    const {
        farms,
        currentFarm,
        fields,
        fetchFields,
        fetchFarms,
        updateField,
        deleteField,
        deleteFarm,
        setCurrentFarm
    } = useFarmStore();
    const { crops, fetchCropsByFarm } = useCropStore();
    const { infrastructure, fetchInfrastructure } = useInfrastructureStore();
    const { showAlert, showNotification } = useUIStore();

    const [view, setView] = useState('list'); // list, add-parcel, add-enterprise, edit-enterprise, edit-parcel
    const [activeTab, setActiveTab] = useState('parcels'); // parcels, enterprise
    const [editingFarm, setEditingFarm] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFarms();
    }, [fetchFarms]);

    useEffect(() => {
        if (currentFarm) {
            fetchFields(currentFarm.id);
            fetchCropsByFarm(currentFarm.id);
            fetchInfrastructure(currentFarm.id);
        }
    }, [currentFarm, fetchFields, fetchCropsByFarm, fetchInfrastructure]);

    const handleDeleteField = async (id) => {
        if (window.confirm('Are you sure you want to delete this parcel?')) {
            try {
                const response = await deleteField(id);
                showNotification(response?.notification?.message || 'Parcel deleted successfully', 'success');
            } catch (error) {
                showNotification('Delete failed', 'error');
            }
        }
    };

    const handleDeleteFarm = async (farm) => {
        if (window.confirm(`PERMANENTLY LIQUIDATE "${farm.name}"? This will delete all associated data.`)) {
            try {
                const response = await deleteFarm(farm.id);
                showNotification(response?.notification?.message || 'Enterprise record liquidated', 'success');
            } catch (error) {
                showNotification('Liquidation failed', 'error');
            }
        }
    };

    if (view === 'add-parcel') return <FieldForm onComplete={() => setView('list')} />;
    if (view === 'edit-parcel' && editingField) return <FieldForm initialData={editingField} onComplete={() => { setView('list'); setEditingField(null); }} />;
    if (view === 'add-enterprise') return <FarmForm onComplete={() => setView('list')} />;
    if (view === 'edit-enterprise') return <FarmForm initialData={editingFarm} onComplete={() => { setView('list'); setEditingFarm(null); }} />;

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Parcel Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Define and manage the physical land boundaries (Parcels) for your active farms. All geo-spatial operations are centralized here.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {activeTab === 'parcels' ? (
                        <button className="primary" onClick={() => setView('add-parcel')}>+ Add New Parcel</button>
                    ) : (
                        <button className="primary" style={{ backgroundColor: '#2d3748' }} onClick={() => setView('add-enterprise')}>+ Register Enterprise</button>
                    )}
                </div>
            </div>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', backgroundColor: '#edf2f7', padding: '4px', borderRadius: '8px', width: 'fit-content' }}>
                <button
                    onClick={() => setActiveTab('parcels')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: activeTab === 'parcels' ? 'white' : 'transparent',
                        color: activeTab === 'parcels' ? 'var(--primary)' : '#718096',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'parcels' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    PARCELS ({currentFarm?.name || 'NONE'})
                </button>
                <button
                    onClick={() => setActiveTab('enterprise')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: activeTab === 'enterprise' ? 'white' : 'transparent',
                        color: activeTab === 'enterprise' ? 'var(--primary)' : '#718096',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: activeTab === 'enterprise' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    ENTERPRISES ({farms.length})
                </button>
            </div>

            {activeTab === 'parcels' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {fields.map(field => {
                        const fieldCrops = crops.filter(c => c.field_id === field.id);
                        const fieldInfra = infrastructure.filter(i => i.field_id === field.id);

                        return (
                            <div key={field.id} className="card animate-scale-in" style={{ padding: '0', position: 'relative', overflow: 'hidden', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                {/* Header with Area */}
                                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ fontSize: '20px' }}>🗺️</div>
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{field.name.toUpperCase()}</h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)' }}>{field.area} {field.area_unit || 'ha'}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{field.status?.toUpperCase() || 'ACTIVE'}</div>
                                    </div>
                                </div>

                                <div style={{ padding: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                        <div style={{ fontSize: '11px', backgroundColor: '#fdf2f2', padding: '8px', borderRadius: '6px' }}>
                                            <div style={{ color: '#9b2c2c', fontWeight: 'bold', fontSize: '9px' }}>SOIL COMPOSITION</div>
                                            <div style={{ fontWeight: '800', color: '#742a2a' }}>{field.soil_type?.toUpperCase() || 'NOT TESTED'}</div>
                                        </div>
                                        <div style={{ fontSize: '11px', backgroundColor: '#f0fdf4', padding: '8px', borderRadius: '6px' }}>
                                            <div style={{ color: '#166534', fontWeight: 'bold', fontSize: '9px' }}>ESG SCORE</div>
                                            <div style={{ fontWeight: '800', color: '#14532d' }}>{field.water_efficiency || 100}% WATER EFF.</div>
                                        </div>
                                    </div>

                                    {/* Sub-allocations Summary */}
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Current Allocations</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {fieldCrops.map(c => (
                                                <span key={c.id} style={{ fontSize: '10px', backgroundColor: '#fffbe6', color: '#856404', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ffe58f', fontWeight: '600' }}>
                                                    🥗 {c.crop_type} ({c.variety})
                                                </span>
                                            ))}
                                            {fieldInfra.map(i => (
                                                <span key={i.id} style={{ fontSize: '10px', backgroundColor: '#f0f9ff', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: '600' }}>
                                                    🏢 {i.type}
                                                </span>
                                            ))}
                                            {fieldCrops.length === 0 && fieldInfra.length === 0 && (
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No sub-allocations</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                        <button
                                            onClick={() => { setEditingField(field); setView('edit-parcel'); }}
                                            style={{ flex: 1, padding: '8px', backgroundColor: '#edf2f7', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', color: '#4a5568' }}
                                        >
                                            UPDATE DETAILS
                                        </button>
                                        <button
                                            onClick={() => handleDeleteField(field.id)}
                                            style={{ padding: '8px 12px', backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {fields.length === 0 && (
                        <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', borderStyle: 'dashed' }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚜</div>
                            <h3>No parcels registered for {currentFarm?.name}</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Start by drawing your first field boundary on the map.</p>
                            <button className="primary" onClick={() => setView('add-parcel')}>Add Your First Parcel</button>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {farms.map(farm => (
                        <div key={farm.id} className="card animate-scale-in" style={{
                            padding: '0',
                            overflow: 'hidden',
                            border: currentFarm?.id === farm.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                            boxShadow: currentFarm?.id === farm.id ? '0 0 15px rgba(var(--primary-rgb), 0.2)' : 'none'
                        }}>
                            <div style={{ height: '80px', backgroundColor: '#F7FAFC', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #E2E8F0' }}>
                                <div style={{ fontSize: '28px' }}>🏗️</div>
                                <div style={{ marginLeft: '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>{farm.name.toUpperCase()}</h3>
                                    <div style={{ fontSize: '11px', color: 'var(--secondary)', fontWeight: '700' }}>
                                        {getCameroonRegion(farm.coordinates?.coordinates?.[1], farm.coordinates?.coordinates?.[0]).toUpperCase()} REGION
                                    </div>
                                </div>
                                {currentFarm?.id === farm.id && (
                                    <div style={{ marginLeft: 'auto', backgroundColor: 'var(--primary)', color: 'white', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>ACTIVE</div>
                                )}
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#718096', fontWeight: 'bold' }}>TOTAL SIZE</div>
                                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{parseFloat(farm.total_area || 0).toFixed(2)} HA</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#718096', fontWeight: 'bold' }}>LOCATION</div>
                                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{farm.city || 'N/A'}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => { setCurrentFarm(farm); setActiveTab('parcels'); }}
                                        className="primary"
                                        style={{ fontSize: '11px', padding: '8px 12px', flex: 1.5 }}
                                    >
                                        MANAGE PARCELS
                                    </button>
                                    <button
                                        onClick={() => { setEditingFarm(farm); setView('edit-enterprise'); }}
                                        style={{ background: '#E2E8F0', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                                    >
                                        EDIT
                                    </button>
                                    <button
                                        onClick={() => handleDeleteFarm(farm)}
                                        style={{ background: '#fff5f5', color: '#e53e3e', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Fields;
