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
        farm_type: 'crop_production',
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
        <div className="card animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Register New Agricultural Asset</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label>Enterprise Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Green Valley Estates"
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <label>Operation Type</label>
                        <select
                            value={formData.farm_type}
                            onChange={(e) => setFormData({ ...formData, farm_type: e.target.value })}
                        >
                            <option value="crop_production">Crop Production</option>
                            <option value="livestock">Livestock / Animals</option>
                            <option value="mixed">Mixed Farming</option>
                            <option value="orchard">Orchard / Fruit</option>
                        </select>
                    </div>
                    <div>
                        <label>Country</label>
                        <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            placeholder="e.g. Canada"
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Primary Location Address</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Street, Rural Route, or Lot #"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <label>Base Latitude</label>
                        <input
                            type="text"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            placeholder="e.g. 45.4215"
                            required
                        />
                    </div>
                    <div>
                        <label>Base Longitude</label>
                        <input
                            type="text"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            placeholder="e.g. -75.6972"
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                        {loading ? 'Registering...' : 'Complete Registration'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Discard</button>
                </div>
            </form>
        </div>
    );
};

export default FarmForm;
