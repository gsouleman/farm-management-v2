import React, { useState } from 'react';
import RegionalCycleChart from './RegionalCycleChart';

const REGIONAL_CROP_DATA = {
    Cereals: [
        { crop: 'Maize', duration: '4 Months', campaigns: '2-3 Campaigns', window: 'Mar - Jun / Aug - Nov', type: 'Optimal' },
        { crop: 'Corn', duration: '4 Months', campaigns: '2-3 Campaigns', window: 'Mar - Jun / Aug - Nov', type: 'Optimal' },
        { crop: 'Rice', duration: '5 Months', campaigns: '2-3 Campaigns', window: 'Year-round', type: 'Intensive' },
        { crop: 'Wheat', duration: '5 Months', campaigns: '2-3 Campaigns', window: 'Nov - Mar', type: 'Cool Season' },
        { crop: 'Sorghum', duration: '4 Months', campaigns: '2-3 Campaigns', window: 'Mar - Jun', type: 'Drought Resistant' },
        { crop: 'Millet', duration: '3 Months', campaigns: '2-3 Campaigns', window: 'May - Aug', type: 'Short Cycle' }
    ],
    Tubers: [
        { crop: 'Cassava', duration: '12 Months', campaigns: '1-3 Campaigns', window: 'Year-round', type: 'Long Cycle' },
        { crop: 'Yam', duration: '8 Months', campaigns: '1-3 Campaigns', window: 'Nov - Jun', type: 'Seasonal' },
        { crop: 'Potato', duration: '3 Months', campaigns: '1-3 Campaigns', window: 'Nov - Feb', type: 'High Altitude' }
    ],
    Fruit: [
        { crop: 'Banana', duration: '9-12 Months', campaigns: 'Continuous', window: 'Year-round', type: 'Perennial' },
        { crop: 'Pineapple', duration: '14-18 Months', campaigns: '1 Campaign', window: 'Year-round', type: 'Biennial' },
        { crop: 'Papaya', duration: '6-9 Months', campaigns: 'Continuous', window: 'Year-round', type: 'Fast Growth' }
    ],
    Legumes: [
        { crop: 'Beans', duration: '2-3 Months', campaigns: '3-4 Campaigns', window: 'Mar - May / Sep - Nov', type: 'Nitrogen Fixer' },
        { crop: 'Soybean', duration: '3-4 Months', campaigns: '2 Campaigns', window: 'Mar - Jun', type: 'Industrial' },
        { crop: 'Groundnut', duration: '4 Months', campaigns: '2 Campaigns', window: 'May - Sep', type: 'Cover Crop' }
    ]
};

const RegionalIntelligence = ({ currentFarm }) => {
    const [activeTab, setActiveTab] = useState('Cereals');

    // Mock coordinates if farm doesn't have them
    const coordinates = currentFarm?.location?.coordinates || { lat: 4.05, lng: 9.70 }; // Default to Douala/Cameroon region approx

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
                    <h3 style={{ margin: '0 0 5px 0', color: '#2b6cb0', fontSize: '18px' }}>Regional Intelligence for {currentFarm?.name}</h3>
                    <p style={{ margin: 0, color: '#4a5568', fontSize: '14px' }}>
                        Based on coordinates <strong>{coordinates.lat?.toFixed(4)}, {coordinates.lng?.toFixed(4)}</strong> within the <strong>Littoral Zone</strong>.
                        These are the recommended standards for optimal yield.
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
