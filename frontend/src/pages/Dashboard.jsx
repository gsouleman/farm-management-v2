import React, { useEffect, useState } from 'react';
import useFarmStore from '../store/farmStore';
import FieldMap from '../components/fields/FieldMap';
import FarmForm from '../components/farms/FarmForm';
import FieldForm from '../components/fields/FieldForm';
import FieldDetails from '../components/fields/FieldDetails';

const Dashboard = () => {
    const { fetchFarms, currentFarm, fields, fetchFields, loading } = useFarmStore();
    const [view, setView] = useState('overview'); // overview, add-farm, add-field, field-details
    const [selectedField, setSelectedField] = useState(null);

    useEffect(() => {
        fetchFarms();
    }, [fetchFarms]);

    useEffect(() => {
        if (currentFarm) {
            fetchFields(currentFarm.id);
        }
    }, [currentFarm, fetchFields]);

    const stats = [
        { label: 'Total Fields', value: fields.length, icon: '🗺️' },
        { label: 'Total Area', value: `${currentFarm?.total_area || '0.00'} ha`, icon: '📏' },
        { label: 'Active Crops', value: '4', icon: '🌱' },
        { label: 'Tasks Today', value: '2', icon: '✅' }
    ];

    const renderContent = () => {
        if (view === 'add-farm') return <FarmForm onComplete={() => { setView('overview'); fetchFarms(); }} />;
        if (view === 'add-field') return <FieldForm onComplete={() => { setView('overview'); fetchFields(currentFarm.id); }} />;
        if (view === 'field-details') return <FieldDetails field={selectedField} onBack={() => setView('overview')} />;

        return (
            <div className="animate-fade-in">
                {/* AgriXP Stat Snapshots */}
                <div className="snapshot-grid">
                    {stats.map((stat, i) => (
                        <div key={i} className="snapshot-card">
                            <div className="flex j-between a-center">
                                <span className="snapshot-label">{stat.label}</span>
                                <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                            </div>
                            <div className="snapshot-value">{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '24px' }}>
                    {/* Map & Fields Panel */}
                    <div>
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '16px' }}>Farm Visualizer</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setView('add-field')}>+ Boundary</button>
                                </div>
                            </div>
                            <div style={{ height: '450px' }}>
                                <FieldMap
                                    center={currentFarm?.coordinates?.coordinates ? [currentFarm.coordinates.coordinates[1], currentFarm.coordinates.coordinates[0]] : [37.7749, -122.4194]}
                                    fields={fields}
                                    farmBoundary={currentFarm?.boundary}
                                    editable={false}
                                />
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h3 style={{ margin: 0, fontSize: '16px' }}>All Fields</h3>
                                <button className="outline" style={{ fontSize: '12px' }}>Export PDF</button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '12px 8px' }}>Name</th>
                                        <th style={{ padding: '12px 8px' }}>Area (ha)</th>
                                        <th style={{ padding: '12px 8px' }}>Soil Type</th>
                                        <th style={{ padding: '12px 8px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.map(f => (
                                        <tr key={f.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: '500' }}>{f.name}</td>
                                            <td style={{ padding: '12px 8px' }}>{f.area}</td>
                                            <td style={{ padding: '12px 8px' }}>{f.soil_type || '—'}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <button onClick={() => { setSelectedField(f); setView('field-details'); }} style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: 'var(--primary)', color: 'white' }}>Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {fields.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No fields recorded for this farm.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Panel: Activities & Actions */}
                    <div>
                        <div className="card">
                            <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Quick Actions</h3>
                            <button className="primary" style={{ width: '100%', marginBottom: '12px' }} onClick={() => setView('add-farm')}>+ New Farm</button>
                            <button className="secondary" style={{ width: '100%', marginBottom: '12px' }}>Record Activity</button>
                            <button className="outline" style={{ width: '100%' }}>Check Weather</button>
                        </div>

                        <div className="card">
                            <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Recent Activity</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <ActivityItem type="Seeding" date="Just now" field="Field A" />
                                <ActivityItem type="Irrigation" date="2h ago" field="North Field" />
                                <ActivityItem type="Scouting" date="Yesterday" field="Field B" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>{currentFarm?.name || 'Farm Overview'}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Welcome back! Here's what's happening on your farm.</p>
                </div>
                {view !== 'overview' && (
                    <button onClick={() => setView('overview')} className="outline">← Back to Dashboard</button>
                )}
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading farm data...</div>}

            {!loading && renderContent()}
        </div>
    );
};

const ActivityItem = ({ type, date, field }) => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '6px' }} />
        <div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{type} on {field}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{date}</div>
        </div>
    </div>
);

export default Dashboard;
