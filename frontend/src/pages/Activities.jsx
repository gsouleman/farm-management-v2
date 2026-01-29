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
        <div className="animate-fade-in" style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#1a365d' }}>Field Operations Timeline</h1>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Historical ledger of activities performed on {currentFarm?.name}.</p>
                </div>
                <button className="primary" onClick={() => setView('add')}>+ Log New Activity</button>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {activities.map((activity, index) => (
                    <div key={activity.id} className="card hover-glow" style={{
                        marginBottom: '24px',
                        padding: '24px',
                        border: 'none',
                        borderRadius: '16px',
                        display: 'flex',
                        gap: '24px',
                        position: 'relative'
                    }}>
                        {/* Date vertical bar */}
                        <div style={{
                            width: '80px',
                            textAlign: 'right',
                            flexShrink: 0,
                            paddingRight: '24px',
                            borderRight: '2px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                                {new Date(activity.activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(activity.activity_date).getFullYear()}</div>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                            <div className="flex j-between a-center" style={{ marginBottom: '12px' }}>
                                <div className="flex a-center" gap="12px">
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        backgroundColor: '#ebf8ff',
                                        color: '#2b6cb0',
                                        textTransform: 'uppercase'
                                    }}>
                                        {activity.activity_type}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                                        📍 Area: {activity.area_covered} ha
                                    </span>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2d3748' }}>
                                    {activity.labor_cost ? `${activity.labor_cost.toLocaleString()} XAF` : ''}
                                </div>
                            </div>

                            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{activity.description || `${activity.activity_type} Operation`}</h3>

                            <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                                {activity.equipment_used && (
                                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        🚜 {activity.equipment_used}
                                    </div>
                                )}
                                {activity.activity_duration && (
                                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        ⏱️ {activity.activity_duration} hours
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subtle weather icon if available (mocking for effect) */}
                        <div style={{ fontSize: '24px', opacity: 0.5 }}>☀️</div>
                    </div>
                ))}

                {activities.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                        <h3>No operations logged yet</h3>
                        <p>Begin by recording your first field activity above.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Activities;
