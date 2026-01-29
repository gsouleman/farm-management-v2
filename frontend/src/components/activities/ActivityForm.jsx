import React, { useState } from 'react';
import api from '../../services/api';

const ActivityForm = ({ fieldId, cropId, onComplete }) => {
    const [formData, setFormData] = useState({
        activity_type: 'seeding',
        activity_date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'done'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/activities', {
                ...formData,
                field_id: fieldId,
                crop_id: cropId
            });
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Log Operation</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label>Activity Type</label>
                    <select
                        value={formData.activity_type}
                        onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                        required
                    >
                        <option value="seeding">Seeding / Planting</option>
                        <option value="irrigation">Irrigation</option>
                        <option value="fertilization">Fertilization</option>
                        <option value="pesticide">Pesticide Application</option>
                        <option value="scouting">Scouting</option>
                        <option value="harvesting">Harvesting</option>
                        <option value="tillage">Tillage</option>
                    </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label>Date of Operation</label>
                    <input
                        type="date"
                        value={formData.activity_date}
                        onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                        required
                    />
                </div>
                <div style={{ marginBottom: '24px' }}>
                    <label>Work Description / Notes</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Details about the operation..."
                        rows="4"
                        style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Save Log'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ActivityForm;
