import React, { useState, useEffect } from 'react';
import useActivityStore from '../../store/activityStore';
import useFarmStore from '../../store/farmStore';
import { INFRASTRUCTURE_TYPES } from '../../constants/agriculturalData';

const InfrastructureActivityForm = ({ infrastructure, onComplete, initialData }) => {
    const { logActivity, updateActivity } = useActivityStore();
    const { currentFarm } = useFarmStore();

    const [formData, setFormData] = useState({
        activity_date: new Date().toISOString().split('T')[0],
        infrastructure_id: infrastructure?.id || '',
        activity_type: 'maintenance',
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
        setLoading(true);
        try {
            const payload = {
                ...formData,
                field_id: infrastructure?.field_id || null, // Inherit field from infrastructure
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
            console.error(error);
            alert('Failed to log infrastructure operation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '950px', margin: '0 auto', padding: '0', backgroundColor: '#fff', border: '1px solid #000', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            {/* BBC Style Header Banner */}
            <div style={{ backgroundColor: '#bb1919', padding: '24px 40px', color: 'white', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '0', left: '0', height: '100%', width: '4px', backgroundColor: '#000' }}></div>
                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase' }}>
                    <span style={{ backgroundColor: '#fff', color: '#bb1919', padding: '2px 8px', marginRight: '10px' }}>LOG</span>
                    Infrastructure Operations
                </h1>
                <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <span>ASSET: {infrastructure?.name}</span>
                    <span style={{ opacity: 0.6 }}>|</span>
                    <span>TYPE: {INFRASTRUCTURE_TYPES.find(t => t.id === infrastructure?.type)?.label}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '40px', backgroundColor: '#fcfcfc' }}>
                <div style={{ backgroundColor: '#000', color: '#fff', padding: '12px 20px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '20px' }}>ℹ️</span>
                    <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Operational inputs will be capitalized into the total asset valuation.
                    </p>
                </div>

                {/* Section: Basic Information */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '4px solid #000', paddingBottom: '8px', marginBottom: '24px' }}>
                        01. Field Intelligence
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div className="form-group">
                            <label htmlFor="activity_date" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Operational Date</label>
                            <input id="activity_date" name="activity_date" type="date" value={formData.activity_date} onChange={e => setFormData({ ...formData, activity_date: e.target.value })} required style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px' }} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="component" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Component / Segment Identifier</label>
                            <input id="component" name="component" type="text" placeholder="e.g. CORE-PUMP-01" value={formData.component} onChange={e => setFormData({ ...formData, component: e.target.value })} style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px' }} />
                        </div>
                    </div>
                </div>

                {/* Section: Activity Details */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '4px solid #bb1919', paddingBottom: '8px', marginBottom: '24px' }}>
                        02. Detailed Activity Log
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', marginBottom: '24px' }}>
                        <div className="form-group">
                            <label htmlFor="activity_type" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Operation Category</label>
                            <select id="activity_type" name="activity_type" value={formData.activity_type} onChange={e => setFormData({ ...formData, activity_type: e.target.value })} required style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px', fontWeight: '700' }}>
                                <option value="installation">New Installation</option>
                                <option value="maintenance">Routine Maintenance</option>
                                <option value="repair">Repair</option>
                                <option value="replacement">Replacement</option>
                                <option value="upgrade">Upgrade</option>
                                <option value="inspection">Inspection</option>
                                <option value="emergency">Emergency Response</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="priority" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Priority Matrix</label>
                            <select id="priority" name="priority" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px', fontWeight: '700' }}>
                                <option value="low">Standard (Low)</option>
                                <option value="medium">Optimized (Medium)</option>
                                <option value="high">Urgent (High)</option>
                                <option value="critical">CRITICAL (Alert)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="transaction_type" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Transaction Protocol</label>
                            <select id="transaction_type" name="transaction_type" value={formData.transaction_type} onChange={e => setFormData({ ...formData, transaction_type: e.target.value })} required style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px', fontWeight: '700', backgroundColor: formData.transaction_type === 'income' ? '#f0fff4' : '#fff5f5' }}>
                                <option value="expense">📉 Operational Expense</option>
                                <option value="income">💰 Operational Income</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Summary of Actions Performed</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed technical description..."
                            required
                            style={{ width: '100%', minHeight: '120px', borderRadius: '0', border: '2px solid #ddd', padding: '15px' }}
                        />
                    </div>
                </div>

                {/* Section: Financial Ledger */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '4px solid #000', paddingBottom: '8px', marginBottom: '24px' }}>
                        03. Financial Disbursement Ledger
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                        {['labor_cost', 'material_cost', 'equipment_cost', 'service_cost', 'transport_cost', 'other_cost'].map(field => (
                            <div key={field} className="form-group">
                                <label htmlFor={field} style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>{field.replace('_', ' ')}</label>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ backgroundColor: '#f0f0f0', border: '2px solid #ddd', borderRight: 'none', padding: '12px', fontWeight: '900', fontSize: '12px' }}>XAF</span>
                                    <input id={field} name={field} type="number" value={formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })} style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px' }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', backgroundColor: '#fff', border: '2px solid #000', padding: '24px' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#bb1919', marginBottom: '8px', display: 'block' }}>TOTAL AUDITED EXPENDITURE</label>
                            <div style={{ fontSize: '32px', fontWeight: '900', color: '#000' }}>
                                {parseFloat(formData.total_cost || 0).toLocaleString()} <span style={{ fontSize: '16px' }}>XAF</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="payment_method" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Payment Protocol</label>
                            <select id="payment_method" name="payment_method" value={formData.payment_method} onChange={e => setFormData({ ...formData, payment_method: e.target.value })} style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px', fontWeight: '700' }}>
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
                    <button type="submit" className="primary" style={{ flex: 2, padding: '20px', borderRadius: '0', backgroundColor: '#000', color: '#fff', fontSize: '14px', fontWeight: '900', border: 'none', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }} disabled={loading}>
                        {loading ? 'SYNCING DATA...' : '💾 ARCHIVE LOG ENTRY'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1, padding: '20px', borderRadius: '0', backgroundColor: '#fff', color: '#000', border: '2px solid #000', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}>
                        ABORT CHANGE
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InfrastructureActivityForm;
