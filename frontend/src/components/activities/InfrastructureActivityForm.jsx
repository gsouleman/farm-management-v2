import React, { useState, useEffect } from 'react';
import useActivityStore from '../../store/activityStore';
import useFarmStore from '../../store/farmStore';
import useUIStore from '../../store/uiStore';
import { INFRASTRUCTURE_TYPES } from '../../constants/agriculturalData';

const InfrastructureActivityForm = ({ onComplete, initialData, initialActivityType, fieldName, categoryLabel }) => {
    const { logActivity, updateActivity } = useActivityStore();
    const { currentFarm } = useFarmStore();
    const { showNotification, showAlert } = useUIStore();

    const [formData, setFormData] = useState({
        activity_date: new Date().toISOString().split('T')[0],
        infrastructure_id: initialData?.infrastructure_id || '',
        activity_type: initialActivityType || initialData?.activity_type || 'maintenance',
        priority: 'medium',
        work_status: 'completed',
        performed_by_type: 'farm_staff',
        description: '',
        component: '',
        labor_cost: 0,
        material_cost: 0,
        equipment_cost: 0,
        service_cost: 0,
        transport_cost: 0,
        other_cost: 0,
        total_cost: 0,
        payment_method: 'cash',
        start_time: '',
        end_time: '',
        duration_hours: 0,
        num_workers: 1,
        weather_conditions: '',
        next_maintenance: '',
        issues: '',
        materials_used: '',
        supplier_name: '',
        supplier_contact: '',
        invoice_number: '',
        warranty: 'none',
        transaction_type: 'expense',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                activity_date: initialData.activity_date || new Date().toISOString().split('T')[0],
            });
        }
    }, [initialData]);

    // Auto-calculate total cost
    useEffect(() => {
        const total =
            parseFloat(formData.labor_cost || 0) +
            parseFloat(formData.material_cost || 0) +
            parseFloat(formData.equipment_cost || 0) +
            parseFloat(formData.service_cost || 0) +
            parseFloat(formData.transport_cost || 0) +
            parseFloat(formData.other_cost || 0);
        setFormData(prev => ({ ...prev, total_cost: total.toFixed(2) }));
    }, [
        formData.labor_cost,
        formData.material_cost,
        formData.equipment_cost,
        formData.service_cost,
        formData.transport_cost,
        formData.other_cost
    ]);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.description || formData.description.trim() === '') {
            showAlert('INVALID_QUANTITY', 'Please provide a technical description of the actions performed to continue.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                field_id: initialData?.field_id || null,
                farm_id: currentFarm.id,
                labor_cost: parseFloat(formData.labor_cost) || 0,
                material_cost: parseFloat(formData.material_cost) || 0,
                equipment_cost: parseFloat(formData.equipment_cost) || 0,
                service_cost: parseFloat(formData.service_cost) || 0,
                transport_cost: parseFloat(formData.transport_cost) || 0,
                other_cost: parseFloat(formData.other_cost) || 0,
                total_cost: parseFloat(formData.total_cost) || 0,
                duration_hours: parseFloat(formData.duration_hours) || 0,
                num_workers: parseInt(formData.num_workers) || 1
            };

            if (initialData?.id) {
                await updateActivity(initialData.id, payload);
            } else {
                await logActivity(payload);
            }

            if (onComplete) onComplete();
        } catch (error) {
            console.error('[InfrastructureActivityForm] Submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '950px', margin: '0 auto', padding: '0 0 40px 0' }}>
            {/* Modern AgTech Header - Matched with ActivityForm */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '0 24px', backgroundColor: '#fff' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        Log Infrastructure Operations
                    </h1>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        <span>FARM: {currentFarm?.name}</span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span>FIELD: {fieldName || 'N/A'}</span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span>TYPE: INFRASTRUCTURE & CONSTRUCTION</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '40px', backgroundColor: '#fcfcfc' }}>

                <div style={{ backgroundColor: '#000', color: '#fff', padding: '12px 20px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '20px' }}>ℹ️</span>
                    <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Operational inputs will be capitalized into the total asset valuation.
                    </p>
                </div>

                {/* Section: 01. Field Intelligence */}
                <div style={{ marginBottom: '40px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        Field Intelligence
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '30px' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Field</label>
                            <input
                                type="text"
                                value={fieldName || 'NOT SPECIFIED'}
                                disabled
                                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px', fontWeight: '700', backgroundColor: '#f9f9f9', color: '#333' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Infrastructure Asset</label>
                            <input
                                type="text"
                                value={categoryLabel || 'GENERIC MAINTENANCE'}
                                disabled
                                style={{ width: '100%', borderRadius: '8px', border: '2px solid var(--border)', padding: '12px', fontWeight: '900', backgroundColor: '#f9f9f9', color: 'var(--primary)' }}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="activity_date" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Log Date</label>
                            <input id="activity_date" name="activity_date" type="date" value={formData.activity_date} onChange={e => setFormData({ ...formData, activity_date: e.target.value })} required style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px' }} />
                        </div>
                    </div>
                </div>

                {/* Section: 02. Detailed Activity Log */}
                <div style={{ marginBottom: '40px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        Detailed Activity Log
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '24px' }}>
                        <div className="form-group">
                            <label htmlFor="priority" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Priority Matrix</label>
                            <select id="priority" name="priority" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px', fontWeight: '500' }}>
                                <option value="low">Standard (Low)</option>
                                <option value="medium">Optimized (Medium)</option>
                                <option value="high">Urgent (High)</option>
                                <option value="critical">CRITICAL (Alert)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="transaction_type" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Transaction Protocol</label>
                            <select id="transaction_type" name="transaction_type" value={formData.transaction_type} onChange={e => setFormData({ ...formData, transaction_type: e.target.value })} required style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px', fontWeight: '500', backgroundColor: formData.transaction_type === 'income' ? 'var(--bg-success)' : 'var(--bg-error-light)' }}>
                                <option value="expense">📉 Operational Expense</option>
                                <option value="income">💰 Operational Income</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>DESCRIPTION</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Provide a detailed technical description of the operation..."
                            required
                            style={{ width: '100%', minHeight: '100px', borderRadius: '8px', border: '1px solid var(--border)', padding: '15px' }}
                        />
                    </div>
                </div>

                {/* Section: 03. Financial Ledger */}
                <div style={{ marginBottom: '40px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        Financial Disbursement Ledger
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                        {['labor_cost', 'material_cost', 'equipment_cost', 'service_cost', 'transport_cost', 'other_cost'].map(field => (
                            <div key={field} className="form-group">
                                <label htmlFor={field} style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>{field.replace('_', ' ')}</label>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ backgroundColor: '#f0f0f0', border: '1px solid var(--border)', borderRight: 'none', padding: '12px', fontWeight: '900', fontSize: '12px', borderRadius: '8px 0 0 8px' }}>XAF</span>
                                    <input id={field} name={field} type="number" value={formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })} style={{ width: '100%', borderRadius: '0 8px 8px 0', border: '1px solid var(--border)', padding: '12px' }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', backgroundColor: '#fcfcfc', border: '1px solid var(--border)', padding: '24px', borderRadius: '12px' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px', display: 'block' }}>TOTAL AUDITED EXPENDITURE</label>
                            <div style={{ fontSize: '32px', fontWeight: '900', color: '#000' }}>
                                {parseFloat(formData.total_cost || 0).toLocaleString()} <span style={{ fontSize: '16px' }}>XAF</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="payment_method" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Payment Protocol</label>
                            <select id="payment_method" name="payment_method" value={formData.payment_method} onChange={e => setFormData({ ...formData, payment_method: e.target.value })} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px', fontWeight: '500' }}>
                                <option value="cash">Cash Settlement</option>
                                <option value="bank_transfer">Electronic Transfer</option>
                                <option value="mobile_money">Mobile Payment</option>
                                <option value="check">Certified Check</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Final Action Buttons */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '50px' }}>
                    <button type="submit" className="primary" style={{ flex: 2, padding: '16px', fontSize: '16px' }} disabled={loading}>
                        {loading ? 'SYNCING DATA...' : 'SAVE OPERATION RECORD'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1, padding: '16px' }}>
                        CANCEL
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InfrastructureActivityForm;
