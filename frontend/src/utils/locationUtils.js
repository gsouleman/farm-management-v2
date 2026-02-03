/**
 * Utility to determine Cameroon region based on coordinates.
 */

const REGIONS = [
    { name: 'Far North', latRange: [10.0, 13.1], lngRange: [13.5, 15.2], center: [10.6, 14.3] },
    { name: 'North', latRange: [7.5, 10.0], lngRange: [12.5, 15.8], center: [9.3, 13.4] },
    { name: 'Adamaoua', latRange: [5.8, 7.5], lngRange: [11.3, 15.0], center: [7.3, 13.6] },
    { name: 'East', latRange: [2.0, 5.8], lngRange: [12.5, 16.2], center: [4.6, 13.7] },
    { name: 'Center', latRange: [3.2, 5.2], lngRange: [10.5, 12.8], center: [3.8, 11.5] },
    { name: 'South', latRange: [2.0, 3.5], lngRange: [9.8, 13.5], center: [2.9, 11.1] },
    { name: 'Littoral', latRange: [3.4, 4.8], lngRange: [9.0, 10.5], center: [4.0, 9.7] },
    { name: 'West', latRange: [4.9, 6.0], lngRange: [9.8, 11.2], center: [5.5, 10.4] },
    { name: 'Northwest', latRange: [5.7, 7.2], lngRange: [9.3, 11.2], center: [5.9, 10.1] },
    { name: 'Southwest', latRange: [3.9, 6.0], lngRange: [8.5, 9.8], center: [4.1, 9.2] },
];

/**
 * Calculates distance between two points (Euclidean for simplicity)
 */
const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
};

export const getCameroonRegion = (lat, lng) => {
    if (!lat || !lng) return 'Unknown';

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // 1. Try bounding box first (precise match)
    for (const region of REGIONS) {
        if (latitude >= region.latRange[0] && latitude <= region.latRange[1] &&
            longitude >= region.lngRange[0] && longitude <= region.lngRange[1]) {
            return region.name;
        }
    }

    // 2. Optimization: Find nearest center if bounding box fails or overlaps
    let nearestRegion = 'Center';
    let minDistance = Infinity;

    for (const region of REGIONS) {
        const d = getDistance([latitude, longitude], region.center);
        if (d < minDistance) {
            minDistance = d;
            nearestRegion = region.name;
        }
    }

    return nearestRegion;
};
