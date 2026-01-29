import React, { useState } from 'react';
import useFarmStore from '../../store/farmStore';

const FarmForm = ({ onComplete }) => {
    const { createFarm } = useFarmStore();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        farm_type: 'crop_production',
        total_area: '',
        area_unit: 'hectares',
        latitude: '',
        longitude: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createFarm(formData);
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Register New Agricultural Enterprise</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label>Business Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Green Valley Farm"
                            required
                        />
                    </div>
                    <div>
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
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Street Address</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Rural Route or Physical Address"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <label>City</label>
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>State / Province</label>
                        <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Postal Code</label>
                        <input
                            type="text"
                            value={formData.postal_code}
                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label>Country</label>
                        <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Total Size</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.total_area}
                            onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Area Unit</label>
                        <select
                            value={formData.area_unit}
                            onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                        >
                            <option value="hectares">Hectares (ha)</option>
                            <option value="acres">Acres (ac)</option>
                            <option value="sq_meters">Sq Meters (m²)</option>
                        </select>
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#f8f9fa', borderStyle: 'dashed' }}>
                    <label style={{ color: 'var(--primary)', fontWeight: '700' }}>🗺️ Geographic Center (Coordinates)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                        <div>
                            <label style={{ fontSize: '11px' }}>Latitude</label>
                            <input
                                type="text"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                placeholder="e.g. 45.4215"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>Longitude</label>
                            <input
                                type="text"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                placeholder="e.g. -75.6972"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                        {loading ? 'Processing...' : 'Register Farm'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default FarmForm;
