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
                backgroundColor: '#fff5f5',
                borderRadius: '12px',
                border: '1px solid #fed7d7',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
            }}>
                <div style={{ fontSize: '32px' }}>📊</div>
                <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#c53030', fontSize: '18px' }}>Growth Cycles & Campaigns Summary</h3>
                    <p style={{ margin: 0, color: '#4a5568', fontSize: '14px' }}>
                        Consolidated view of all crop standards for the <strong>Maloure / Njimoun Zone</strong>.
                    </p>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#9b2c2c', color: 'white', textAlign: 'left' }}>
                            <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Category</th>
                            <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Crop</th>
                            <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Duration</th>
                            <th style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Campaigns</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #edf2f7', transition: 'background-color 0.2s' }} className="hover:bg-gray-50">
                                <td style={{ padding: '16px 24px', color: '#2d3748', fontWeight: '500' }}>{row.category}</td>
                                <td style={{ padding: '16px 24px', color: '#2d3748', fontWeight: '600' }}>{row.crop}</td>
                                <td style={{ padding: '16px 24px', color: '#4a5568' }}>{row.duration}</td>
                                <td style={{ padding: '16px 24px', color: '#4a5568' }}>{row.campaigns}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RegionalSummary;
