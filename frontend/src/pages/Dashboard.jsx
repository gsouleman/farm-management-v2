import React, { useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import FieldMap from '../components/fields/FieldMap';
import Navbar from '../components/common/Navbar';
import FarmForm from '../components/farms/FarmForm';
import FieldForm from '../components/fields/FieldForm';
import FieldDetails from '../components/fields/FieldDetails';

const Dashboard = () => {
    const { fetchFarms, currentFarm, fields, fetchFields, loading } = useFarmStore();
    const [view, setView] = React.useState('overview'); // overview, add-farm, add-field, field-details
    const [selectedField, setSelectedField] = React.useState(null);

    useEffect(() => {
        fetchFarms();
    }, [fetchFarms]);

    useEffect(() => {
        if (currentFarm) {
            fetchFields(currentFarm.id);
        }
    }, [currentFarm, fetchFields]);

    const stats = [
        { label: 'Total Fields', value: fields.length },
        { label: 'Total Area', value: `${fields.reduce((acc, f) => acc + parseFloat(f.area || 0), 0).toFixed(2)} ha` },
        { label: 'Active Crops', value: '4' }, // Placeholder
        { label: 'Recent Activities', value: '12' } // Placeholder
    ];

    const renderContent = () => {
        switch (view) {
            case 'add-farm':
                return <FarmForm onComplete={() => { setView('overview'); fetchFarms(); }} />;
            case 'add-field':
                return <FieldForm onComplete={() => { setView('overview'); fetchFields(currentFarm.id); }} />;
            case 'field-details':
                return <FieldDetails field={selectedField} onBack={() => setView('overview')} />;
            default:
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0 }}>Farm Map Overview</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {fields.map(f => (
                                        <button key={f.id} onClick={() => { setSelectedField(f); setView('field-details'); }} style={{ padding: '4px 12px', fontSize: '13px', background: 'white', border: '1px solid var(--border)', borderRadius: '20px' }}>
                                            {f.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <FieldMap
                                center={currentFarm?.coordinates?.coordinates ? [currentFarm.coordinates.coordinates[1], currentFarm.coordinates.coordinates[0]] : [37.7749, -122.4194]}
                                fields={fields}
                                editable={false}
                            />
                        </div>

                        <div>
                            <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
                            <div className="glass-card">
                                <button className="primary" style={{ width: '100%', marginBottom: '12px' }} onClick={() => setView('add-farm')}>Add New Farm</button>
                                <button className="primary" style={{ width: '100%', marginBottom: '12px', backgroundColor: 'var(--secondary)' }} onClick={() => setView('add-field')}>Add Field Boundary</button>
                                <button className="primary" style={{ width: '100%', marginBottom: '12px', backgroundColor: 'var(--accent)' }}>Record Activity</button>
                                <button className="primary" style={{ width: '100%', backgroundColor: 'var(--secondary)' }}>Generate Report</button>
                            </div>

                            <h3 style={{ margin: '30px 0 20px' }}>Recent Tasks</h3>
                            <div className="glass-card">
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No recent tasks found.</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="animate-fade-in">
            <Navbar />
            <div className="container" style={{ paddingBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ margin: 0 }}>{view === 'overview' ? 'Farm Dashboard' : view.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</h2>
                    {view !== 'overview' && <button onClick={() => setView('overview')} style={{ background: 'none', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '8px 16px' }}>Back to Dashboard</button>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="glass-card" style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>{stat.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {renderContent()}
            </div>
        </div>
    );
};

export default Dashboard;
