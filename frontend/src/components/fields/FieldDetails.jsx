import React, { useEffect, useState } from 'react';
import api from '../services/api';
import FieldMap from '../components/fields/FieldMap';
import CropForm from '../components/crops/CropForm';
import ActivityForm from '../components/activities/ActivityForm';

const FieldDetails = ({ field, onBack }) => {
    const [crops, setCrops] = useState([]);
    const [activities, setActivities] = useState([]);
    const [view, setView] = useState('overview'); // overview, add-crop, add-activity
    const [selectedCrop, setSelectedCrop] = useState(null);

    const fetchData = async () => {
        try {
            const [cropsRes, activitiesRes] = await Promise.all([
                api.get(`/crops/field/${field.id}`),
                api.get(`/activities/farm/${field.farm_id}`) // Simplified, should be by field
            ]);
            setCrops(cropsRes.data);
            // Filter activities for this field if needed
            setActivities(activitiesRes.data.filter(a => a.field_id === field.id));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [field.id]);

    const renderView = () => {
        switch (view) {
            case 'add-crop':
                return <CropForm fieldId={field.id} onComplete={() => { setView('overview'); fetchData(); }} />;
            case 'add-activity':
                return <ActivityForm fieldId={field.id} cropId={selectedCrop?.id} onComplete={() => { setView('overview'); fetchData(); }} />;
            default:
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px' }}>
                        <div>
                            <div className="glass-card" style={{ marginBottom: '24px' }}>
                                <h4 style={{ marginBottom: '16px' }}>Field Info</h4>
                                <p><strong>Number:</strong> {field.field_number || 'N/A'}</p>
                                <p><strong>Area:</strong> {field.area} ha</p>
                                <p><strong>Soil:</strong> {field.soil_type || 'Unknown'}</p>
                                <p><strong>Irrigation:</strong> {field.irrigation ? 'Yes' : 'No'}</p>
                            </div>

                            <div className="glass-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h4 style={{ margin: 0 }}>Active Crops</h4>
                                    <button onClick={() => setView('add-crop')} style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--primary)', color: 'white' }}>+ Add</button>
                                </div>
                                {crops.length === 0 ? <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No crops recorded.</p> : (
                                    crops.map(crop => (
                                        <div key={crop.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                                            <p style={{ fontWeight: 'bold', margin: '0 0 4px' }}>{crop.crop_type} ({crop.variety})</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Planted: {crop.planting_date}</p>
                                            <button onClick={() => { setSelectedCrop(crop); setView('add-activity'); }} style={{ padding: '4px 8px', fontSize: '12px', marginTop: '8px', background: 'var(--secondary)', color: 'white' }}>Record Activity</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div>
                            <div style={{ height: '300px', marginBottom: '24px' }}>
                                <FieldMap center={[field.boundary.coordinates[0][0][1], field.boundary.coordinates[0][0][0]]} fields={[field]} editable={false} />
                            </div>

                            <div className="glass-card">
                                <h4 style={{ marginBottom: '16px' }}>Activity Timeline</h4>
                                {activities.length === 0 ? <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No activities recorded yet.</p> : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {activities.map(activity => (
                                            <div key={activity.id} style={{ display: 'flex', gap: '16px' }}>
                                                <div style={{ minWidth: '100px', color: 'var(--text-muted)', fontSize: '14px' }}>{activity.activity_date}</div>
                                                <div>
                                                    <p style={{ fontWeight: 'bold', margin: '0 0 4px', textTransform: 'capitalize' }}>{activity.activity_type}</p>
                                                    <p style={{ fontSize: '14px', margin: 0 }}>{activity.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
                <button onClick={onBack} style={{ background: 'none', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '4px 12px' }}>← Back</button>
                <h2 style={{ margin: 0 }}>Field: {field.name}</h2>
            </div>
            {renderView()}
        </div>
    );
};

export default FieldDetails;
