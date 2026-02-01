import React, { useState } from 'react';
import useFarmStore from '../store/farmStore';
import api from '../services/api';
import useUIStore from '../store/uiStore';

const Reports = () => {
    const { currentFarm } = useFarmStore();
    const { showNotification } = useUIStore();
    const [loading, setLoading] = useState(false);

    const handleDownload = async (endpoint, filename) => {
        if (!currentFarm) return showNotification('Please select a farm first', 'error');
        setLoading(true);
        try {
            // Simulation for new reports if endpoint not ready
            if (endpoint.includes('simulation')) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                showNotification(`Report ${filename} generated successfully (Simulation).`, 'success');
                setLoading(false);
                return;
            }

            const response = await api.get(endpoint, {
                params: { farmId: currentFarm.id },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showNotification(`Report ${filename} generated successfully.`, 'success');
        } catch (error) {
            console.error('Report generation failed', error);
            showNotification('Failed to generate report. Please ensure the backend server is reachable.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', margin: '0 0 8px 0', color: 'var(--text-main)', fontWeight: '800' }}>Executive Reports & Intelligence</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                    Strategic insights, financial auditing, and operational compliance for {currentFarm?.name || 'your enterprise'}.
                </p>
            </div>

            {/* Investor Relations */}
            <div style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>STRATEGIC</span>
                    Investor Relations
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    <ReportCard
                        title="Investors Presentation"
                        desc="Consolidated pitch deck data including ROI, growth metrics, and market opportunity analysis."
                        icon="💼"
                        onClick={() => handleDownload('/reports/investor-deck?simulation=true', `InvestorPresentation_${currentFarm?.name}.pdf`)}
                        loading={loading}
                        isPrimary
                    />
                    <ReportCard
                        title="Growth & Capital Report"
                        desc="Capital utilization tracking and projected expansion models."
                        icon="📈"
                        onClick={() => handleDownload('/reports/growth?simulation=true', `GrowthReport_${currentFarm?.name}.pdf`)}
                        loading={loading}
                    />
                </div>
            </div>

            {/* Financial Intelligence */}
            <div style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '16px' }}>Financial Intelligence</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    <ReportCard
                        title="Comprehensive Financial Report"
                        desc="Full P&L statement, cash flow analysis, and balance sheet."
                        icon="💵"
                        onClick={() => handleDownload('/reports/financials?simulation=true', `FinancialReport_${currentFarm?.name}.pdf`)}
                        loading={loading}
                    />
                    <ReportCard
                        title="Crop Budget Analysis"
                        desc="Detailed breakdown of input costs vs expected harvest revenue per hectare."
                        icon="📊"
                        onClick={() => handleDownload('/reports/crop-budget', `CropBudget_${currentFarm?.name}.json`)}
                        loading={loading}
                    />
                </div>
            </div>

            {/* Risk & Compliance */}
            <div style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '16px' }}>Risk & Compliance</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    <ReportCard
                        title="Risk & Incident Report"
                        desc="Log of operational risks, safety incidents, and mitigation strategies."
                        icon="🛡️"
                        onClick={() => handleDownload('/reports/risk?simulation=true', `RiskReport_${currentFarm?.name}.pdf`)}
                        loading={loading}
                    />
                    <ReportCard
                        title="Compliance Audit Log"
                        desc="Complete historical log of all field operations for regulatory compliance."
                        icon="📋"
                        onClick={() => handleDownload('/reports/activity-log', `ActivityLog_${currentFarm?.name}.json`)}
                        loading={loading}
                    />
                </div>
            </div>

            {/* Operations */}
            <div style={{ marginBottom: '48px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '16px' }}>Operations</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    <ReportCard
                        title="Operations Report"
                        desc="Detailed breakdown of daily field activities, labor usage, and machinery utilization."
                        icon="🚜"
                        onClick={() => handleDownload('/reports/operations?simulation=true', `OperationsReport_${currentFarm?.name}.pdf`)}
                        loading={loading}
                    />
                    <ReportCard
                        title="Farm Summary"
                        desc="General overview of fields, active crops, and current season status."
                        icon="🌾"
                        onClick={() => handleDownload('/reports/farm-summary', `FarmSummary_${currentFarm?.name}.json`)}
                        loading={loading}
                    />
                    <ReportCard
                        title="Inventory Valuation"
                        desc="Current stock levels, valuation, and reorder alerts."
                        icon="📦"
                        onClick={() => handleDownload('/exports/excel', `Inventory_${currentFarm?.name}.xls`)}
                        loading={loading}
                    />
                </div>
            </div>

            <ProductionCostPreview farmId={currentFarm?.id} />
        </div>
    );
};

const ProductionCostPreview = ({ farmId }) => {
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (farmId) {
            setLoading(true);
            api.get('/reports/crop-budget', { params: { farmId } })
                .then(res => setData(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [farmId]);

    if (!farmId) return null;

    return (
        <div className="card" style={{ marginTop: '40px' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Live Cost Tracking Preview</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '16px' }}>CROP</th>
                            <th style={{ padding: '16px' }}>FIELD</th>
                            <th style={{ padding: '16px' }}>ESTIMATED</th>
                            <th style={{ padding: '16px' }}>ACTUAL</th>
                            <th style={{ padding: '16px' }}>VARIANCE</th>
                            <th style={{ padding: '16px' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading analysis...</td></tr>
                        ) : data.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                <td style={{ padding: '16px', fontWeight: '600' }}>{item.crop}</td>
                                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{item.field}</td>
                                <td style={{ padding: '16px' }}>{item.estimatedCosts?.toLocaleString()}</td>
                                <td style={{ padding: '16px' }}>{item.actualCosts?.toLocaleString()}</td>
                                <td style={{ padding: '16px', color: item.variance < 0 ? 'var(--error)' : 'var(--success)', fontWeight: '600' }}>
                                    {item.variance?.toLocaleString()}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        backgroundColor: item.variance < 0 ? 'rgba(211, 47, 47, 0.1)' : 'rgba(46, 125, 50, 0.1)',
                                        color: item.variance < 0 ? 'var(--error)' : 'var(--success)'
                                    }}>
                                        {item.variance < 0 ? 'OVER BUDGET' : 'ON TRACK'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && !loading && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No live tracking data available.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ReportCard = ({ title, desc, icon, onClick, loading, isPrimary }) => (
    <div
        className="card hover-glow"
        onClick={!loading ? onClick : null}
        style={{
            padding: '24px',
            cursor: loading ? 'wait' : 'pointer',
            border: isPrimary ? '1px solid var(--primary)' : '1px solid var(--border)',
            backgroundColor: isPrimary ? 'rgba(46, 125, 50, 0.02)' : 'white',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{ fontSize: '24px', marginBottom: '16px', opacity: loading ? 0.5 : 1 }}>{icon}</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>{title}</h3>
        <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5', flex: 1 }}>{desc}</p>

        <div style={{
            display: 'flex',
            alignItems: 'center',
            color: 'var(--primary)',
            fontSize: '13px',
            fontWeight: '600'
        }}>
            {loading ? 'Generating...' : 'Generate Report'}
            {!loading && <span style={{ marginLeft: '6px' }}>→</span>}
        </div>
    </div>
);

export default Reports;
