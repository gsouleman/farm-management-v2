import React, { useState } from 'react';
import RegionalCycleChart from './RegionalCycleChart';

import { REGIONAL_CROP_DATA, ZONE_CENTER } from '../../data/regionalData';

const RegionalIntelligence = ({ currentFarm }) => {
    const [activeTab, setActiveTab] = useState('Cereals');

    // Usage: Strictly use the Zone Center for Regional Intelligence default
    // The user requested to "Use only the coordinate provided for all details"
    const displayCoordinates = ZONE_CENTER;

    return (
        <div className="animate-fade-in" style={{ padding: '0 10px' }}>
            <div style={{
                marginBottom: '24px',
                padding: '20px',
                backgroundColor: '#ebf8ff',
                borderRadius: '12px',
                border: '1px solid #bee3f8',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
            }}>
                <div style={{ fontSize: '32px' }}>🌍</div>
                <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#2b6cb0', fontSize: '18px' }}>Regional Intelligence: Maloure / Njimoun Zone</h3>
                    <p style={{ margin: 0, color: '#4a5568', fontSize: '14px' }}>
                        Based on the <strong>Western Region</strong> boundary defined by coordinates <strong>{displayCoordinates.lat.toFixed(6)}, {displayCoordinates.lng.toFixed(6)}</strong>.
                        These standards are optimized for this specific agricultural zone.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                {Object.keys(REGIONAL_CROP_DATA).map(group => (
                    <button
                        key={group}
                        onClick={() => setActiveTab(group)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: activeTab === group ? 'var(--primary)' : '#e2e8f0',
                            color: activeTab === group ? 'white' : '#4a5568',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {group}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {REGIONAL_CROP_DATA[activeTab].map((crop, idx) => (
                    <div key={idx} className="card hover-glow" style={{ padding: '20px', borderRadius: '16px', borderLeft: '5px solid var(--primary)' }}>
                        <div className="flex j-between a-start" style={{ marginBottom: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#2d3748' }}>{crop.crop}</h3>
                            <span style={{
                                fontSize: '10px',
                                padding: '2px 8px',
                                backgroundColor: '#edf2f7',
                                borderRadius: '10px',
                                color: '#718096',
                                fontWeight: 'bold'
                            }}>
                                {crop.type}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div className="flex j-between">
                                <span style={{ color: '#718096', fontSize: '13px' }}>Duration</span>
                                <span style={{ fontWeight: '600', fontSize: '14px' }}>{crop.duration}</span>
                            </div>
                            <div className="flex j-between">
                                <span style={{ color: '#718096', fontSize: '13px' }}>Campaigns</span>
                                <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--primary)' }}>{crop.campaigns}</span>
                            </div>
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                                <span style={{ display: 'block', color: '#718096', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Optimal Window</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>📅</span>
                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{crop.window}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Growth Cycle Chart */}
            <RegionalCycleChart data={REGIONAL_CROP_DATA[activeTab]} category={activeTab} />
        </div>
    );
};

export default RegionalIntelligence;
