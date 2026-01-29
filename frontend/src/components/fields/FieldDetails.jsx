import React, { useEffect, useState } from 'react';
import * as turf from '@turf/turf';
import api from '../../services/api';
import FieldMap from './FieldMap';
import CropForm from '../crops/CropForm';
import ActivityForm from '../activities/ActivityForm';

const FieldDetails = ({ field, onBack }) => {
    // Calculate area fallback if database says 0
    let displayArea = parseFloat(field.area || 0);
    if (displayArea === 0 && field.boundary?.coordinates?.[0]) {
        try {
            const polygon = turf.polygon(field.boundary.coordinates);
            displayArea = turf.area(polygon) / 10000;
        } catch (e) {
            console.error('Frontend area calculation failed:', e);
        }
    }
    const [crops, setCrops] = useState([]);
    const [activities, setActivities] = useState([]);
    const [view, setView] = useState('overview'); // overview, add-crop, add-activity
    const [selectedCrop, setSelectedCrop] = useState(null);

    const fetchData = async () => {
        try {
            const [cropsRes, activitiesRes] = await Promise.all([
                api.get(`/crops/field/${field.id}`),
                api.get(`/activities/farm/${field.farm_id}`)
            ]);
            setCrops(cropsRes.data);
            setActivities(activitiesRes.data.filter(a => a.field_id === field.id));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [field.id]);

    const renderView = () => {
        if (view === 'add-crop') return <CropForm fieldId={field.id} onComplete={() => { setView('overview'); fetchData(); }} />;
        if (view === 'add-activity') return <ActivityForm fieldId={field.id} cropId={selectedCrop?.id} onComplete={() => { setView('overview'); fetchData(); }} />;

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
                <div>
                    <div className="card">
                        <div className="card-header">
                            <h4 style={{ margin: 0, fontSize: '14px' }}>Technical Profile</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <DataRow label="Field Number" value={field.field_number || 'N/A'} />
                            <DataRow label="Total Area" value={`${displayArea.toFixed(2)} ha`} />
                            <DataRow label="Soil Type" value={field.soil_type || 'Unknown'} />
                            <DataRow label="Irrigation" value={field.irrigation ? 'Operational' : 'None'} />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h4 style={{ margin: 0, fontSize: '14px' }}>Active Cultivations</h4>
                            <button onClick={() => setView('add-crop')} className="primary" style={{ padding: '4px 10px', fontSize: '11px' }}>+ New</button>
                        </div>
                        {crops.length === 0 ? <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No active crops.</p> : (
                            crops.map(crop => (
                                <div key={crop.id} style={{ marginBottom: '16px', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: '#fcfdfc' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '4px' }}>{crop.crop_type}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{crop.variety} • Planted {crop.planting_date}</div>
                                    <button
                                        onClick={() => { setSelectedCrop(crop); setView('add-activity'); }}
                                        className="outline"
                                        style={{ width: '100%', marginTop: '12px', fontSize: '11px', padding: '6px' }}
                                    >Record Work</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <div className="card" style={{ padding: '0', overflow: 'hidden', height: '350px', marginBottom: '24px' }}>
                        <FieldMap
                            center={[field.boundary.coordinates[0][0][1], field.boundary.coordinates[0][0][0]]}
                            fields={[field]}
                            crops={crops}
                            editable={false}
                        />
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h4 style={{ margin: 0, fontSize: '14px' }}>Operation Log</h4>
                        </div>
                        {activities.length === 0 ? <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No activities logged for this field.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {activities.map(activity => (
                                    <div key={activity.id} style={{ display: 'flex', gap: '20px' }}>
                                        <div style={{ minWidth: '90px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500', textAlign: 'right', paddingTop: '4px' }}>{activity.activity_date}</div>
                                        <div style={{ position: 'relative', borderLeft: '2px solid var(--primary-light)', paddingLeft: '20px' }}>
                                            <div style={{
                                                position: 'absolute',
                                                left: '-6px',
                                                top: '8px',
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--primary)',
                                                border: '2px solid white'
                                            }} />
                                            <div style={{ fontWeight: '600', fontSize: '14px', textTransform: 'capitalize' }}>{activity.activity_type}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-main)', marginTop: '4px' }}>{activity.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={onBack} className="outline" style={{ padding: '6px 14px' }}>← Back</button>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Fields / <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>{field.name}</span></div>
            </div>
            {renderView()}
        </div>
    );
};

const DataRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontWeight: 'bold' }}>{value}</span>
    </div>
);

export default FieldDetails;
