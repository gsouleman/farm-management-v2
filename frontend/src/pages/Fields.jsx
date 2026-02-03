import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFarmStore from '../store/farmStore';
import useUIStore from '../store/uiStore';
import FieldForm from '../components/fields/FieldForm';
import FarmForm from '../components/farms/FarmForm';
import { getCameroonRegion } from '../utils/locationUtils';

const Fields = () => {
    const {
        farms,
        currentFarm,
        fields,
        fetchFields,
        fetchFarms,
        deleteField,
        deleteFarm,
        setCurrentFarm
    } = useFarmStore();
    const { showAlert, showNotification } = useUIStore();

    const [view, setView] = useState('list'); // list, add-parcel, add-enterprise, edit-enterprise
    const [activeTab, setActiveTab] = useState('parcels'); // parcels, enterprise
    const [editingFarm, setEditingFarm] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFarms();
    }, [fetchFarms]);

    useEffect(() => {
        if (currentFarm) {
            fetchFields(currentFarm.id);
        }
    }, [currentFarm, fetchFields]);

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
    if (view === 'add-enterprise') return <FarmForm onComplete={() => setView('list')} />;
    if (view === 'edit-enterprise') return <FarmForm initialData={editingFarm} onComplete={() => { setView('list'); setEditingFarm(null); }} />;

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Parcel Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Strategic management of agricultural parcels, infrastructure, and cultivation cycles.</p>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {fields.map(field => (
                        <div key={field.id} className="card animate-scale-in" style={{ padding: '20px', position: 'relative' }}>
                            <div className="flex j-between a-start" style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '24px' }}>🗺️</div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', backgroundColor: '#e6f4ea', padding: '4px 8px', borderRadius: '4px' }}>
                                        {field.area} {field.area_unit || 'ha'}
                                    </span>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        backgroundColor: field.status === 'active' ? '#ebf8ff' : field.status === 'fallow' ? '#fff5f5' : '#fefcbf',
                                        color: field.status === 'active' ? '#2b6cb0' : field.status === 'fallow' ? '#c53030' : '#b7791f',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {field.status || 'active'}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteField(field.id)}
                                        style={{ background: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{field.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '16px' }}>Lot #: {field.field_number || 'N/A'}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div style={{ fontSize: '11px' }}>
                                    <div style={{ color: 'var(--text-muted)' }}>Soil Type</div>
                                    <div style={{ fontWeight: '600' }}>{field.soil_type || 'Unknown'}</div>
                                </div>
                                <div style={{ fontSize: '11px' }}>
                                    <div style={{ color: 'var(--text-muted)' }}>Irrigation</div>
                                    <div style={{ fontWeight: '600' }}>{field.irrigation ? 'Yes' : 'No'}</div>
                                </div>
                                {field.crop_id && (
                                    <div style={{ fontSize: '11px', gridColumn: '1 / -1', marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                        <div style={{ color: 'var(--text-muted)' }}>Current Cultivation</div>
                                        <div style={{ fontWeight: '700', color: 'var(--primary)' }}>CROP ASSIGNED</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
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
