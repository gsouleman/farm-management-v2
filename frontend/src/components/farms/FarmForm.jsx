import React, { useState, useEffect } from 'react';
import useFarmStore from '../../store/farmStore';
import useUIStore from '../../store/uiStore';

const FarmForm = ({ onComplete, initialData }) => {
    const { createFarm, updateFarm } = useFarmStore();
    const { showAlert, showNotification } = useUIStore();

    // Parse initial coordinates to string for resizing/editing
    const getInitialCoordsText = () => {
        if (!initialData?.boundary_coordinates) return '';
        if (Array.isArray(initialData.boundary_coordinates)) {
            return initialData.boundary_coordinates.map(p => `${p.lat}, ${p.lng}`).join('\n');
        }
        return '';
    };

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        address: initialData?.address || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        country: initialData?.country || '',
        postal_code: initialData?.postal_code || '',
        farm_type: initialData?.farm_type || 'crop_production',
        total_area: initialData?.total_area || '',
        area_unit: initialData?.area_unit || 'hectares',
        latitude: initialData?.latitude || initialData?.coordinates?.coordinates?.[1] || '',
        longitude: initialData?.longitude || initialData?.coordinates?.coordinates?.[0] || '',
        perimeter: initialData?.perimeter || '',
        boundary_coordinates: initialData?.boundary_coordinates ||
            (initialData?.boundary?.coordinates?.[0]?.map(coord => ({ lat: coord[1], lng: coord[0] })) || [])
    });

    const [coordsText, setCoordsText] = useState(getInitialCoordsText());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setCoordsText(getInitialCoordsText());
        }
    }, [initialData]);

    const calculateMetrics = (text) => {
        // Split by newline first
        const lines = text.trim().split(/\r?\n/);
        const points = lines.map(line => {
            // Flexible delimiter: comma, space, tab
            const parts = line.split(/[,\s\t]+/).filter(v => v.trim() !== '');
            if (parts.length < 2) return null;
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            return { lat, lng };
        }).filter(p => p && !isNaN(p.lat) && !isNaN(p.lng));

        if (points.length < 3) return;

        // Radius of Earth in meters
        const R = 6371000;

        // 1. Perimeter Calculation (Haversine)
        let totalPerimeter = 0;
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];

            const dLat = (p2.lat - p1.lat) * Math.PI / 180;
            const dLon = (p2.lng - p1.lng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            totalPerimeter += R * c;
        }

        // 2. Area Calculation (Shoelace on projected coords)
        // Simplified planar projection for area (accurate enough for farms)
        const avgLat = points.reduce((acc, p) => acc + p.lat, 0) / points.length;
        const latRatio = 111320; // meters per degree lat
        const lngRatio = 111320 * Math.cos(avgLat * Math.PI / 180);

        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const x1 = p1.lng * lngRatio;
            const y1 = p1.lat * latRatio;
            const x2 = p2.lng * lngRatio;
            const y2 = p2.lat * latRatio;
            area += (x1 * y2 - x2 * y1);
        }
        area = Math.abs(area) / 2;

        const areaHa = (area / 10000).toFixed(2);

        setFormData(prev => ({
            ...prev,
            total_area: areaHa,
            area_unit: 'hectares',
            latitude: points[0].lat.toString(),
            longitude: points[0].lng.toString(),
            perimeter: (totalPerimeter / 1000).toFixed(2), // km
            boundary_coordinates: points.map(p => ({ lat: p.lat, lng: p.lng }))
        }));
    };

    const handleCoordsChange = (e) => {
        const text = e.target.value;
        setCoordsText(text);
        calculateMetrics(text);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Allow update without boundary change if it's already set
        if ((!formData.boundary_coordinates || formData.boundary_coordinates.length === 0) && !initialData) {
            showAlert('NO_BOUNDARY');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                total_area: parseFloat(formData.total_area),
                perimeter: parseFloat(formData.perimeter)
            };

            if (initialData?.id) {
                // UPDATE MODE
                await updateFarm(initialData.id, payload);
                showNotification('Farm details updated successfully (Size/Boundary adjusted)', 'success');
            } else {
                // CREATE MODE
                const response = await createFarm(payload);
                showNotification(response?.notification?.message || 'Farm registered successfully', 'success');
            }
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
            showAlert('SAVE_FAILURE');
        } finally {
            setLoading(false);
        }
    };

    const isNew = !initialData;

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                    {initialData ? 'Update Enterprise Profile' : 'Register New Agricultural Farm'}
                </h3>
            </div>
            <p style={{ padding: '0 24px', fontSize: '13px', color: '#666' }}>
                {isNew ? 'Enter basic identity details to initialize your farm container.' : 'Refine enterprise details and high-level categorization.'}
            </p>
            <form onSubmit={handleSubmit}>
                <div style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label>Business Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Green Valley Farm"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label>Operation Type</label>
                        <select
                            value={formData.farm_type}
                            onChange={(e) => setFormData({ ...formData, farm_type: e.target.value })}
                        >
                            <option value="crop_production">Field Crops</option>
                            <option value="livestock">Livestock / Animals</option>
                            <option value="mixed">Mixed Operations</option>
                            <option value="orchard">Orchard / Fruit</option>
                            <option value="vineyard">Vineyard</option>
                        </select>
                    </div>

                    {!isNew && (
                        <div className="animate-fade-in">
                            <div style={{ marginBottom: '20px' }}>
                                <label>Street Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Rural Route or Physical Address"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label>City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Country</label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                        <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Processing...' : (initialData ? 'Update Profile' : 'Quick Register Farm')}
                        </button>
                        <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Cancel</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FarmForm;
