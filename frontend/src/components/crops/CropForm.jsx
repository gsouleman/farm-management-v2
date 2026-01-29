import React, { useState } from 'react';
import useCropStore from '../../store/cropStore';
import useFarmStore from '../../store/farmStore';
import FieldMap from '../fields/FieldMap';
import { CROP_CATEGORIES } from '../../constants/agriculturalData';
import * as turf from '@turf/turf';

const CropForm = ({ fieldId, onComplete }) => {
    const { createCrop } = useCropStore();
    const { fields } = useFarmStore();

    // Find parent field for map context
    const parentField = fields.find(f => f.id === fieldId);

    const [formData, setFormData] = useState({
        crop_type: '',
        variety: '',
        planting_date: new Date().toISOString().split('T')[0],
        expected_harvest_date: '',
        planted_area: '',
        boundary_coordinates: [], // Captured from map
        boundary_manual: '', // Textbox for manual entry
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

    const cropCategories = CROP_CATEGORIES;

    const currentCropVarieties = Object.values(cropCategories)
        .flat()
        .find(c => c.id === formData.crop_type)?.varieties || [];

    const handleManualCoordsChange = (text) => {
        try {
            const lines = text.split('\n').filter(l => l.trim());
            const coords = lines.map(line => {
                const parts = line.split(/[,\s]+/).map(p => parseFloat(p.trim()));
                if (parts.length >= 2) {
                    // Expecting [lat, lng] from user but internal format is [lng, lat]
                    return [parts[1], parts[0]];
                }
                return null;
            }).filter(c => c !== null);

            if (coords.length >= 3) {
                const polygon = turf.polygon([coords]);
                const area = turf.area(polygon) / 10000;
                const perimeter = turf.length(polygon, { units: 'meters' });

                setFormData(prev => ({
                    ...prev,
                    boundary_coordinates: coords,
                    planted_area: area.toFixed(2),
                    perimeter: perimeter.toFixed(2),
                    boundary_manual: text
                }));
            } else {
                setFormData(prev => ({ ...prev, boundary_manual: text }));
            }
        } catch (err) {
            setFormData(prev => ({ ...prev, boundary_manual: text }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createCrop(fieldId, formData);
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
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
                            {Object.entries(cropCategories).map(([category, items]) => (
                                <optgroup key={category} label={category}>
                                    {items.map(item => (
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
                            {currentCropVarieties.map(v => (
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

                {/* Land Allocation Map Section */}
                <div className="card" style={{ backgroundColor: '#fcfcfc', marginBottom: '24px', border: '1px solid #e0e0e0', padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Land Allocation Map</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Draw on map OR enter coordinates below</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '400px' }}>
                        <div style={{ padding: '16px', backgroundColor: '#f1f5f9', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>BOUNDARY COORDINATES (LAT, LNG)</label>
                            <textarea
                                value={formData.boundary_manual}
                                onChange={(e) => handleManualCoordsChange(e.target.value)}
                                placeholder="4.05, 9.71&#10;4.06, 9.71&#10;4.06, 9.72&#10;4.05, 9.71"
                                style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0', resize: 'none' }}
                            />
                            <div style={{ marginTop: '12px', fontSize: '10px', color: '#64748b', lineHeight: '1.4' }}>
                                Enter one GPS point per line.<br />Example: 4.05, 9.71
                            </div>
                        </div>
                        <div style={{ height: '100%' }}>
                            <FieldMap
                                center={parentField?.boundary?.coordinates?.[0]?.[0] ? [parentField.boundary.coordinates[0][0][1], parentField.boundary.coordinates[0][0][0]] : null}
                                farmBoundary={parentField?.boundary}
                                manualCoordinates={formData.boundary_coordinates}
                                editable={true}
                                onBoundaryCreate={(data) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        boundary_coordinates: data.coordinates,
                                        boundary_manual: data.coordinates.map(c => `${c[1]}, ${c[0]}`).join('\n'),
                                        planted_area: data.area,
                                        perimeter: data.perimeter
                                    }));
                                }}
                            />
                        </div>
                    </div>

                    {(formData.boundary_coordinates.length > 0) && (
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
