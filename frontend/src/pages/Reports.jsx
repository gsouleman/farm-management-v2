import React, { useState } from 'react';
import useFarmStore from '../store/farmStore';
import api from '../services/api';

const Reports = () => {
    const { currentFarm } = useFarmStore();
    const [loading, setLoading] = useState(false);

    const handleDownload = async (endpoint, filename) => {
        if (!currentFarm) return alert('Please select a farm first');
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
        } catch (error) {
            console.error('Report generation failed', error);
            alert('Failed to generate report. Please ensure the backend is running.');
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
