import React, { useState, useEffect } from 'react';
import useInfrastructureStore from '../../store/infrastructureStore';
import useFarmStore from '../../store/farmStore';
import FieldMap from '../fields/FieldMap';
import { INFRASTRUCTURE_TYPES } from '../../constants/agriculturalData';
import * as turf from '@turf/turf';

const InfrastructureForm = ({ farmId, onComplete, initialData = null }) => {
    const { createInfrastructure, updateInfrastructure, infrastructure } = useInfrastructureStore();
    const { currentFarm, fields } = useFarmStore();

    const [selectedFieldId, setSelectedFieldId] = useState(initialData?.field_id || '');
    const parentField = (fields || []).find(f => f?.id?.toString() === selectedFieldId);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        type: initialData?.type || '',
        status: initialData?.status || 'operational',
        construction_date: initialData?.construction_date || new Date().toISOString().split('T')[0],
        cost: initialData?.cost || '',
        notes: initialData?.notes || '',
        boundary_coordinates: initialData?.boundary?.coordinates?.[0] || [],
        boundary_manual: initialData?.boundary_manual || (initialData?.boundary?.coordinates?.[0] ? initialData.boundary.coordinates[0].map(c => `${c[1]}, ${c[0]}`).join('\n') : ''),
        area_sqm: initialData?.area_sqm || '',
        perimeter: initialData?.perimeter || '',
        field_id: initialData?.field_id || ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData(prev => ({ ...prev, field_id: selectedFieldId }));
    }, [selectedFieldId]);

    const handleManualCoordsChange = (text) => {
        try {
            const lines = text.split('\n').filter(l => l.trim());
            const coords = lines.map(line => {
                const parts = line.split(/[,\s]+/).map(p => parseFloat(p.trim()));
                if (parts.length >= 2) {
                    return [parts[1], parts[0]]; // [lng, lat]
                }
                return null;
            }).filter(c => c !== null);

            if (coords.length >= 3) {
                const polygon = turf.polygon([coords]);
                const area = turf.area(polygon); // sqm
                const perimeter = turf.length(polygon, { units: 'meters' });

                setFormData(prev => ({
                    ...prev,
                    boundary_coordinates: coords,
                    area_sqm: area.toFixed(2),
                    perimeter: perimeter.toFixed(2),
                    boundary_manual: text
                }));
            } else {
                setFormData(prev => ({ ...prev, boundary_manual: text, boundary_coordinates: [] }));
            }
        } catch (err) {
            setFormData(prev => ({ ...prev, boundary_manual: text }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const targetFarmId = farmId || currentFarm?.id;
        if (!targetFarmId) {
            alert('Selection Error: Please ensure a farm is selected.');
            setLoading(false);
            return;
        }

        try {
            // Normalize numeric fields: empty strings or NaN should be null for the backend
            const parseNum = (val) => {
                if (val === '' || val === null || val === undefined) return null;
                const parsed = parseFloat(val);
                return isNaN(parsed) ? null : parsed;
            };

            const submissionData = {
                ...formData,
                field_id: selectedFieldId || null,
                cost: parseNum(formData.cost),
                area_sqm: parseNum(formData.area_sqm),
                perimeter: parseNum(formData.perimeter)
            };

            if (initialData) {
                await updateInfrastructure(initialData.id, submissionData);
            } else {
                await createInfrastructure(targetFarmId, submissionData);
            }
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Registration failed:', error);
            const serverMsg = error.response?.data?.message || 'Failed to save infrastructure asset';
            alert(`Error: ${serverMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div className="card-header" style={{ borderBottomColor: '#edf2f7', padding: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#1a365d' }}>
                    {initialData ? 'Edit Farm Infrastructure' : 'Register New Farm Infrastructure'}
                </h3>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #edf2f7' }}>
                    <label htmlFor="field_id" style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>TARGET FIELD (OPTIONAL)</label>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Select a field to center the map and allocate the structure within its boundaries.</p>
                    <select
                        id="field_id"
                        name="field_id"
                        value={selectedFieldId}
                        onChange={(e) => setSelectedFieldId(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                    >
                        <option value="">-- Farm Level (Not specific to a field) --</option>
                        {(fields || []).map(f => (
                            <option key={f.id} value={f.id}>{f.name} ({f.area} ha)</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                        <label htmlFor="name" style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Asset Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="e.g. Main Warehouse"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="type" style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Type</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        >
                            <option value="">-- Select Type --</option>
                            {INFRASTRUCTURE_TYPES.map(type => (
                                <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        >
                            <option value="operational">Operational</option>
                            <option value="under_construction">Under Construction</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="retired">Retired</option>
                        </select>
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#fcfcfc', marginBottom: '24px', border: '1px solid #e0e0e0', padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Structure Location Plan</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Allocate space for this building on the map</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) 2fr', height: '400px' }}>
                        <div style={{ padding: '16px', backgroundColor: '#f1f5f9', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                            <label htmlFor="boundary_manual" style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#4a5568' }}>SURVEY COORDINATES (LAT, LNG)</label>
                            <textarea
                                id="boundary_manual"
                                name="boundary_manual"
                                value={formData.boundary_manual}
                                onChange={(e) => handleManualCoordsChange(e.target.value)}
                                placeholder="4.05, 9.71&#10;4.06, 9.71..."
                                style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0', resize: 'none' }}
                            />
                        </div>
                        <div style={{ height: '100%' }}>
                            <FieldMap
                                center={parentField?.boundary?.coordinates?.[0]?.[0] ? [parentField.boundary.coordinates[0][0][1], parentField.boundary.coordinates[0][0][0]] : (currentFarm?.boundary?.coordinates?.[0]?.[0] ? [currentFarm.boundary.coordinates[0][0][1], currentFarm.boundary.coordinates[0][0][0]] : [3.848, 11.502])}
                                farmBoundary={parentField?.boundary || currentFarm?.boundary}
                                fields={fields}
                                infrastructure={infrastructure.filter(i => i.id !== initialData?.id)}
                                manualCoordinates={formData.boundary_coordinates}
                                editable={true}
                                currentLabel={formData.name}
                                onBoundaryCreate={(data) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        boundary_coordinates: data.coordinates,
                                        boundary_manual: data.coordinates.map(c => `${c[1]}, ${c[0]}`).join('\n'),
                                        area_sqm: (data.area * 10000).toFixed(2), // Convert ha to sqm
                                        perimeter: data.perimeter
                                    }));
                                }}
                            />
                        </div>
                    </div>

                    {(formData.boundary_coordinates.length > 0) && (
                        <div style={{ padding: '12px 20px', backgroundColor: '#fffbe6', borderTop: '1px solid #ffe58f', fontSize: '12px', display: 'flex', gap: '30px' }}>
                            <span><strong>Ground Area:</strong> {formData.area_sqm} m²</span>
                            <span><strong>Perimeter:</strong> {formData.perimeter} m</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                        <label htmlFor="construction_date" style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Construction Date</label>
                        <input
                            id="construction_date"
                            name="construction_date"
                            type="date"
                            value={formData.construction_date}
                            onChange={(e) => setFormData({ ...formData, construction_date: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="cost" style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Asset Cost (XAF)</label>
                        <input
                            id="cost"
                            name="cost"
                            type="text"
                            value={parseFloat(formData.cost || 0).toLocaleString()}
                            readOnly
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', backgroundColor: '#f8fafc', fontWeight: 'bold' }}
                        />
                        <p style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>Automatic: Sum of all associated infrastructure log operations.</p>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label htmlFor="notes" style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Additional Notes</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Details about building materials, purpose, etc."
                        rows="3"
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', resize: 'vertical' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="submit" className="primary" style={{ flex: 2, padding: '14px', fontSize: '16px' }} disabled={loading}>
                        {loading ? 'Saving...' : initialData ? 'Update Infrastructure Asset' : 'Save Infrastructure Asset'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1, padding: '14px' }}>Discard</button>
                </div>
            </form>
        </div>
    );
};

export default InfrastructureForm;
