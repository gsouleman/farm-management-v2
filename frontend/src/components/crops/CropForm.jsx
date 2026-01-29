import React, { useState } from 'react';
import useFarmStore from '../../store/farmStore';

const CropForm = ({ fieldId, onComplete }) => {
    const { createCrop } = useFarmStore();
    const [formData, setFormData] = useState({
        crop_type: '',
        variety: '',
        planting_date: new Date().toISOString().split('T')[0],
        expected_harvest_date: '',
        area_planted: 0
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createCrop({
                ...formData,
                field_id: fieldId
            });
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Start New Cultivation</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label>Crop Type</label>
                        <input
                            type="text"
                            placeholder="e.g. Corn, Wheat"
                            value={formData.crop_type}
                            onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Variety / Hybrid</label>
                        <input
                            type="text"
                            placeholder="e.g. DKC 62-08"
                            value={formData.variety}
                            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label>Planting Date</label>
                        <input
                            type="date"
                            value={formData.planting_date}
                            onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Exp. Harvest Date</label>
                        <input
                            type="date"
                            value={formData.expected_harvest_date}
                            onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label>Planted Area (ha)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.area_planted}
                        onChange={(e) => setFormData({ ...formData, area_planted: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                        {loading ? 'Initiating...' : 'Establish Crop'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default CropForm;
