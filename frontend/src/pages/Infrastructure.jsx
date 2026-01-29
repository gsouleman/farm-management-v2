import React, { useState, useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import useInfrastructureStore from '../store/infrastructureStore';
import InfrastructureForm from '../components/infrastructure/InfrastructureForm';
import { INFRASTRUCTURE_TYPES } from '../constants/agriculturalData';

const Infrastructure = () => {
    const { currentFarm } = useFarmStore();
    const { infrastructure, fetchInfrastructure, deleteInfrastructure, loading } = useInfrastructureStore();
    const [view, setView] = useState('list'); // list, add

    useEffect(() => {
        if (currentFarm) {
            fetchInfrastructure(currentFarm.id);
        }
    }, [currentFarm, fetchInfrastructure]);

    if (!currentFarm) return <div style={{ padding: '24px' }}>Please select a farm to view infrastructure.</div>;

    if (view === 'add') return <InfrastructureForm farmId={currentFarm.id} onComplete={() => setView('list')} />;

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Farm Infrastructure</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage buildings, storage, and systems at {currentFarm?.name}.</p>
                </div>
                <button className="primary" onClick={() => setView('add')}>+ Register Asset</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {infrastructure.map(infra => {
                    const typeInfo = INFRASTRUCTURE_TYPES.find(t => t.id === infra.type);
                    return (
                        <div key={infra.id} className="card hover-glow" style={{ padding: '20px' }}>
                            <div className="flex j-between a-start" style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '24px' }}>{typeInfo?.icon || '🏢'}</div>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    backgroundColor: infra.status === 'operational' ? '#e6f4ea' : '#fef7e0',
                                    color: infra.status === 'operational' ? '#1e7e34' : '#b05d22'
                                }}>
                                    {infra.status.replace('_', ' ')}
                                </span>
                            </div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{infra.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '16px' }}>{typeInfo?.label || infra.type}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>GROUND AREA</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{infra.area_sqm || 0} m²</div>
                                </div>
                                <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>COST</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{parseFloat(infra.cost || 0).toLocaleString()}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="outline" style={{ flex: 1, fontSize: '12px' }}>View Details</button>
                                <button
                                    className="outline"
                                    style={{ color: '#dc3545', borderColor: '#ffccd1', width: '40px' }}
                                    onClick={() => { if (window.confirm('Delete this asset?')) deleteInfrastructure(infra.id); }}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    );
                })}

                <div
                    onClick={() => setView('add')}
                    style={{
                        border: '2px dashed #ddd',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '240px',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                >
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>➕</div>
                    <div style={{ fontWeight: 'bold' }}>Register New Asset</div>
                </div>
            </div>
        </div>
    );
};

export default Infrastructure;
