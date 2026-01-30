import React, { useState, useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import useInfrastructureStore from '../store/infrastructureStore';
import InfrastructureForm from '../components/infrastructure/InfrastructureForm';
import FieldMap from '../components/fields/FieldMap';
import { INFRASTRUCTURE_TYPES } from '../constants/agriculturalData';

const Infrastructure = () => {
    const { currentFarm } = useFarmStore();
    const { infrastructure, fetchInfrastructure, deleteInfrastructure, loading } = useInfrastructureStore();
    const [view, setView] = useState('list'); // list, add, edit, view
    const [selectedInfra, setSelectedInfra] = useState(null);

    useEffect(() => {
        if (currentFarm) {
            fetchInfrastructure(currentFarm.id);
        }
    }, [currentFarm, fetchInfrastructure]);

    if (!currentFarm) return <div style={{ padding: '24px' }}>Please select a farm to view infrastructure.</div>;

    if (view === 'add') return <InfrastructureForm farmId={currentFarm.id} onComplete={() => setView('list')} />;
    if (view === 'edit') return <InfrastructureForm farmId={currentFarm.id} initialData={selectedInfra} onComplete={() => setView('list')} />;

    if (view === 'view' && selectedInfra) {
        const typeInfo = INFRASTRUCTURE_TYPES.find(t => t.id === selectedInfra.type);
        return (
            <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', padding: '24px' }}>
                <div className="card" style={{ padding: '32px' }}>
                    <div className="flex j-between a-center" style={{ marginBottom: '24px' }}>
                        <h2 style={{ margin: 0 }}>Asset Details: {selectedInfra.name}</h2>
                        <button className="outline" onClick={() => setView('list')}>Back to List</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>TYPE</label>
                                <div style={{ fontSize: '16px', marginTop: '4px' }}>{typeInfo?.icon} {typeInfo?.label || selectedInfra.type}</div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>STATUS</label>
                                <div style={{ fontSize: '16px', marginTop: '4px', textTransform: 'capitalize' }}>{selectedInfra.status.replace('_', ' ')}</div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>CONSTRUCTION DATE</label>
                                <div style={{ fontSize: '16px', marginTop: '4px' }}>{selectedInfra.construction_date || 'N/A'}</div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>COST</label>
                                <div style={{ fontSize: '16px', marginTop: '4px' }}>{parseFloat(selectedInfra.cost || 0).toLocaleString()} XAF</div>
                            </div>
                        </div>
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>GROUND AREA</label>
                                <div style={{ fontSize: '16px', marginTop: '4px' }}>{selectedInfra.area_sqm || 0} m²</div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>PERIMETER</label>
                                <div style={{ fontSize: '16px', marginTop: '4px' }}>{selectedInfra.perimeter || 0} m</div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>NOTES</label>
                                <div style={{ fontSize: '16px', marginTop: '4px', color: '#444' }}>{selectedInfra.notes || 'No notes provided.'}</div>
                            </div>
                        </div>
                    </div>

                    {selectedInfra.boundary?.coordinates?.[0]?.[0] && (
                        <div style={{ marginTop: '32px', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
                            <FieldMap
                                center={[selectedInfra.boundary.coordinates[0][0][1], selectedInfra.boundary.coordinates[0][0][0]]}
                                infrastructure={[selectedInfra]}
                                farmBoundary={selectedInfra.boundary}
                                zoom={17}
                                editable={false}
                            />
                        </div>
                    )}

                    <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                        <button className="primary" onClick={() => setView('edit')} style={{ flex: 1 }}>Edit Asset</button>
                        <button className="outline" onClick={() => { if (window.confirm('Delete this asset?')) { deleteInfrastructure(selectedInfra.id); setView('list'); } }} style={{ flex: 1, color: '#dc3545', borderColor: '#ffccd1' }}>Delete Asset</button>
                    </div>
                </div>
            </div>
        );
    }

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
                                    backgroundColor: infra.status === 'operational' ? '#e6f4ea' : (infra.status === 'under_construction' ? '#e8f0fe' : '#fef7e0'),
                                    color: infra.status === 'operational' ? '#1e7e34' : (infra.status === 'under_construction' ? '#1967d2' : '#b05d22')
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
                                <button className="outline" style={{ flex: 1, fontSize: '12px' }} onClick={() => { setSelectedInfra(infra); setView('view'); }}>View Details</button>
                                <button className="outline" style={{ width: '40px' }} onClick={() => { setSelectedInfra(infra); setView('edit'); }}>✏️</button>
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
                        height: '243px',
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
