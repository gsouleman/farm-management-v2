import React, { useState } from 'react';
import RegionalCycleChart from './RegionalCycleChart';

// Full coordinate list for the Maloure / Njimoun Zone
const MALOURE_ZONE_BOUNDARY = [
    { lat: 5.916982, lng: 11.043742 },
    { lat: 5.916900, lng: 11.043799 },
    { lat: 5.916782, lng: 11.043831 },
    { lat: 5.916697, lng: 11.043867 },
    { lat: 5.916613, lng: 11.043936 },
    { lat: 5.916517, lng: 11.043929 },
    { lat: 5.916437, lng: 11.043976 },
    { lat: 5.916115, lng: 11.044077 },
    { lat: 5.916020, lng: 11.044109 },
    { lat: 5.915929, lng: 11.044099 },
    { lat: 5.915125, lng: 11.043647 },
    { lat: 5.915238, lng: 11.043546 },
    { lat: 5.915256, lng: 11.043455 },
    { lat: 5.915182, lng: 11.043350 },
    { lat: 5.915284, lng: 11.043182 },
    { lat: 5.915373, lng: 11.043159 },
    { lat: 5.915403, lng: 11.043061 },
    { lat: 5.915478, lng: 11.042981 },
    { lat: 5.915540, lng: 11.042902 },
    { lat: 5.915534, lng: 11.042803 },
    { lat: 5.915590, lng: 11.042720 },
    { lat: 5.915636, lng: 11.042568 },
    { lat: 5.915782, lng: 11.042593 },
    { lat: 5.915728, lng: 11.042490 },
    { lat: 5.915781, lng: 11.042401 },
    { lat: 5.915875, lng: 11.042403 },
    { lat: 5.916010, lng: 11.042282 },
    { lat: 5.916124, lng: 11.042298 },
    { lat: 5.916186, lng: 11.042372 },
    { lat: 5.916285, lng: 11.042421 },
    { lat: 5.916379, lng: 11.042475 },
    { lat: 5.916413, lng: 11.042574 },
    { lat: 5.916504, lng: 11.042636 },
    { lat: 5.916574, lng: 11.042693 },
    { lat: 5.916661, lng: 11.042756 },
    { lat: 5.916920, lng: 11.043128 },
    { lat: 5.917008, lng: 11.043099 },
    { lat: 5.917022, lng: 11.043211 },
    { lat: 5.917050, lng: 11.043316 },
    { lat: 5.917080, lng: 11.043421 },
    { lat: 5.917047, lng: 11.043509 },
    { lat: 5.917074, lng: 11.043622 },
    { lat: 5.916943, lng: 11.043740 }
];

// Calculate Representative Point (Centroid approx)
const getCentroid = (coords) => {
    let latSum = 0;
    let lngSum = 0;
    coords.forEach(c => {
        latSum += c.lat;
        lngSum += c.lng;
    });
    return {
        lat: latSum / coords.length,
        lng: lngSum / coords.length
    };
};

const ZONE_CENTER = getCentroid(MALOURE_ZONE_BOUNDARY);

const REGIONAL_CROP_DATA = {
    Cereals: [
        { crop: 'Maize', duration: '4 Months', campaigns: '2 Campaigns', window: 'Mar - Jun / Aug - Nov', type: 'Staple (Njimom)' },
        { crop: 'Rice', duration: '5 Months', campaigns: '1-2 Campaigns', window: 'Year-round (Noun Plain)', type: 'Intensive' }
    ],
    Tubers: [
        { crop: 'Irish Potato', duration: '3-4 Months', campaigns: '2 Campaigns', window: 'Mar - Jun / Sep - Dec', type: 'High Value' },
        { crop: 'Cassava', duration: '12 Months', campaigns: '1-3 Campaigns', window: 'Year-round', type: 'Food Security' },
        { crop: 'Macabo (Cocoyam)', duration: '9-12 Months', campaigns: '1 Campaign', window: 'Mar - May', type: 'Traditional' },
        { crop: 'Yam', duration: '8 Months', campaigns: '1 Campaign', window: 'Nov - Mar', type: 'Seasonal' },
        { crop: 'Sweet Potato', duration: '4-5 Months', campaigns: '2 Campaigns', window: 'May - Sep', type: 'Cover Crop' }
    ],
    'Fruit Trees': [
        { crop: 'Avocado', duration: 'Perennial', campaigns: 'Seasonal Harvest', window: 'Mar - Aug', type: 'High Demand' },
        { crop: 'Safou (African Plum)', duration: 'Perennial', campaigns: 'Seasonal Harvest', window: 'Jun - Sep', type: 'Local Specialist' },
        { crop: 'Coffee (Arabica)', duration: 'Perennial', campaigns: 'Annual Harvest', window: 'Oct - Dec', type: 'Cash Crop' },
        { crop: 'Mango', duration: 'Perennial', campaigns: 'Seasonal Harvest', window: 'Mar - May', type: 'Tree Crop' },
        { crop: 'Kola Nut', duration: 'Perennial', campaigns: 'Continuous', window: 'Year-round', type: 'Cultural' }
    ],
    Fruits: [
        { crop: 'Banana', duration: '9-12 Months', campaigns: 'Continuous', window: 'Year-round', type: 'Staple Fruit' },
        { crop: 'Plantain', duration: '12-14 Months', campaigns: 'Continuous', window: 'Year-round', type: 'Food Crop' },
        { crop: 'Pineapple', duration: '14-18 Months', campaigns: '1 Campaign', window: 'Year-round', type: 'Biennial' },
        { crop: 'Papaya', duration: '6-9 Months', campaigns: 'Continuous', window: 'Year-round', type: 'Fast Growth' },
        { crop: 'Watermelon', duration: '3 Months', campaigns: '2-3 Campaigns', window: 'Oct - Dec / Feb - Apr', type: 'Short Cycle' }
    ],
    Legumes: [
        { crop: 'Common Bean', duration: '2-3 Months', campaigns: '2-3 Campaigns', window: 'Mar - May / Aug - Nov', type: 'Key Protein' },
        { crop: 'Groundnut (Peanut)', duration: '4 Months', campaigns: '2 Campaigns', window: 'Mar - Jul', type: 'Oil/Food' },
        { crop: 'Soybean', duration: '3-4 Months', campaigns: '1 Campaign', window: 'Mar - Jun', type: 'Industrial' }
    ]
};

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
