import React from 'react';
import useFarmStore from '../store/farmStore';

const Reports = () => {
    const { currentFarm } = useFarmStore();

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', margin: 0 }}>Farm Intelligence & Reports</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Analytical summaries and financial reports for {currentFarm?.name}.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                <ReportCard
                    title="Farm Summary Report"
                    desc="Overview of all fields, crops, and current operational status."
                    icon="📊"
                />
                <ReportCard
                    title="Crop Budget Analysis"
                    desc="Detailed breakdown of input costs vs expected harvest revenue."
                    icon="💰"
                />
                <ReportCard
                    title="Activity Log Export"
                    desc="Complete historical log of all field operations for compliance."
                    icon="📋"
                />
                <ReportCard
                    title="Inventory Status"
                    desc="Current stock levels and low-stock alerts for all inputs."
                    icon="📦"
                />
            </div>

            <div className="card" style={{ marginTop: '40px', textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa' }}>
                <h3 style={{ marginBottom: '16px' }}>Select data format for Export</h3>
                <div className="flex j-center gap-16">
                    <button className="outline">Export PDF</button>
                    <button className="outline">Export Excel (CSV)</button>
                    <button className="outline">Export GeoJSON</button>
                    <button className="primary">Generate Live Report</button>
                </div>
            </div>
        </div>
    );
};

const ReportCard = ({ title, desc, icon }) => (
    <div className="card hover-glow" style={{ padding: '24px', cursor: 'pointer' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>{icon}</div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5' }}>{desc}</p>
        <button className="outline" style={{ marginTop: '20px', width: '100%', fontSize: '12px' }}>Download Report</button>
    </div>
);

export default Reports;
