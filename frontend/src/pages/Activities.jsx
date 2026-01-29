import React, { useState, useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import useActivityStore from '../store/activityStore';
import ActivityForm from '../components/activities/ActivityForm';

const Activities = () => {
    const { currentFarm } = useFarmStore();
    const { activities, fetchActivitiesByFarm } = useActivityStore();
    const [view, setView] = useState('list'); // list, add

    useEffect(() => {
        if (currentFarm) {
            fetchActivitiesByFarm(currentFarm.id);
        }
    }, [currentFarm, fetchActivitiesByFarm]);

    if (view === 'add') return <ActivityForm onComplete={() => setView('list')} />;

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Field Operations</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Timeline of all agricultural activities performed on {currentFarm?.name}.</p>
                </div>
                <button className="primary" onClick={() => setView('add')}>+ Log New Activity</button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '16px' }}>Date</th>
                            <th style={{ padding: '16px' }}>Type</th>
                            <th style={{ padding: '16px' }}>Area Covered</th>
                            <th style={{ padding: '16px' }}>Equipment</th>
                            <th style={{ padding: '16px' }}>Labor Cost</th>
                            <th style={{ padding: '16px' }}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map(activity => (
                            <tr key={activity.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                <td style={{ padding: '16px' }}>{activity.activity_date}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold' }}>{activity.activity_type}</span>
                                </td>
                                <td style={{ padding: '16px' }}>{activity.area_covered} ha</td>
                                <td style={{ padding: '16px' }}>{activity.equipment_used || '—'}</td>
                                <td style={{ padding: '16px' }}>{activity.labor_cost ? `${activity.labor_cost} XAF` : '—'}</td>
                                <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>{activity.description}</td>
                            </tr>
                        ))}
                        {activities.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No activities logged for this farm yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Activities;
