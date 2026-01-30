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
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', margin: 0 }}>Farm Intelligence & Reports</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Analytical summaries and financial reports for {currentFarm?.name || 'your farm'}.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                <ReportCard
                    title="Farm Summary Report"
                    desc="Overview of all fields, crops, and current operational status."
                    icon="📊"
                    onClick={() => handleDownload('/reports/farm-summary', `FarmSummary_${currentFarm?.name || 'Farm'}.json`)}
                    disabled={loading}
                />
                <ReportCard
                    title="Crop Budget Analysis"
                    desc="Detailed breakdown of input costs vs expected harvest revenue."
                    icon="💰"
                    onClick={() => handleDownload('/reports/crop-budget', `CropBudget_${currentFarm?.name || 'Farm'}.json`)}
                    disabled={loading}
                />
                <ReportCard
                    title="Activity Log Export"
                    desc="Complete historical log of all field operations for compliance."
                    icon="📋"
                    onClick={() => handleDownload('/reports/activity-log', `ActivityLog_${currentFarm?.name || 'Farm'}.json`)}
                    disabled={loading}
                />
                <ReportCard
                    title="Inventory Status"
                    desc="Current stock levels and low-stock alerts for all inputs."
                    icon="📦"
                    onClick={() => handleDownload('/exports/excel', `Inventory_${currentFarm?.name || 'Farm'}.xls`)}
                    disabled={loading}
                />
            </div>

            <ProductionCostPreview farmId={currentFarm?.id} />

            <div className="card" style={{ marginTop: '40px', textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa' }}>
                <h3 style={{ marginBottom: '16px' }}>Advanced Geospatial & Data Export</h3>
                <div className="flex j-center gap-16 wrap">
                    <button className="outline" onClick={() => handleDownload('/exports/fields/geojson', 'Fields.geojson')} disabled={loading}>Export GeoJSON</button>
                    <button className="outline" onClick={() => handleDownload('/exports/fields/shapefile', 'Fields.zip')} disabled={loading}>Export Shapefile</button>
                    <button className="outline" onClick={() => handleDownload('/exports/excel', 'FarmData.xlsx')} disabled={loading}>Export Excel</button>
                    <button className="primary" onClick={() => handleDownload('/reports/farm-summary', 'FullReport.json')} disabled={loading}>
                        {loading ? 'Processing...' : 'Generate Live Report'}
                    </button>
                </div>
            </div>
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
                <h3 style={{ margin: 0, fontSize: '18px' }}>Production Cost Analysis (Estimated vs Actual)</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '16px' }}>Crop</th>
                            <th style={{ padding: '16px' }}>Field</th>
                            <th style={{ padding: '16px' }}>Estimated (XAF)</th>
                            <th style={{ padding: '16px' }}>Actual (XAF)</th>
                            <th style={{ padding: '16px' }}>Variance</th>
                            <th style={{ padding: '16px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading analysis...</td></tr>
                        ) : data.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>{item.crop}</td>
                                <td style={{ padding: '16px' }}>{item.field}</td>
                                <td style={{ padding: '16px' }}>{item.estimatedCosts.toLocaleString()}</td>
                                <td style={{ padding: '16px' }}>{item.actualCosts.toLocaleString()}</td>
                                <td style={{ padding: '16px', color: item.variance < 0 ? '#dc3545' : '#28a745' }}>
                                    {item.variance.toLocaleString()}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        backgroundColor: item.variance < 0 ? '#f8d7da' : '#d4edda',
                                        color: item.variance < 0 ? '#721c24' : '#155724'
                                    }}>
                                        {item.variance < 0 ? 'OVER BUDGET' : 'ON TRACK'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && !loading && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No crop data available for analysis.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ReportCard = ({ title, desc, icon, onClick, disabled }) => (
    <div className="card hover-glow" style={{ padding: '24px', cursor: 'pointer' }} onClick={!disabled ? onClick : null}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>{icon}</div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5' }}>{desc}</p>
        <button className="outline" style={{ marginTop: '20px', width: '100%', fontSize: '12px' }} disabled={disabled}>
            {disabled ? 'Generating...' : 'Download Report'}
        </button>
    </div>
);

export default Reports;
