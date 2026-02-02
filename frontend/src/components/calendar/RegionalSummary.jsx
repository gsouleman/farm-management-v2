import React from 'react';
import { REGIONAL_CROP_DATA } from '../../data/regionalData';

const RegionalSummary = () => {
    // Flatten the data for the table
    const tableData = [];
    Object.keys(REGIONAL_CROP_DATA).forEach(category => {
        REGIONAL_CROP_DATA[category].forEach(crop => {
            tableData.push({
                category: category,
                crop: crop.crop,
                duration: crop.duration,
                campaigns: crop.campaigns
            });
        });
    });

    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>
            <div style={{
                marginBottom: '24px',
                padding: '20px',
                backgroundColor: 'var(--bg-main)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
            }}>
                <div style={{ fontSize: '32px' }}>📊</div>
                <div>
                    <h3 style={{ margin: '0 0 5px 0', color: 'var(--secondary)', fontSize: '18px' }}>Growth Cycles & Campaigns Summary</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
                        Consolidated view of all crop standards for the <strong>Maloure / Njimoun Zone</strong>.
                    </p>
                </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Category</th>
                            <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Crop</th>
                            <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Duration</th>
                            <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Campaigns</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} className="hover:bg-gray-50">
                                <td style={{ padding: '16px 24px', color: 'var(--text-main)', fontWeight: '500' }}>{row.category}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--secondary)', fontWeight: '600' }}>{row.crop}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{row.duration}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{row.campaigns}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RegionalSummary;
