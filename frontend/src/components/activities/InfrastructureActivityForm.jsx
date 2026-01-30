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
        hours_worked: 0,
        num_workers: 1,
        weather_conditions: '',
        next_maintenance: '',
        issues: '',
        materials_used: '',
        supplier_name: '',
        supplier_contact: '',
        invoice_number: '',
        warranty: 'none',
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
                transaction_type: 'expense' // Log operations are typically expenses
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
        <div className="card animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)', padding: '30px 40px', color: 'white' }}>
                <h2 style={{ margin: 0, fontSize: '24px' }}>🚜 Infrastructure Operations & Cost Log</h2>
                <p style={{ margin: '8px 0 0 0', opacity: 0.8, fontSize: '14px' }}>
                    Asset: <strong>{infrastructure?.name}</strong> | Type: {INFRASTRUCTURE_TYPES.find(t => t.id === infrastructure?.type)?.label}
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
                <div style={{ background: '#ebf8ff', borderLeft: '4px solid #4299e1', padding: '15px', marginBottom: '30px', borderRadius: '4px' }}>
                    <p style={{ color: '#2c5282', fontSize: '14px', margin: 0 }}>
                        <strong>💡 Tip:</strong> All costs entered here will be automatically added to the total asset value of {infrastructure?.name}.
                    </p>
                </div>

                {/* Basic Information */}
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginTop: '0', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>📋 Basic Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div className="form-group">
                        <label style={{ fontWeight: 600, marginBottom: '8px', color: '#2d3748', fontSize: '14px', display: 'block' }}>Date <span style={{ color: '#e53e3e' }}>*</span></label>
                        <input type="date" value={formData.activity_date} onChange={e => setFormData({ ...formData, activity_date: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontWeight: 600, marginBottom: '8px', color: '#2d3748', fontSize: '14px', display: 'block' }}>Infrastructure Part / Component</label>
                        <input type="text" placeholder="e.g. Pump, Roof, Circuit" value={formData.component} onChange={e => setFormData({ ...formData, component: e.target.value })} style={{ width: '100%' }} />
                    </div>
                </div>

                {/* Activity Details */}
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginTop: '30px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>🏗️ Infrastructure Activity Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div className="form-group">
                        <label style={{ fontWeight: 600, marginBottom: '8px', color: '#2d3748', fontSize: '14px', display: 'block' }}>Activity Type <span style={{ color: '#e53e3e' }}>*</span></label>
                        <select value={formData.activity_type} onChange={e => setFormData({ ...formData, activity_type: e.target.value })} required style={{ width: '100%' }}>
                            <option value="installation">New Installation</option>
                            <option value="maintenance">Routine Maintenance</option>
                            <option value="repair">Repair</option>
                            <option value="replacement">Replacement</option>
                            <option value="upgrade">Upgrade/Improvement</option>
                            <option value="inspection">Inspection</option>
                            <option value="cleaning">Cleaning</option>
                            <option value="painting">Painting</option>
                            <option value="expansion">Expansion</option>
                            <option value="demolition">Demolition</option>
                            <option value="emergency">Emergency Fix</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ fontWeight: 600, marginBottom: '8px', color: '#2d3748', fontSize: '14px', display: 'block' }}>Priority Level</label>
                        <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} style={{ width: '100%' }}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical/Urgent</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{ fontWeight: 600, marginBottom: '8px', color: '#2d3748', fontSize: '14px', display: 'block' }}>Work Status <span style={{ color: '#e53e3e' }}>*</span></label>
                        <select value={formData.work_status} onChange={e => setFormData({ ...formData, work_status: e.target.value })} required style={{ width: '100%' }}>
                            <option value="completed">Completed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 600, marginBottom: '8px', color: '#2d3748', fontSize: '14px', display: 'block' }}>Description of Work <span style={{ color: '#e53e3e' }}>*</span></label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Provide detailed description of the work performed..."
                        required
                        style={{ width: '100%', minHeight: '100px' }}
                    />
                </div>

                {/* Cost Information */}
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginTop: '30px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>💰 Cost Information (XAF)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Labor Cost</label>
                        <input type="number" value={formData.labor_cost} onChange={e => setFormData({ ...formData, labor_cost: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Material Cost</label>
                        <input type="number" value={formData.material_cost} onChange={e => setFormData({ ...formData, material_cost: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Equipment Cost</label>
                        <input type="number" value={formData.equipment_cost} onChange={e => setFormData({ ...formData, equipment_cost: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Service/Contractor</label>
                        <input type="number" value={formData.service_cost} onChange={e => setFormData({ ...formData, service_cost: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Transportation</label>
                        <input type="number" value={formData.transport_cost} onChange={e => setFormData({ ...formData, transport_cost: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Other Costs</label>
                        <input type="number" value={formData.other_cost} onChange={e => setFormData({ ...formData, other_cost: e.target.value })} style={{ width: '100%' }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
                    <div className="form-group">
                        <label style={{ fontWeight: 700, color: 'var(--primary)' }}>TOTAL COST</label>
                        <input type="text" value={formData.total_cost} readOnly style={{ width: '100%', fontWeight: 'bold', fontSize: '18px', backgroundColor: '#e2e8f0' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontWeight: 600 }}>Payment Method</label>
                        <select value={formData.payment_method} onChange={e => setFormData({ ...formData, payment_method: e.target.value })} style={{ width: '100%' }}>
                            <option value="cash">Cash</option>
                            <option value="check">Check</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="mobile_money">Mobile Money</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="account">Farm Account</option>
                            <option value="pending">Pending Payment</option>
                        </select>
                    </div>
                </div>

                {/* Time Tracking */}
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginTop: '30px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>⏱️ Time Tracking</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Start Time</label>
                        <input type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '12px' }}>End Time</label>
                        <input type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Hours Worked</label>
                        <input type="number" step="0.5" value={formData.hours_worked} onChange={e => setFormData({ ...formData, hours_worked: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '12px' }}>No. Workers</label>
                        <input type="number" value={formData.num_workers} onChange={e => setFormData({ ...formData, num_workers: e.target.value })} style={{ width: '100%' }} />
                    </div>
                </div>

                {/* Additional Details */}
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748', marginTop: '30px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>📝 Additional Details</h3>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600 }}>Materials Used & Specifications</label>
                    <textarea
                        value={formData.materials_used}
                        onChange={e => setFormData({ ...formData, materials_used: e.target.value })}
                        placeholder="List materials, quantities, grades..."
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600 }}>Issues / Problems Encountered</label>
                    <textarea
                        value={formData.issues}
                        onChange={e => setFormData({ ...formData, issues: e.target.value })}
                        placeholder="Describe any challenges or unexpected repairs..."
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '14px', fontWeight: 600 }}>Supplier / Vendor Name</label>
                        <input type="text" value={formData.supplier_name} onChange={e => setFormData({ ...formData, supplier_name: e.target.value })} style={{ width: '100%' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '14px', fontWeight: 600 }}>Invoice / Receipt #</label>
                        <input type="text" value={formData.invoice_number} onChange={e => setFormData({ ...formData, invoice_number: e.target.value })} style={{ width: '100%' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
                    <button type="submit" className="primary" style={{ flex: 2, padding: '16px', background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)' }} disabled={loading}>
                        {loading ? 'Logging...' : '💾 Save Infrastructure Log Entry'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Discard Change</button>
                </div>
            </form>
        </div>
    );
};

export default InfrastructureActivityForm;
