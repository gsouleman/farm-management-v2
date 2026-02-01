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
            <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'var(--primary)', padding: '24px 40px', color: 'white' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                        {editingId ? 'Edit' : 'New'} Cost Parameter
                    </h1>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '40px' }}>

                    {/* Section 01: Identification */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '24px' }}>
                            01. Parameter Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                                >
                                    <option value="Labor">Labor (Manual/Skilled)</option>
                                    <option value="Machinery">Machinery & Equipment</option>
                                    <option value="Inputs">Inputs (Fertilizer/Seeds)</option>
                                    <option value="Services">External Services</option>
                                    <option value="Overhead">Operational Overhead</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Item Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Casual Weeding"
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 02: Valuation */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '24px' }}>
                            02. Valuation Metrics
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Unit of Measure</label>
                                <input
                                    type="text"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    placeholder="e.g. Day, Ha, Liter"
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Default Unit Cost (XAF)</label>
                                <input
                                    type="number"
                                    value={formData.unit_cost}
                                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                                    placeholder="0.00"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Billing Type</label>
                                <select
                                    value={formData.billing_frequency}
                                    onChange={(e) => setFormData({ ...formData, billing_frequency: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                                >
                                    <option value="per_unit">Variable (Per Unit)</option>
                                    <option value="fixed">Fixed Cost (Flat)</option>
                                    <option value="monthly">Recurring (Monthly)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
                        <button type="submit" className="primary" style={{ flex: 2, padding: '14px' }}>
                            {editingId ? 'UPDATE PARAMETER' : 'SAVE CONFIGURATION'}
                        </button>
                        <button type="button" onClick={closeForm} className="outline" style={{ flex: 1, padding: '14px' }}>
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // List View
    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Operational Cost Matrix</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Standardize operational expenses for accurate budget forecasting.</p>
                </div>
                <button
                    className="primary"
                    onClick={() => setIsFormOpen(true)}
                >
                    + Define New Cost
                </button>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>ACTIVE COST CONFIGURATIONS</div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Category</th>
                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Item Name</th>
                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Billing</th>
                            <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Default Rate (XAF)</th>
                            <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {costSettings.map(setting => (
                            <tr key={setting.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                <td style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--primary)' }}>{setting.category}</td>
                                <td style={{ padding: '16px 24px', fontWeight: '500' }}>{setting.name}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{setting.billing_frequency === 'per_unit' ? `Per ${setting.unit}` : setting.billing_frequency.toUpperCase()}</td>
                                <td style={{ padding: '16px 24px', fontWeight: '700', textAlign: 'right' }}>{formatNumber(setting.unit_cost)}</td>
                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button onClick={() => handleEdit(setting)} className="outline" style={{ padding: '6px 12px', fontSize: '11px' }}>EDIT</button>
                                        <button onClick={() => handleDelete(setting.id)} className="outline" style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--error)', borderColor: 'var(--error)' }}>DEL</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {costSettings.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>No cost parameters defined. Click "+ Define New Cost" to start.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CostSettings;
