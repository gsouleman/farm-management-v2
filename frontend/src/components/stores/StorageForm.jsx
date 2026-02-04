import React, { useState, useEffect } from 'react';
import useInfrastructureStore from '../../store/infrastructureStore';
import useFarmStore from '../../store/farmStore';
import useActivityStore from '../../store/activityStore';

const StorageForm = ({ farmId, onComplete, initialData = null }) => {
    const { createInfrastructure, updateInfrastructure, loading, error } = useInfrastructureStore();
    const { fields } = useFarmStore();
    const { logActivity } = useActivityStore();
    const [formData, setFormData] = useState({
        name: '',
        type: 'Asset', // Changed from Storage to Asset
        status: 'operational',
        area_sqm: '', // Capacity
        notes: '',
        sub_type: 'Machinery',
        field_id: '',
        acquisition_cost: '',
        purchase_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                type: initialData.type || 'Asset',
                status: initialData.status || 'operational',
                area_sqm: initialData.area_sqm || '',
                notes: initialData.notes || '',
                sub_type: initialData.sub_type || 'Machinery',
                field_id: initialData.field_id || '',
                acquisition_cost: initialData.acquisition_cost || '',
                purchase_date: initialData.purchase_date || new Date().toISOString().split('T')[0]
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Normalize numeric fields: empty strings or NaN should be null for the backend
            const parseNum = (val) => {
                if (val === '' || val === null || val === undefined) return null;
                const parsed = parseFloat(val);
                return isNaN(parsed) ? null : parsed;
            };

            const submissionData = {
                ...formData,
                area_sqm: parseNum(formData.area_sqm)
            };

            if (initialData) {
                await updateInfrastructure(initialData.id, submissionData);
            } else {
                const newAsset = await createInfrastructure(farmId, submissionData);

                // Automatic Journal Logging
                if (submissionData.acquisition_cost > 0) {
                    await logActivity({
                        farm_id: farmId,
                        field_id: submissionData.field_id || null,
                        activity_type: 'asset_acquisition',
                        activity_date: submissionData.purchase_date || new Date().toISOString().split('T')[0],
                        description: `Acquisition of ${submissionData.name} (${submissionData.sub_type})`,
                        other_cost: parseFloat(submissionData.acquisition_cost),
                        total_cost: parseFloat(submissionData.acquisition_cost),
                        transaction_type: 'expense',
                        work_status: 'completed',
                        infrastructure_id: newAsset.id
                    });
                }
            }
            onComplete();
        } catch (err) {
            console.error('Failed to save storage unit:', err);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto', padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>{initialData ? 'Edit Farm Asset' : 'Add New Farm Asset'}</h2>
                <button className="outline" onClick={onComplete}>Back</button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>NAME</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Silo #01 - North"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>ASSET CATEGORY</label>
                        <select
                            name="sub_type"
                            value={formData.sub_type}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        >
                            <option value="Machinery">Machinery / Equipment</option>
                            <option value="Vehicle">Vehicle / Tractor</option>
                            <option value="Silo">Silo / Storage Structure</option>
                            <option value="Warehouse">Warehouse</option>
                            <option value="Irrigation">Irrigation System</option>
                            <option value="Tools">Manual Tools</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>OPERATIONAL STATUS</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        >
                            <option value="operational">Operational</option>
                            <option value="under_construction">Under Construction / Installation</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="retired">Retired / Decommissioned</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>ASSOCIATED PARCEL (FIELD)</label>
                        <select
                            name="field_id"
                            value={formData.field_id}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        >
                            <option value="">-- Generic Farm Asset --</option>
                            {fields.map(field => (
                                <option key={field.id} value={field.id}>{field.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>CAPACITY / SIZE</label>
                        <input
                            type="number"
                            name="area_sqm"
                            value={formData.area_sqm}
                            onChange={handleChange}
                            placeholder="e.g. 500 MT"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        />
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#f9f9f9', padding: '16px', marginBottom: '16px', border: '1px solid #eee' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', marginBottom: '8px', color: 'var(--primary)' }}>ACQUISITION COST (XAF)</label>
                            <input
                                type="number"
                                name="acquisition_cost"
                                value={formData.acquisition_cost}
                                onChange={handleChange}
                                placeholder="0.00"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontWeight: 'bold' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', marginBottom: '8px', color: 'var(--primary)' }}>PURCHASE DATE</label>
                            <input
                                type="date"
                                name="purchase_date"
                                value={formData.purchase_date}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: '#888' }}>* Costs will be automatically recorded in the Field Journal.</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>NOTES</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Additional details about the storage..."
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', resize: 'vertical' }}
                    ></textarea>
                </div>

                <button type="submit" className="primary" style={{ width: '100%', padding: '12px', fontWeight: 'bold' }} disabled={loading}>
                    {loading ? 'Processing...' : initialData ? 'Update Asset Info' : 'Initialize Asset & Log Cost'}
                </button>
            </form>
        </div>
    );
};

export default StorageForm;
