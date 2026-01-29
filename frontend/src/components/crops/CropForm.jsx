import React, { useState } from 'react';
import useFarmStore from '../../store/farmStore';
import useCropStore from '../../store/cropStore';
import useInfrastructureStore from '../../store/infrastructureStore';
import FieldMap from '../fields/FieldMap';
import { CROP_CATEGORIES } from '../../constants/agriculturalData';
import * as turf from '@turf/turf';

const CropForm = ({ fieldId, onComplete }) => {
    const { createCrop, crops } = useCropStore();
    const { fields } = useFarmStore();
    const { infrastructure } = useInfrastructureStore();

    const [selectedFieldId, setSelectedFieldId] = useState(fieldId ? fieldId.toString() : '');

    // Find parent field for map context
    const parentField = (fields || []).find(f => f?.id?.toString() === selectedFieldId);

    const [formData, setFormData] = useState({
        crop_type: '',
        variety: '',
        planting_date: new Date().toISOString().split('T')[0],
        expected_harvest_date: '',
        planted_area: '',
        boundary_coordinates: [], // Captured from map
        perimeter: '',
        planting_rate: '',
        row_spacing: '',
        season: '',
        year: new Date().getFullYear(),
        estimated_cost: '',
        status: 'planted',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const cropCategories = CROP_CATEGORIES || {};

    const currentCropVarieties = (formData.crop_type && cropCategories)
        ? Object.values(cropCategories)
            .flat()
            .find(c => c.id === formData.crop_type)?.varieties || []
        : [];



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const targetFieldId = selectedFieldId === 'undefined' ? null : selectedFieldId;

        console.log('Submitting Crop Record:', {
            targetFieldId,
            formData
        });

        if (!targetFieldId) {
            alert('Selection Error: Please select a valid target field.');
            setLoading(false);
            return;
        }

        try {
            // Normalize numeric fields: empty strings or NaN should be null for the backend
            const parseNum = (val) => {
                const parsed = parseFloat(val);
                return isNaN(parsed) ? null : parsed;
            };

            const normalizedData = {
                ...formData,
                planted_area: parseNum(formData.planted_area),
                planting_rate: parseNum(formData.planting_rate),
                row_spacing: parseNum(formData.row_spacing),
                estimated_cost: parseNum(formData.estimated_cost),
                year: parseInt(formData.year, 10) || new Date().getFullYear(),
                expected_harvest_date: formData.expected_harvest_date || null,
                planting_date: formData.planting_date || null
            };

            console.log('Normalized Data for Submission:', normalizedData);

            await createCrop(targetFieldId, normalizedData);
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Submission failed:', error);
            const serverMsg = error.response?.data?.message || 'Failed to save record';
            const serverError = error.response?.data?.error || '';
            const details = error.response?.data?.details ? `\n- ${error.response.data.details.join('\n- ')}` : '';

            alert(`Error: ${serverMsg}${serverError ? ` (${serverError})` : ''}${details}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div className="card-header" style={{ borderBottomColor: '#edf2f7', padding: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#1a365d' }}>Establish New Cultivation Record</h3>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #edf2f7' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>TARGET FIELD FOR CULTIVATION</label>
                    <select
                        value={selectedFieldId}
                        onChange={(e) => setSelectedFieldId(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', backgroundColor: fieldId ? '#f7fafc' : 'white' }}
                        disabled={!!fieldId}
                    >
                        <option value="">-- Select Field --</option>
                        {(fields || []).map(f => (
                            <option key={f.id} value={f.id}>{f.name} ({f.area} ha)</option>
                        ))}
                    </select>
                </div>

                {/* Crop Selection Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Crop Type</label>
                        <select
                            value={formData.crop_type}
                            onChange={(e) => setFormData({ ...formData, crop_type: e.target.value, variety: '' })}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        >
                            <option value="">-- Select Crop --</option>
                            {Object.entries(cropCategories || {}).map(([category, items]) => (
                                <optgroup key={category} label={category}>
                                    {(items || []).map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                    ))}
                                </optgroup>
                            ))}
                            <option value="other">Other / Custom</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Variety / Hybrid</label>
                        <input
                            list="variety-presets"
                            type="text"
                            placeholder="Select or enter variety"
                            value={formData.variety}
                            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        />
                        <datalist id="variety-presets">
                            {(currentCropVarieties || []).map(v => (
                                <option key={v} value={v} />
                            ))}
                        </datalist>
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Crop Year</label>
                        <input
                            type="number"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        />
                    </div>
                </div>

                {/* Timing Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Season</label>
                        <input
                            type="text"
                            placeholder="e.g. Spring 2026"
                            value={formData.season}
                            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Planting Date</label>
                        <input
                            type="date"
                            value={formData.planting_date}
                            onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Exp. Harvest Date</label>
                        <input
                            type="date"
                            value={formData.expected_harvest_date}
                            onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        />
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#fcfcfc', marginBottom: '24px', border: '1px solid #e0e0e0', padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Land Allocation Map</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Draw rectangle or polygon to allocate space</span>
                    </div>

                    <div style={{ height: '400px' }}>
                        <FieldMap
                            center={parentField?.boundary?.coordinates?.[0]?.[0] ? [parentField.boundary.coordinates[0][0][1], parentField.boundary.coordinates[0][0][0]] : null}
                            fields={fields}
                            crops={crops}
                            infrastructure={infrastructure}
                            farmBoundary={parentField?.boundary}
                            editable={true}
                            onBoundaryCreate={(data) => {
                                setFormData(prev => ({
                                    ...prev,
                                    boundary_coordinates: data.coordinates,
                                    planted_area: data.area,
                                    perimeter: data.perimeter
                                }));
                            }}
                        />
                    </div>

                    {(formData.boundary_coordinates?.length > 0) && (
                        <div style={{ padding: '12px 20px', backgroundColor: '#fffbe6', borderTop: '1px solid #ffe58f', fontSize: '12px', display: 'flex', gap: '30px' }}>
                            <span><strong>Allocated Area:</strong> {formData.planted_area} ha</span>
                            <span><strong>Perimeter:</strong> {formData.perimeter || 0} m</span>
                            <span><strong>Geofence:</strong> {formData.boundary_coordinates.length} points</span>
                        </div>
                    )}
                </div>

                {/* Specifications Section */}
                <div className="card" style={{ backgroundColor: '#f7fafc', marginBottom: '24px', border: '1px solid #edf2f7' }}>
                    <h4 style={{ fontSize: '11px', color: '#2b6cb0', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>PLANTING SPECIFICATIONS</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '12px', color: '#4a5568', marginBottom: '6px', display: 'block' }}>Area (ha)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.planted_area}
                                onChange={(e) => setFormData({ ...formData, planted_area: e.target.value })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: '#4a5568', marginBottom: '6px', display: 'block' }}>Rate (seeds/ha)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.planting_rate}
                                onChange={(e) => setFormData({ ...formData, planting_rate: e.target.value })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: '#4a5568', marginBottom: '6px', display: 'block' }}>Spacing (cm)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.row_spacing}
                                onChange={(e) => setFormData({ ...formData, row_spacing: e.target.value })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', width: '100%' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Current Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        >
                            <option value="planted">Recently Planted</option>
                            <option value="growing">Actively Growing</option>
                            <option value="harvested">Harvested / Completed</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Budgeted Cost (XAF)</label>
                        <input
                            type="number"
                            placeholder="e.g. 500000"
                            value={formData.estimated_cost}
                            onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Internal Monitoring Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Details about seed quality, depth, or moisture at planting..."
                        rows="3"
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', resize: 'vertical' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="submit" className="primary" style={{ flex: 2, padding: '14px', fontSize: '16px' }} disabled={loading}>
                        {loading ? 'Recording...' : 'Save Cultivation Record'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1, padding: '14px' }}>Discard</button>
                </div>
            </form>
        </div>
    );
};

export default CropForm;
