// Version: 1.1.0 - Loop Prevention Applied
import React, { useState, useEffect, useMemo } from 'react';
import useActivityStore from '../../store/activityStore';
import useInventoryStore from '../../store/inventoryStore';
import useFarmStore from '../../store/farmStore';
import useCropStore from '../../store/cropStore';
import FormHeader from '../common/FormHeader';
import useInfrastructureStore from '../../store/infrastructureStore';
import useCostStore from '../../store/costStore';
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
    const { costSettings, fetchSettings, createSetting } = useCostStore();

    const [selectedFieldId, setSelectedFieldId] = useState(initialFieldId || '');

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
        if (currentFarm?.id) {
            fetchSettings(currentFarm.id);
        }
    }, [currentFarm?.id]);

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
        }
    }, [initialData]);

    const [loading, setLoading] = useState(false);

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
                farm_id: currentFarm.id
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
        if (!selectedFieldId) return crops;
        return crops.filter(c => c.field_id === selectedFieldId);
    }, [crops, selectedFieldId]);

    const handleCategoryChange = async (e) => {
        const val = e.target.value;

        if (val === 'NEW_FIELD_OP' || val === 'NEW_INFRA_OP') {
            const label = val === 'NEW_FIELD_OP' ? 'Field Operation' : 'Infrastructure Operation';
            const category = val === 'NEW_FIELD_OP' ? 'FIELD_OP' : 'INFRA_OP';
            const name = prompt(`Enter new custom ${label} name:`);

            if (name && name.trim()) {
                setLoading(true);
                try {
                    await createSetting(currentFarm.id, {
                        category: category,
                        name: name.trim(),
                        unit: 'operation',
                        unit_cost: 0,
                        billing_frequency: 'per_unit'
                    });
                    setFormData(prev => ({ ...prev, activity_type: name.trim() }));
                    showNotification(`New ${label} "${name}" added successfully!`, 'success');
                } catch (err) {
                    console.error('Failed to create custom operation:', err);
                    showNotification('Failed to create custom operation type.', 'error');
                } finally {
                    setLoading(false);
                }
            }
            return;
        }

        setFormData(prev => ({ ...prev, activity_type: val }));
    };

    // --- DYNAMIC CATEGORY MAPPING ---
    const customFieldOps = costSettings.filter(s => s.category === 'FIELD_OP');
    const customInfraOps = costSettings.filter(s => s.category === 'INFRA_OP');

    const CATEGORY_LABELS = {
        planting: "Planting",
        harvesting: "Harvesting",
        fertilizing: "Fertilizing / Application of Fertilizers",
        spraying: "Spraying / Protection",
        irrigation: "Irrigation",
        tillage: "Tillage / Cultivation",
        scouting: "Scouting / Inspection",
        pruning: "Pruning",
        thinning: "Thinning",
        mowing: "Mowing",
        mulching: "Mulching",
        soil_sampling: "Soil Sampling",
        maintenance: "General Maintenance",
        infra_farm_house: "Farm House Construction",
        infra_residential: "Farm Residential Construction",
        infra_storage: "Storage Construction",
        infra_fencing: "Fencing / Boundary Work",
        infra_road: "Road Maintenance",
        infra_water_system: "Water System Installation",
        infra_solar: "Solar / Energy Work",
        infra_general: "General Infrastructure Maintenance"
    };

    // Add custom labels
    customFieldOps.forEach(op => { CATEGORY_LABELS[op.name] = op.name; });
    customInfraOps.forEach(op => { CATEGORY_LABELS[op.name] = op.name; });

    // --- INFRASTRUCTURE FORM REDIRECT LOGIC ---
    const isInfraOperation = formData.activity_type?.startsWith('infra_') || customInfraOps.some(op => op.name === formData.activity_type);

    if (isInfraOperation) {
        return (
            <InfrastructureActivityForm
                onComplete={onComplete}
                initialData={initialData}
                initialActivityType={formData.activity_type}
                fieldName={fields.find(f => f.id === selectedFieldId)?.name}
                categoryLabel={CATEGORY_LABELS[formData.activity_type]}
            />
        );
    }

    // ------------------------------------------

    return (
        <div className="animate-fade-in" style={{ maxWidth: '950px', margin: '0 auto', padding: '0 0 40px 0' }}>
            {/* Modern AgTech Header */}
            <FormHeader
                title="Log Field Operations"
                subtitle={`FARM: ${currentFarm?.name} | FIELD: ${fields.find(f => f.id === selectedFieldId)?.name || 'NOT SELECTED'} | TYPE: CROP & LAND MAINTENANCE`}
                onBack={onComplete}
                icon="🚜"
            />

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
                                onChange={(e) => setSelectedFieldId(e.target.value)}
                                required
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px', fontWeight: '700' }}
                            >
                                <option value="">-- Select Field --</option>
                                {fields.map(field => (
                                    <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
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
                                onChange={handleCategoryChange}
                                onClick={() => { if (!selectedFieldId) showAlert('NO_FIELD_SELECTION'); }}
                                required
                                disabled={!selectedFieldId}
                                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px', fontWeight: '500', opacity: selectedFieldId ? 1 : 0.6, cursor: selectedFieldId ? 'pointer' : 'not-allowed' }}
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
                                    {customFieldOps.map(op => (
                                        <option key={op.id} value={op.name}>{op.name}</option>
                                    ))}
                                    <option value="NEW_FIELD_OP" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>➕ CREATE NEW FIELD OPERATION...</option>
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
                                    {customInfraOps.map(op => (
                                        <option key={op.id} value={op.name}>{op.name}</option>
                                    ))}
                                    <option value="NEW_INFRA_OP" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>➕ CREATE NEW INFRASTRUCTURE OP...</option>
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
                        Financial Documentation
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
                            <label htmlFor="description" style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Description</label>
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
