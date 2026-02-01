import React, { useState, useEffect } from 'react';
import useFarmStore from '../../store/farmStore';
import useCostStore from '../../store/costStore';
import useUIStore from '../../store/uiStore';

const CostSettings = () => {
    const { currentFarm } = useFarmStore();
    const { costSettings, fetchSettings, createSetting, updateSetting, deleteSetting } = useCostStore();
    const { showNotification, showConfirm } = useUIStore();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        category: 'Labor',
        name: '',
        unit: 'Day',
        unit_cost: '',
        billing_frequency: 'per_unit',
        notes: ''
    });

    useEffect(() => {
        if (currentFarm?.id) {
            fetchSettings(currentFarm.id);
        }
    }, [currentFarm?.id, fetchSettings]);

    // Format number with commas
    const formatNumber = (num) => {
        if (!num) return '0';
        return parseFloat(num).toLocaleString('en-US');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentFarm) return;

        try {
            if (editingId) {
                await updateSetting(editingId, { ...formData, farm_id: currentFarm.id });
                showNotification('COST SETTING UPDATED', 'success');
            } else {
                await createSetting(currentFarm.id, { ...formData, farm_id: currentFarm.id });
                showNotification('NEW COST PARAMETER DEFINED', 'success');
            }
            closeForm();
        } catch (error) {
            showNotification('OPERATION FAILED: CHECK CONSOLE', 'error');
        }
    };

    const handleEdit = (setting) => {
        setEditingId(setting.id);
        setFormData({
            category: setting.category,
            name: setting.name,
            unit: setting.unit,
            unit_cost: setting.unit_cost,
            billing_frequency: setting.billing_frequency,
            notes: setting.notes || ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = (id) => {
        showConfirm('DELETE_COST', async () => {
            try {
                await deleteSetting(id);
                showNotification('COST PARAMETER REMOVED', 'success');
            } catch (error) {
                showNotification('DELETE FAILED', 'error');
            }
        });
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({
            category: 'Labor',
            name: '',
            unit: 'Day',
            unit_cost: '',
            billing_frequency: 'per_unit',
            notes: ''
        });
    };

    if (isFormOpen) {
        return (
            <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', border: '1px solid #000', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
                {/* Header - Harvest Record Style */}
                <div style={{ backgroundColor: '#bb1919', padding: '24px 40px', color: 'white', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '0', left: '0', height: '100%', width: '4px', backgroundColor: '#000' }}></div>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase' }}>
                        <span style={{ backgroundColor: '#fff', color: '#bb1919', padding: '2px 8px', marginRight: '10px' }}>{editingId ? 'EDIT' : 'NEW'}</span>
                        Cost Parameter
                    </h1>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '40px', backgroundColor: '#fcfcfc' }}>

                    {/* Section 01: Identification */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '4px solid #000', paddingBottom: '8px', marginBottom: '24px' }}>
                            01. Parameter Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '0', border: '2px solid #ddd', fontWeight: '700' }}
                                >
                                    <option value="Labor">Labor (Manual/Skilled)</option>
                                    <option value="Machinery">Machinery & Equipment</option>
                                    <option value="Inputs">Inputs (Fertilizer/Seeds)</option>
                                    <option value="Services">External Services</option>
                                    <option value="Overhead">Operational Overhead</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Item Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Casual Weeding"
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '0', border: '2px solid #ddd' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 02: Valuation */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '4px solid #bb1919', paddingBottom: '8px', marginBottom: '24px' }}>
                            02. Valuation Metrics
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Unit of Measure</label>
                                <input
                                    type="text"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    placeholder="e.g. Day, Ha, Liter"
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '0', border: '2px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Default Unit Cost (XAF)</label>
                                <input
                                    type="number"
                                    value={formData.unit_cost}
                                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                                    placeholder="0.00"
                                    style={{ width: '100%', padding: '12px', borderRadius: '0', border: '2px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Billing Type</label>
                                <select
                                    value={formData.billing_frequency}
                                    onChange={(e) => setFormData({ ...formData, billing_frequency: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '0', border: '2px solid #ddd', fontWeight: '700' }}
                                >
                                    <option value="per_unit">Variable (Per Unit)</option>
                                    <option value="fixed">Fixed Cost (Flat)</option>
                                    <option value="monthly">Recurring (Monthly)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
                        <button type="submit" className="primary" style={{ flex: 2, backgroundColor: '#000', color: '#fff', border: 'none', padding: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}>
                            {editingId ? 'UPDATE PARAMETER' : 'SAVE CONFIGURATION'}
                        </button>
                        <button type="button" onClick={closeForm} className="outline" style={{ flex: 1, border: '2px solid #000', padding: '15px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', backgroundColor: '#fff' }}>
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // List View
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px', margin: 0 }}>Operational Cost Matrix</h2>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>Standardize operational expenses for accurate budget forecasting.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    style={{ backgroundColor: '#cc0000', color: '#fff', border: 'none', padding: '12px 24px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
                >
                    + Define New Cost
                </button>
            </div>

            <div style={{ border: '2px solid #000', backgroundColor: '#fff' }}>
                <div style={{ backgroundColor: '#000', color: '#fff', padding: '12px 20px', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Active Cost Configurations
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '11px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #000', backgroundColor: '#f4f4f4' }}>
                            <th style={{ padding: '15px 20px', fontWeight: '900' }}>Category</th>
                            <th style={{ padding: '15px 20px', fontWeight: '900' }}>Item Name</th>
                            <th style={{ padding: '15px 20px', fontWeight: '900' }}>Billing</th>
                            <th style={{ padding: '15px 20px', fontWeight: '900', textAlign: 'right' }}>Default Rate (XAF)</th>
                            <th style={{ padding: '15px 20px', fontWeight: '900', textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {costSettings.map(setting => (
                            <tr key={setting.id} style={{ borderBottom: '1px solid #eee', fontSize: '13px' }}>
                                <td style={{ padding: '15px 20px', fontWeight: '700', color: '#bb1919' }}>{setting.category}</td>
                                <td style={{ padding: '15px 20px', fontWeight: '700' }}>{setting.name}</td>
                                <td style={{ padding: '15px 20px' }}>{setting.billing_frequency === 'per_unit' ? `Per ${setting.unit}` : setting.billing_frequency.toUpperCase()}</td>
                                <td style={{ padding: '15px 20px', fontWeight: '900', textAlign: 'right' }}>{formatNumber(setting.unit_cost)}</td>
                                <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button onClick={() => handleEdit(setting)} style={{ border: '1px solid #000', background: '#fff', padding: '5px 10px', cursor: 'pointer', fontSize: '10px', fontWeight: '900' }}>EDIT</button>
                                        <button onClick={() => handleDelete(setting.id)} style={{ border: '1px solid #bb1919', background: '#bb1919', color: '#fff', padding: '5px 10px', cursor: 'pointer', fontSize: '10px', fontWeight: '900' }}>DEL</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {costSettings.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '12px', fontStyle: 'italic' }}>No cost parameters defined. Click "Define New Cost" to start.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CostSettings;
