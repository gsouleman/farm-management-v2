import React, { useState } from 'react';
import usePlannerStore from '../store/plannerStore';
import useFarmStore from '../store/farmStore';

const Planner = () => {
    const { currentFarm } = useFarmStore();
    const { scenarios, createScenario, deleteScenario } = usePlannerStore();
    const [view, setView] = useState('scenarios');
    const [showModal, setShowModal] = useState(false);
    const [newPlan, setNewPlan] = useState({
        name: '',
        year: new Date().getFullYear() + 1,
        area: '',
        estRevenue: '',
        status: 'draft'
    });

    const handleCreatePlan = (e) => {
        e.preventDefault();
        createScenario(newPlan);
        setShowModal(false);
        setNewPlan({
            name: '',
            year: new Date().getFullYear() + 1,
            area: '',
            estRevenue: '',
            status: 'draft'
        });
    };

    return (
        <div className="animate-fade-in" style={{ padding: '24px', backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '400px', padding: '30px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Create New Plan</h3>
                        <form onSubmit={handleCreatePlan}>
                            <div style={{ marginBottom: '16px' }}>
                                <label>Plan Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newPlan.name}
                                    placeholder="e.g. 2026 Optimized Rotation"
                                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label>Crop Year</label>
                                    <input
                                        type="number"
                                        required
                                        value={newPlan.year}
                                        onChange={(e) => setNewPlan({ ...newPlan, year: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Total Area (ha)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newPlan.area}
                                        onChange={(e) => setNewPlan({ ...newPlan, area: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label>Est. Revenue (XAF)</label>
                                <input
                                    type="number"
                                    required
                                    value={newPlan.estRevenue}
                                    onChange={(e) => setNewPlan({ ...newPlan, estRevenue: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" className="primary" style={{ flex: 1 }}>Save Plan</button>
                                <button type="button" className="outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#1a365d' }}>Crop Rotation Planner</h1>
                    <p style={{ color: '#4a5568', fontSize: '15px' }}>Strategic planning for upcoming seasons at <strong>{currentFarm?.name}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="primary" onClick={() => setShowModal(true)}>+ Create Plan</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {scenarios.map(scenario => (
                    <div key={scenario.id} className="card hover-glow" style={{ padding: '24px', border: 'none', borderRadius: '20px' }}>
                        <div className="flex j-between a-start" style={{ marginBottom: '20px' }}>
                            <div style={{
                                padding: '8px',
                                backgroundColor: scenario.status === 'active' ? '#c6f6d5' : '#edf2f7',
                                borderRadius: '12px',
                                fontSize: '20px'
                            }}>
                                🗓️
                            </div>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                backgroundColor: scenario.status === 'active' ? '#2f855a' : '#718096',
                                color: 'white'
                            }}>
                                {scenario.status.toUpperCase()}
                            </span>
                        </div>

                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{scenario.name}</h3>
                        <p style={{ color: '#718096', fontSize: '14px', marginBottom: '20px' }}>Planned for Crop Year: {scenario.year}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ backgroundColor: '#f7fafc', padding: '12px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '10px', color: '#a0aec0', fontWeight: 'bold' }}>EST. AREA</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{scenario.area} ha</div>
                            </div>
                            <div style={{ backgroundColor: '#f7fafc', padding: '12px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '10px', color: '#a0aec0', fontWeight: 'bold' }}>POTENTIAL REVENUE</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2f855a' }}>{scenario.estRevenue.toLocaleString()}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="outline" style={{ flex: 1, fontSize: '13px' }}>Edit Plan</button>
                            <button
                                className="outline"
                                style={{ color: '#e53e3e', borderColor: '#fed7d7', fontSize: '13px' }}
                                onClick={() => deleteScenario(scenario.id)}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}

                {/* Blank creation card */}
                <div
                    onClick={() => setShowModal(true)}
                    style={{
                        border: '2px dashed #cbd5e0',
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px',
                        cursor: 'pointer',
                        color: '#718096'
                    }}
                >
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>➕</div>
                    <div style={{ fontWeight: 'bold' }}>Create New Scenario</div>
                    <div style={{ fontSize: '12px' }}>Experiment with different crops</div>
                </div>
            </div>

            {/* Rotation Intelligence Section */}
            <div className="card" style={{ marginTop: '32px', padding: '30px', border: 'none', borderRadius: '24px' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '20px' }}>Crop Rotation Intelligence</h3>
                <div style={{
                    padding: '24px',
                    backgroundColor: '#fffaf0',
                    border: '1px solid #feebc8',
                    borderRadius: '16px',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-start'
                }}>
                    <div style={{ fontSize: '32px' }}>💡</div>
                    <div>
                        <h4 style={{ margin: '0 0 8px 0', color: '#c05621' }}>Rotation Tip</h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#7b341e', lineHeight: '1.6' }}>
                            Based on your history, <strong>Field 04</strong> had Corn for 2 consecutive years.
                            We recommend rotating to <strong>Soybeans</strong> or <strong>Legumes</strong> this season to restore soil nitrogen and break pest cycles.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Planner;
