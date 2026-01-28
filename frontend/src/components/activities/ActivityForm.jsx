import React, { useState } from 'react';
import api from '../../services/api';

const ActivityForm = ({ fieldId, cropId, onComplete }) => {
    const [formData, setFormData] = useState({
        activity_type: '',
        activity_date: new Date().toISOString().split('T')[0],
        description: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/activities', { ...formData, field_id: fieldId, crop_id: cropId });
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card animate-fade-in">
            <h3 style={{ marginBottom: '20px' }}>Record Activity</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Activity Type</label>
                    <select
                        value={formData.activity_type}
                        onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    >
                        <option value="">Select Activity</option>
                        <option value="planting">Planting</option>
                        <option value="fertilizing">Fertilizing</option>
                        <option value="spraying">Spraying</option>
                        <option value="harvesting">Harvesting</option>
                        <option value="tillage">Tillage</option>
                        <option value="irrigation">Irrigation</option>
                    </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Date</label>
                    <input
                        type="date"
                        value={formData.activity_date}
                        onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows="3"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                        placeholder="What exactly was done?"
                    ></textarea>
                </div>

                <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Recording...' : 'Save Activity'}
                </button>
            </form>
        </div>
    );
};

export default ActivityForm;
