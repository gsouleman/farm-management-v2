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
        latitude: '',
        longitude: '',
        total_area: '',
        area_unit: 'hectares',
        farm_type: ''
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
        <div className="glass-card animate-fade-in">
            <h3 style={{ marginBottom: '20px' }}>Add New Farm</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Farm Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Latitude</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Longitude</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Total Area</label>
                        <input
                            type="number"
                            value={formData.total_area}
                            onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Unit</label>
                        <select
                            value={formData.area_unit}
                            onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        >
                            <option value="hectares">Hectares</option>
                            <option value="acres">Acres</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Farm'}
                </button>
            </form>
        </div>
    );
};

export default FarmForm;
