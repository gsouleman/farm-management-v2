import React, { useState, useEffect } from 'react';
import useFarmStore from '../../store/farmStore';
import useCropStore from '../../store/cropStore';
import api from '../../services/api';
import FormHeader from '../common/FormHeader';

const ContractForm = ({ onComplete }) => {
    const { currentFarm } = useFarmStore();
    const { crops, fetchCropsByFarm } = useCropStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        contract_type: 'sales',
        partner_name: '',
        crop_id: '',
        quantity: '',
        unit: 'kg',
        price_per_unit: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'draft',
        delivery_terms: '',
        payment_terms: '',
        notes: ''
    });

    useEffect(() => {
        if (currentFarm?.id) {
            fetchCropsByFarm(currentFarm.id);
        }
    }, [currentFarm]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const total_value = parseFloat(formData.quantity) * parseFloat(formData.price_per_unit);

        const payload = {
            ...formData,
            farm_id: currentFarm.id,
            total_value: isNaN(total_value) ? 0 : total_value
        };

        try {
            await api.post('/contracts', payload);
            alert('Contract created successfully!');
            onComplete();
        } catch (error) {
            console.error(error);
            alert('Failed to create contract.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '0' }}>
            <FormHeader
                title="Create New Contract"
                subtitle="Record official trade agreements and delivery obligations"
                onBack={onComplete}
                icon="📜"
            />
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>CONTRACT TYPE</label>
                        <select
                            name="contract_type"
                            value={formData.contract_type}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="sales">Sales (Selling Crop)</option>
                            <option value="purchase">Purchase (Buying Input)</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>PARTNER NAME</label>
                        <input
                            type="text"
                            name="partner_name"
                            value={formData.partner_name}
                            onChange={handleChange}
                            required
                            placeholder="Client or Supplier Name"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>RELATED CROP (OPTIONAL)</label>
                        <select
                            name="crop_id"
                            value={formData.crop_id}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">-- General / None --</option>
                            {crops.map(crop => (
                                <option key={crop.id} value={crop.id}>{crop.crop_type} ({crop.variety})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>STATUS</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>QUANTITY</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                            step="0.01"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>UNIT</label>
                        <input
                            type="text"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            required
                            placeholder="kg, tons, etc."
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>PRICE PER UNIT (XAF)</label>
                        <input
                            type="number"
                            name="price_per_unit"
                            value={formData.price_per_unit}
                            onChange={handleChange}
                            required
                            step="0.01"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>START DATE</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>END DATE</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #eee', width: '100%' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>PAYMENT TERMS</label>
                        <textarea
                            name="payment_terms"
                            value={formData.payment_terms}
                            onChange={handleChange}
                            rows={3}
                            placeholder="e.g. 50% advance, 50% on delivery"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>DELIVERY TERMS</label>
                        <textarea
                            name="delivery_terms"
                            value={formData.delivery_terms}
                            onChange={handleChange}
                            rows={3}
                            placeholder="e.g. FOB Farm Gate"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>NOTES</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={2}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px' }}>
                    <button
                        type="button"
                        className="outline"
                        onClick={onComplete}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="primary"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Contract'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContractForm;
