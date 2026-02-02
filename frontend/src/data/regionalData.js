// Full coordinate list for the Maloure / Njimoun Zone
export const MALOURE_ZONE_BOUNDARY = [
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
export const getCentroid = (coords) => {
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

export const ZONE_CENTER = getCentroid(MALOURE_ZONE_BOUNDARY);

export const REGIONAL_CROP_DATA = {
    Cereals: [
        { crop: 'Maize', duration: '4 Months', campaigns: '2 Campaigns', window: 'Mar - Jun / Aug - Nov', type: 'Staple (Njimom)' },
        { crop: 'Rice', duration: '5 Months', campaigns: '1-2 Campaigns', window: 'Year-round (Noun Plain)', type: 'Intensive' },
        { crop: 'Sorghum', duration: '4 Months', campaigns: '1 Campaign', window: 'Jun - Oct', type: 'Minor/Traditional' }
    ],
    Tubers: [
        { crop: 'Irish Potato', duration: '3-4 Months', campaigns: '2 Campaigns', window: 'Mar - Jun / Sep - Dec', type: 'High Value' },
        { crop: 'Cassava', duration: '12 Months', campaigns: '1-3 Campaigns', window: 'Year-round', type: 'Food Security' },
        { crop: 'Macabo (Cocoyam)', duration: '9-12 Months', campaigns: '1 Campaign', window: 'Mar - May', type: 'Traditional' },
        { crop: 'Yam', duration: '8 Months', campaigns: '1 Campaign', window: 'Nov - Mar', type: 'Seasonal' },
        { crop: 'Sweet Potato', duration: '4-5 Months', campaigns: '2 Campaigns', window: 'May - Sep', type: 'Cover Crop' }
    ],
    'Fruit Trees': [
        { crop: 'Avocado', duration: '2-3 Years (Grafted)', campaigns: 'Seasonal Harvest', window: 'Mar - Aug', type: 'High Demand' },
        { crop: 'Safou (African Plum)', duration: '3-4 Years (Grafted)', campaigns: 'Seasonal Harvest', window: 'Jun - Sep', type: 'Local Specialist' },
        { crop: 'Coffee (Arabica)', duration: '2-3 Years', campaigns: 'Annual Harvest', window: 'Oct - Dec', type: 'Cash Crop' },
        { crop: 'Mango', duration: '2-4 Years (Grafted)', campaigns: 'Seasonal Harvest', window: 'Mar - May', type: 'Tree Crop' },
        { crop: 'Kola Nut', duration: '4-5 Years (Grafted)', campaigns: 'Continuous', window: 'Year-round', type: 'Cultural' }
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
