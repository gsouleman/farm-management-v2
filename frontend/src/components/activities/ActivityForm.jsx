import React, { useState, useEffect, useMemo } from 'react';
import useActivityStore from '../../store/activityStore';
import useInventoryStore from '../../store/inventoryStore';
import useFarmStore from '../../store/farmStore';
import useCropStore from '../../store/cropStore';
import useInfrastructureStore from '../../store/infrastructureStore';
import useUIStore from '../../store/uiStore';
import InfrastructureActivityForm from './InfrastructureActivityForm';
import { INFRASTRUCTURE_TYPES } from '../../constants/agriculturalData';

const ActivityForm = ({ fieldId: initialFieldId, cropId, onComplete, initialData }) => {
    const { logActivity, updateActivity } = useActivityStore();
    const { showNotification, showAlert } = useUIStore();
    const { inputs: inventory, fetchInputs } = useInventoryStore();
    const { crops, fetchCropsByFarm } = useCropStore();
    const { currentFarm, fields, fetchFields } = useFarmStore();
    const { infrastructure, fetchInfrastructure } = useInfrastructureStore();

    const [selectedFieldId, setSelectedFieldId] = useState(initialFieldId || '');
    const [associatedOperation, setAssociatedOperation] = useState({ type: '', id: '' });

    const [formData, setFormData] = useState({
        activity_type: 'planting',
        activity_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        duration_hours: '',
        area_covered: '',
        description: '',
        weather_conditions: '',
        temperature: '',
        equipment_used: '',
        labor_cost: '',
        notes: '',
        input_id: '',
        quantity_used: '',
        application_rate: '',
        transaction_type: 'expense'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                activity_date: initialData.activity_date || new Date().toISOString().split('T')[0],
                input_id: initialData.Inputs?.[0]?.id || '',
                quantity_used: initialData.Inputs?.[0]?.ActivityInput?.quantity_used || '',
                application_rate: initialData.Inputs?.[0]?.ActivityInput?.application_rate || ''
            });
            if (initialData.field_id) setSelectedFieldId(initialData.field_id);
            if (initialData.crop_id) setAssociatedOperation({ type: 'crop', id: initialData.crop_id });
            else if (initialData.infrastructure_id) setAssociatedOperation({ type: 'infrastructure', id: initialData.infrastructure_id });
        }
    }, [initialData]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentFarm) {
            fetchInputs(currentFarm.id);
            fetchFields(currentFarm.id);
            fetchCropsByFarm(currentFarm.id);
            fetchInfrastructure(currentFarm.id);
        }
    }, [currentFarm, fetchInputs, fetchFields, fetchCropsByFarm, fetchInfrastructure]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFieldId) {
            showAlert('NO_FIELD_SELECTION');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                field_id: selectedFieldId,
                farm_id: currentFarm.id,
                crop_id: associatedOperation.type === 'crop' ? associatedOperation.id : null,
                infrastructure_id: associatedOperation.type === 'infrastructure' ? associatedOperation.id : null
            };

            // Structure inputs array if an item is selected
            if (formData.input_id && formData.quantity_used) {
                const selectedInput = inventory.find(i => i.id === formData.input_id);
                payload.inputs = [{
                    input_id: formData.input_id,
                    quantity_used: parseFloat(formData.quantity_used) || 0,
                    unit: selectedInput ? selectedInput.unit : '',
                    application_rate: parseFloat(formData.application_rate) || null
                }];
            } else {
                payload.inputs = [];
            }

            if (initialData?.id) {
                await updateActivity(initialData.id, payload);
            } else {
                await logActivity(payload);
            }

            if (onComplete) onComplete();
        } catch (error) {
            console.error('[ActivityForm] Submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter crops and infra based on selected field
    const filteredCrops = useMemo(() => {
        if (!crops) return [];
        // If a field is selected, filter by it. If not, show all crops for that farm.
        if (!selectedFieldId) return crops;
        return crops.filter(c => c.field_id === selectedFieldId || c.id === associatedOperation.id);
    }, [crops, selectedFieldId, associatedOperation.id]);

    const filteredInfra = useMemo(() => {
        if (!infrastructure) return [];
        // Show farm-wide infra and field-specific infra
        if (!selectedFieldId) return infrastructure;
        return infrastructure.filter(i => i.field_id === selectedFieldId || !i.field_id || i.id === associatedOperation.id);
    }, [infrastructure, selectedFieldId, associatedOperation.id]);

    if (associatedOperation.type === 'infrastructure') {
        const selectedInfra = infrastructure.find(i => i.id === associatedOperation.id);
        return (
            <div className="animate-fade-in">
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' }}>
                    <button className="outline" onClick={() => setAssociatedOperation({ type: '', id: '' })}>
                        ← Back to General Operation Form
                    </button>
                </div>
                <InfrastructureActivityForm
                    infrastructure={selectedInfra}
                    onComplete={onComplete}
                    initialData={initialData}
                />
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '950px', margin: '0 auto', padding: '0 0 40px 0' }}>
            {/* Modern AgTech Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '0 24px', backgroundColor: '#fff' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        Log Field Operations
                    </h1>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        <span>FARM: {currentFarm?.name}</span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span>TYPE: CROP & LAND MAINTENANCE</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '40px', backgroundColor: '#fcfcfc' }}>
                <div style={{ backgroundColor: '#000', color: '#fff', padding: '12px 20px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '20px' }}>ℹ️</span>
                    <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Field operations are logged via the operational intelligence ledger.
                    </p>
                </div>

                {/* Section: 01. Field Intelligence */}
                <div style={{ marginBottom: '40px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        Field Intelligence
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div className="form-group">
                            <label htmlFor="field_id" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Field</label>
                            <select
                                id="field_id"
                                name="field_id"
                                value={selectedFieldId}
                                onChange={(e) => {
                                    setSelectedFieldId(e.target.value);
                                    setAssociatedOperation({ type: '', id: '' });
                                }}
                                required
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px', fontWeight: '700' }}
                            >
                                <option value="">-- Select Field --</option>
                                {fields.map(field => (
                                    <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="associated_id" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Associated Asset / Crop</label>
                            <select
                                id="associated_id"
                                name="associated_id"
                                value={associatedOperation.type && associatedOperation.id ? `${associatedOperation.type}:${associatedOperation.id}` : ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) {
                                        setAssociatedOperation({ type: '', id: '' });
                                        return;
                                    }
                                    const [type, id] = val.split(':');
                                    setAssociatedOperation({ type, id });
                                }}
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px', fontWeight: '700' }}
                            >
                                <option value="">-- No Specific Association --</option>
                                <optgroup label="Crops / Cultivations">
                                    {filteredCrops.map(crop => (
                                        <option key={crop.id} value={`crop:${crop.id}`}>
                                            🌱 {crop.crop_type} ({crop.variety})
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Infrastructure & Storage">
                                    {filteredInfra.map(infra => {
                                        const typeIcon = INFRASTRUCTURE_TYPES.find(t => t.id === infra.type)?.icon || '🏢';
                                        return (
                                            <option key={infra.id} value={`infrastructure:${infra.id}`}>
                                                {typeIcon} {infra.name}
                                            </option>
                                        );
                                    })}
                                </optgroup>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section: 02. Detailed Activity Log */}
                <div style={{ marginBottom: '40px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        Detailed Activity Log
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', marginBottom: '24px' }}>
                        <div className="form-group">
                            <label htmlFor="activity_type" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Operation Category</label>
                            <select
                                id="activity_type"
                                name="activity_type"
                                value={formData.activity_type}
                                onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                                required
                                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px', fontWeight: '500' }}
                            >
                                <optgroup label="Crops / Field Operations">
                                    <option value="planting">Planting</option>
                                    <option value="harvesting">Harvesting</option>
                                    <option value="fertilizing">Fertilizing / Application of Fertilizers</option>
                                    <option value="spraying">Spraying / Protection</option>
                                    <option value="irrigation">Irrigation</option>
                                    <option value="tillage">Tillage / Cultivation</option>
                                    <option value="scouting">Scouting / Inspection</option>
                                    <option value="pruning">Pruning</option>
                                    <option value="thinning">Thinning</option>
                                    <option value="mowing">Mowing</option>
                                    <option value="mulching">Mulching</option>
                                    <option value="soil_sampling">Soil Sampling</option>
                                    <option value="maintenance">General Maintenance</option>
                                </optgroup>
                                <optgroup label="Infrastructure / Construction">
                                    <option value="infra_farm_house">Farm House Construction</option>
                                    <option value="infra_residential">Farm Residential Construction</option>
                                    <option value="infra_storage">Storage Construction</option>
                                    <option value="infra_fencing">Fencing / Boundary Work</option>
                                    <option value="infra_road">Road Maintenance</option>
                                    <option value="infra_water_system">Water System Installation</option>
                                    <option value="infra_solar">Solar / Energy Work</option>
                                    <option value="infra_general">General Infrastructure Maintenance</option>
                                </optgroup>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="transaction_type" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Transaction Protocol</label>
                            <select
                                id="transaction_type"
                                name="transaction_type"
                                value={formData.transaction_type}
                                onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                                required
                                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px', fontWeight: '500', backgroundColor: formData.transaction_type === 'income' ? 'var(--bg-success)' : 'var(--bg-error-light)' }}
                            >
                                <option value="expense">📉 Operational Expense</option>
                                <option value="income">💰 Operational Income</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="activity_date" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Operational Date</label>
                            <input
                                id="activity_date"
                                name="activity_date"
                                type="date"
                                value={formData.activity_date}
                                onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                                required
                                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Section: 03. Timing & Environmental Matrix */}
                <div style={{ marginBottom: '40px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        Timing & Environmental Matrix
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                        <div className="form-group">
                            <label htmlFor="start_time" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>Start Time</label>
                            <input id="start_time" name="start_time" type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px' }} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="end_time" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>End Time</label>
                            <input id="end_time" name="end_time" type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px' }} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="duration_hours" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>Duration (h)</label>
                            <input id="duration_hours" name="duration_hours" type="number" step="0.1" value={formData.duration_hours} onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px' }} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="area_covered" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>Area (ha)</label>
                            <input id="area_covered" name="area_covered" type="number" step="0.01" value={formData.area_covered} onChange={(e) => setFormData({ ...formData, area_covered: e.target.value })} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px' }} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '30px' }}>
                        <div className="form-group">
                            <label htmlFor="weather_conditions" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>Weather Condition</label>
                            <input id="weather_conditions" name="weather_conditions" type="text" placeholder="Sunny" value={formData.weather_conditions} onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px' }} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="temperature" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>Temp (°C)</label>
                            <input id="temperature" name="temperature" type="number" step="0.1" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px' }} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="equipment_used" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>Machinery / Equipment</label>
                            <input id="equipment_used" name="equipment_used" type="text" placeholder="Tractor ID" value={formData.equipment_used} onChange={(e) => setFormData({ ...formData, equipment_used: e.target.value })} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px' }} />
                        </div>
                    </div>
                </div>

                {/* Section: 04. Input Application Ledger */}
                <div style={{ marginBottom: '40px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        Input Application Ledger
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label htmlFor="input_id" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>Inventory Item</label>
                            <select
                                id="input_id"
                                name="input_id"
                                value={formData.input_id}
                                onChange={(e) => setFormData({ ...formData, input_id: e.target.value })}
                                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px', fontWeight: '500' }}
                            >
                                <option value="">-- No Inventory Item --</option>
                                {inventory.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} ({item.brand}) - Stock: {item.quantity_in_stock} {item.unit}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="quantity_used" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>Quantity Used</label>
                            <input id="quantity_used" name="quantity_used" type="number" placeholder="Qty" value={formData.quantity_used} onChange={(e) => setFormData({ ...formData, quantity_used: e.target.value })} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px' }} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="application_rate" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>Rate (kg/ha)</label>
                            <input id="application_rate" name="application_rate" type="text" placeholder="Rate" value={formData.application_rate} onChange={(e) => setFormData({ ...formData, application_rate: e.target.value })} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px' }} />
                        </div>
                    </div>
                </div>

                {/* Section: 05. Financial & Technical Documentation */}
                <div style={{ marginBottom: '40px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        Financial & Technical Documentation
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '30px', marginBottom: '24px' }}>
                        <div className="form-group">
                            <label htmlFor="labor_cost" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Labor Cost (Audited)</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ backgroundColor: '#f0f0f0', border: '2px solid #ddd', borderRight: 'none', padding: '12px', fontWeight: '900', fontSize: '12px' }}>XAF</span>
                                <input id="labor_cost" name="labor_cost" type="number" value={formData.labor_cost} onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })} style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px' }} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="description" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Technical Summary</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Audit trail of actions performed..."
                                required
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '15px', minHeight: '80px' }}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="notes" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', marginBottom: '4px', display: 'block' }}>Internal Engineering Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Sensitive internal operational data..."
                            style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '15px', minHeight: '60px' }}
                        />
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

export default ActivityForm;
