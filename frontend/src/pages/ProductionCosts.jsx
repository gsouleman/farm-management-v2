import React, { useState, useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import api from '../services/api';

const ProductionCosts = () => {
    const { currentFarm } = useFarmStore();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({
        totalActual: 0,
        totalEstimated: 0,
        totalLabor: 0,
        totalInput: 0,
        avgCostPerHa: 0
    });

    useEffect(() => {
        if (currentFarm?.id) {
            fetchData();
        }
    }, [currentFarm]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Reusing the budget report but we'll expand it if needed
            const response = await api.get('/reports/crop-budget', {
                params: { farmId: currentFarm.id }
            });

            const detailedData = response.data;
            setData(detailedData);

            // Calculate overall summary
            const totals = detailedData.reduce((acc, item) => ({
                actual: acc.actual + item.actualCosts,
                estimated: acc.estimated + item.estimatedCosts,
                // These might need separate endpoints if budget doesn't split them, 
                // but for now we'll assume the structure from the backend
            }), { actual: 0, estimated: 0 });

            // Since getCropBudget doesn't return labor/input split, 
            // we will fetch individual production costs for better detail if the user clicks,
            // or we can optimize the backend later.

            setSummary(prev => ({
                ...prev,
                totalActual: totals.actual,
                totalEstimated: totals.estimated
            }));

        } catch (error) {
            console.error('Failed to fetch production costs', error);
        } finally {
            setLoading(false);
        }
    };

    if (!currentFarm) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚜</div>
                <h2>Please select a farm to view Production Costs</h2>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Production costs</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Financial breakdown of all cultivation activities for {currentFarm.name}.
                    </p>
                </div>
                <button className="primary" onClick={fetchData} disabled={loading}>
                    {loading ? 'Refreshing...' : '🔄 Refresh Data'}
                </button>
            </div>

            {/* Top Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <SummaryCard
                    title="Total Actual Cost"
                    value={`${summary.totalActual.toLocaleString()} XAF`}
                    color="#4caf50"
                    icon="💰"
                />
                <SummaryCard
                    title="Budget Variance"
                    value={`${(summary.totalEstimated - summary.totalActual).toLocaleString()} XAF`}
                    color={summary.totalEstimated >= summary.totalActual ? '#28a745' : '#dc3545'}
                    icon="📉"
                />
                <SummaryCard
                    title="Active Cultivations"
                    value={data.length}
                    color="#2196f3"
                    icon="🌱"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Cost per Crop Table */}
                <div className="card" style={{ padding: '0' }}>
                    <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Crop Cost Breakdown</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '16px' }}>Crop</th>
                                    <th style={{ padding: '16px' }}>Field</th>
                                    <th style={{ padding: '16px' }}>Estimated</th>
                                    <th style={{ padding: '16px' }}>Actual</th>
                                    <th style={{ padding: '16px' }}>Efficiency</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, idx) => {
                                    const percentage = item.estimatedCosts > 0
                                        ? (item.actualCosts / item.estimatedCosts) * 100
                                        : 0;

                                    return (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: '600' }}>{item.crop}</div>
                                            </td>
                                            <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{item.field}</td>
                                            <td style={{ padding: '16px' }}>{item.estimatedCosts.toLocaleString()}</td>
                                            <td style={{ padding: '16px', fontWeight: '600' }}>{item.actualCosts.toLocaleString()}</td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        flex: 1,
                                                        height: '8px',
                                                        backgroundColor: '#eee',
                                                        borderRadius: '4px',
                                                        overflow: 'hidden',
                                                        minWidth: '60px'
                                                    }}>
                                                        <div style={{
                                                            width: `${Math.min(percentage, 100)}%`,
                                                            height: '100%',
                                                            backgroundColor: percentage > 100 ? '#dc3545' : '#4caf50'
                                                        }} />
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{percentage.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            No cost data available yet. Start logging activities to see calculations.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Performance Analytics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Cost Distribution</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💡</div>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                                    AgriXP Logic: Tracking labor vs. input costs helps optimize your ROI per season.
                                </p>
                            </div>

                            <div style={{ marginTop: '10px' }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Budget Health</label>
                                <div style={{
                                    padding: '16px',
                                    borderRadius: '8px',
                                    backgroundColor: summary.totalEstimated >= summary.totalActual ? '#d4edda' : '#f8d7da',
                                    color: summary.totalEstimated >= summary.totalActual ? '#155724' : '#721c24',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    {summary.totalEstimated >= summary.totalActual
                                        ? '✅ You are currently operating within the estimated budget.'
                                        : '⚠️ Warning: Total actual costs have exceeded estimates.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ backgroundColor: '#1a1d21', color: 'white' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#4caf50' }}>Technical Tip</h3>
                        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#adb5bd' }}>
                            To get the most accurate **Production Costs**, ensure you log every **Activity** with both:
                            <br /><br />
                            1. **Labor Costs** (Wages paid)
                            <br />
                            2. **Inventory Used** (Seeds, Fertilizer, fuel)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, color, icon }) => (
    <div className="card" style={{ borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '20px', fontWeight: '800' }}>{value}</div>
        </div>
    </div>
);

export default ProductionCosts;
