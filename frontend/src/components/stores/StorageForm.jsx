import React, { useState, useEffect } from 'react';
import useInfrastructureStore from '../../store/infrastructureStore';
import useFarmStore from '../../store/farmStore';
import useActivityStore from '../../store/activityStore';
import useCostStore from '../../store/costStore';
import useUiStore from '../../store/uiStore';

const StorageForm = ({ farmId, onComplete, initialData = null }) => {
    const { createInfrastructure, updateInfrastructure, loading, error } = useInfrastructureStore();
    const { fields } = useFarmStore();
    const { logActivity } = useActivityStore();
    const { costSettings, fetchSettings, createSetting } = useCostStore();
    const { showNotification } = useUiStore();
    const [formData, setFormData] = useState({
        name: '',
        type: 'Asset',
        status: 'operational',
        capacity_value: '',
        capacity_unit: 'MT',
        notes: '',
        sub_type: 'Machinery',
        field_id: '',
        quantity: 1,
        unit_price: '',
        acquisition_cost: 0,
        purchase_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (farmId) {
            fetchSettings(farmId);
        }
    }, [farmId, fetchSettings]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                type: initialData.type || 'Asset',
                status: initialData.status || 'operational',
                capacity_value: initialData.area_sqm || '',
                capacity_unit: initialData.capacity_unit || 'MT',
                notes: initialData.notes || '',
                sub_type: initialData.sub_type || 'Machinery',
                field_id: initialData.field_id || '',
                quantity: initialData.quantity || 1,
                unit_price: initialData.unit_price || '',
                acquisition_cost: initialData.acquisition_cost || 0,
                purchase_date: initialData.purchase_date || new Date().toISOString().split('T')[0]
            });
        }
    }, [initialData]);

    // Automatic Cost Calculation
    useEffect(() => {
        const qty = parseFloat(formData.quantity) || 0;
        const price = parseFloat(formData.unit_price) || 0;
        setFormData(prev => ({ ...prev, acquisition_cost: qty * price }));
    }, [formData.quantity, formData.unit_price]);

    const customAssetTypes = costSettings.filter(s => s.category === 'ASSET_TYPE');

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'sub_type' && value === 'NEW_ASSET_TYPE') {
            handleAddNewCategory();
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddNewCategory = async () => {
        const name = prompt('Enter new Asset Category name:');
        if (name && name.trim()) {
            try {
                await createSetting(farmId, {
                    category: 'ASSET_TYPE',
                    name: name.trim(),
                    unit: 'asset',
                    unit_cost: 0,
                    billing_frequency: 'per_unit'
                });
                setFormData(prev => ({ ...prev, sub_type: name.trim() }));
                showNotification(`New category "${name}" added!`, 'success');
            } catch (err) {
                console.error('Failed to create custom asset category:', err);
                showNotification('Failed to create custom category.', 'error');
            }
        }
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

            const parseUUID = (val) => (val === '' || val === null || val === undefined) ? null : val;

            const submissionData = {
                ...formData,
                field_id: parseUUID(formData.field_id),
                area_sqm: parseNum(formData.capacity_value),
                quantity: parseNum(formData.quantity),
                unit_price: parseNum(formData.unit_price),
                acquisition_cost: parseNum(formData.acquisition_cost)
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
                {/* PRIMARY SELECTION: NAME & FIELD */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>ASSET NAME</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. John Deere Tractor"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary)' }}>ASSOCIATED PARCEL (FIELD) *</label>
                        <select
                            name="field_id"
                            value={formData.field_id}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '2px solid var(--primary)', fontWeight: 'bold' }}
                        >
                            <option value="">-- SELECT FIELD FIRST --</option>
                            {fields.map(field => (
                                <option key={field.id} value={field.id}>{field.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* THE REST OF THE FORM: DISABLED UNTIL FIELD IS SELECTED */}
                <div
                    onClick={() => !formData.field_id && showNotification('PLEASE SELECT AN ASSOCIATED PARCEL (FIELD) TO UNLOCK THE FORM.', 'warning')}
                    style={{ opacity: !formData.field_id ? 0.6 : 1, transition: 'opacity 0.3s ease' }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>ASSET CATEGORY</label>
                            <select
                                name="sub_type"
                                value={formData.sub_type}
                                onChange={handleChange}
                                disabled={!formData.field_id}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: !formData.field_id ? '#f5f5f5' : 'white' }}
                            >
                                <optgroup label="Standard Categories">
                                    <option value="Machinery">Machinery / Equipment</option>
                                    <option value="Vehicle">Vehicle / Tractor</option>
                                    <option value="Silo">Silo / Storage Structure</option>
                                    <option value="Warehouse">Warehouse</option>
                                    <option value="Irrigation">Irrigation System</option>
                                    <option value="Livestock">Livestock Equipment</option>
                                    <option value="Power">Power & Generators</option>
                                    <option value="Tools">Manual Tools</option>
                                    <option value="Processing">Processing Machinery</option>
                                    <option value="ICT">ICT & Smart Farming Sensors</option>
                                    <option value="Buildings">General Farm Buildings</option>
                                    <option value="Other">Other</option>
                                </optgroup>

                                {customAssetTypes.length > 0 && (
                                    <optgroup label="Custom Asset Types">
                                        {customAssetTypes.map(type => (
                                            <option key={type.id} value={type.name}>{type.name}</option>
                                        ))}
                                    </optgroup>
                                )}

                                <option value="NEW_ASSET_TYPE" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>➕ ADD NEW CATEGORY...</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>OPERATIONAL STATUS</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={!formData.field_id}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: !formData.field_id ? '#f5f5f5' : 'white' }}
                            >
                                <option value="operational">Operational</option>
                                <option value="under_construction">Under Construction / Installation</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="retired">Retired / Decommissioned</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>CAPACITY / SIZE</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="number"
                                name="capacity_value"
                                value={formData.capacity_value}
                                onChange={handleChange}
                                disabled={!formData.field_id}
                                placeholder="Value"
                                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: !formData.field_id ? '#f5f5f5' : 'white' }}
                            />
                            <select
                                name="capacity_unit"
                                value={formData.capacity_unit}
                                onChange={handleChange}
                                disabled={!formData.field_id}
                                style={{ width: '100px', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: !formData.field_id ? '#f5f5f5' : 'white' }}
                            >
                                <option value="MT">MT</option>
                                <option value="L">Liters (L)</option>
                                <option value="sqm">sqm</option>
                                <option value="ha">ha</option>
                                <option value="units">Units</option>
                                <option value="HP">HP</option>
                                <option value="kg">kg</option>
                            </select>
                        </div>
                    </div>

                    <div className="card" style={{ backgroundColor: '#f9f9f9', padding: '16px', marginBottom: '16px', border: '1px solid #eee' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', marginBottom: '8px', color: 'var(--primary)' }}>QUANTITY</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    disabled={!formData.field_id}
                                    min="1"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: !formData.field_id ? '#f5f5f5' : 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', marginBottom: '8px', color: 'var(--primary)' }}>UNIT PRICE (XAF)</label>
                                <input
                                    type="number"
                                    name="unit_price"
                                    value={formData.unit_price}
                                    onChange={handleChange}
                                    disabled={!formData.field_id}
                                    placeholder="0.00"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: !formData.field_id ? '#f5f5f5' : 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', marginBottom: '8px', color: 'var(--primary)' }}>TOTAL COST</label>
                                <input
                                    type="number"
                                    name="acquisition_cost"
                                    value={formData.acquisition_cost}
                                    readOnly
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #eee', backgroundColor: '#eee', fontWeight: 'bold' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', marginBottom: '8px', color: 'var(--primary)' }}>PURCHASE DATE</label>
                                <input
                                    type="date"
                                    name="purchase_date"
                                    value={formData.purchase_date}
                                    onChange={handleChange}
                                    disabled={!formData.field_id}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: !formData.field_id ? '#f5f5f5' : 'white' }}
                                />
                            </div>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: '#888' }}>* Costs are auto-calculated and recorded in the Field Journal.</p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>NOTES</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            disabled={!formData.field_id}
                            rows="3"
                            placeholder="Additional details about the storage..."
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', resize: 'vertical', backgroundColor: !formData.field_id ? '#f5f5f5' : 'white' }}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="primary"
                        style={{ width: '100%', padding: '12px', fontWeight: 'bold', opacity: !formData.field_id ? 0.5 : 1 }}
                        disabled={loading || !formData.field_id}
                    >
                        {loading ? 'Processing...' : initialData ? 'Update Asset Info' : 'Initialize Asset & Log Cost'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StorageForm;
