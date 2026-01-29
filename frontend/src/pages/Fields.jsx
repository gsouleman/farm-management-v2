import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFarmStore from '../store/farmStore';
import FieldForm from '../components/fields/FieldForm';

const Fields = () => {
    const { currentFarm, fields, fetchFields } = useFarmStore();
    const [view, setView] = useState('list'); // list, add
    const navigate = useNavigate();

    useEffect(() => {
        if (currentFarm) {
            fetchFields(currentFarm.id);
        }
    }, [currentFarm, fetchFields]);

    if (view === 'add') return <FieldForm onComplete={() => setView('list')} />;

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Field Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Overview and boundaries for all parcels in {currentFarm?.name}.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="outline" onClick={() => window.location.href = '/crops?view=add'}>+ Add Crop</button>
                    <button className="primary" onClick={() => setView('add')}>+ Register New Field</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {fields.map(field => (
                    <div key={field.id} className="card animate-scale-in" style={{ padding: '20px', cursor: 'pointer' }}>
                        <div className="flex j-between a-start" style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '24px' }}>🗺️</div>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', backgroundColor: '#e6f4ea', padding: '4px 8px', borderRadius: '4px' }}>
                                {field.area} {field.area_unit || 'ha'}
                            </span>
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
                        </div>
                    </div>
                ))}
            </div>

            {fields.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '60px', borderStyle: 'dashed' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚜</div>
                    <h3>No fields registered yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Start by drawing your first field boundary on the map.</p>
                    <button className="primary" onClick={() => setView('add')}>Add Your First Field</button>
                </div>
            )}
        </div>
    );
};

export default Fields;
