import React, { useState } from 'react';
import useInventoryStore from '../../store/inventoryStore';

const InputForm = ({ farmId, onComplete }) => {
    const { createInput } = useInventoryStore();
    const [formData, setFormData] = useState({
        input_type: 'fertilizer',
        name: '',
        brand: '',
        category: '',
        active_ingredient: '',
        unit: 'kg',
        quantity_in_stock: 0,
        unit_cost: '',
        supplier: '',
        purchase_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        storage_location: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createInput(farmId, formData);
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
                <h3 style={{ margin: 0, fontSize: '18px' }}>Add Inventory Item</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label>Input Type</label>
                        <select
                            value={formData.input_type}
                            onChange={(e) => setFormData({ ...formData, input_type: e.target.value })}
                        >
                            <option value="fertilizer">Fertilizer</option>
                            <option value="pesticide">Pesticide / Herbicide</option>
                            <option value="seed">Seeds</option>
                            <option value="fuel">Fuel</option>
                            <option value="other">Other Supplies</option>
                        </select>
                    </div>
                    <div>
                        <label>Product Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Urea 46%, Roundup"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <label>Brand / Manufacturer</label>
                        <input
                            type="text"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Category / Specialization</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Unit of Measure</label>
                        <select
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        >
                            <option value="kg">Kilograms (kg)</option>
                            <option value="liters">Liters (L)</option>
                            <option value="bags">Bags</option>
                            <option value="tonnes">Tonnes</option>
                        </select>
                    </div>
                </div>

                {formData.input_type === 'pesticide' && (
                    <div style={{ marginBottom: '20px' }}>
                        <label>Active Ingredient(s)</label>
                        <input
                            type="text"
                            placeholder="e.g. Glyphosate 360g/L"
                            value={formData.active_ingredient}
                            onChange={(e) => setFormData({ ...formData, active_ingredient: e.target.value })}
                        />
                    </div>
                )}

                <div className="card" style={{ backgroundColor: '#fcfdfc', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>STOCK & FINANCIALS</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '11px' }}>Current Stock</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantity_in_stock}
                                onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>Unit Cost (XAF)</label>
                            <input
                                type="number"
                                value={formData.unit_cost}
                                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>Purchase Date</label>
                            <input
                                type="date"
                                value={formData.purchase_date}
                                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <label>Supplier</label>
                        <input
                            type="text"
                            value={formData.supplier}
                            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Expiry Date</label>
                        <input
                            type="date"
                            value={formData.expiry_date}
                            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Storage Location</label>
                        <input
                            type="text"
                            placeholder="e.g. Bin 4, Main Shed"
                            value={formData.storage_location}
                            onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label>Additional Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                        {loading ? 'Adding...' : 'Save to Inventory'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Discard</button>
                </div>
            </form>
        </div>
    );
};

export default InputForm;
