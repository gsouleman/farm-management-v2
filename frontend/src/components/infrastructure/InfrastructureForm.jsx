import React, { useState } from 'react';
import useInfrastructureStore from '../../store/infrastructureStore';
import useFarmStore from '../../store/farmStore';
import FieldMap from '../fields/FieldMap';
import { INFRASTRUCTURE_TYPES } from '../../constants/agriculturalData';
import * as turf from '@turf/turf';

const InfrastructureForm = ({ farmId, onComplete }) => {
    const { createInfrastructure, infrastructure } = useInfrastructureStore();
    const { currentFarm } = useFarmStore();

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        status: 'operational',
        construction_date: new Date().toISOString().split('T')[0],
        cost: '',
        notes: '',
        boundary_coordinates: [],
        boundary_manual: '',
        area_sqm: '',
        perimeter: ''
    });
    const [loading, setLoading] = useState(false);

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
            await createInfrastructure(farmId, formData);
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0 }}>Register New Farm Infrastructure</h3>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                        <label>Asset Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Main Warehouse"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                        >
                            <option value="">-- Select Type --</option>
                            {INFRASTRUCTURE_TYPES.map(type => (
                                <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                        <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--primary)', textTransform: 'uppercase' }}>Structure Location Plan</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Allocate space for this building on the map</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '400px' }}>
                        <div style={{ padding: '16px', backgroundColor: '#f1f5f9', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>SURVEY COORDINATES (LAT, LNG)</label>
                            <textarea
                                value={formData.boundary_manual}
                                onChange={(e) => handleManualCoordsChange(e.target.value)}
                                placeholder="4.05, 9.71&#10;4.06, 9.71..."
                                style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0', resize: 'none' }}
                            />
                        </div>
                        <div style={{ height: '100%' }}>
                            <FieldMap
                                center={currentFarm?.boundary?.coordinates?.[0]?.[0] ? [currentFarm.boundary.coordinates[0][0][1], currentFarm.boundary.coordinates[0][0][0]] : null}
                                farmBoundary={currentFarm?.boundary}
                                infrastructure={infrastructure}
                                manualCoordinates={formData.boundary_coordinates}
                                editable={true}
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
                        <label>Construction Date</label>
                        <input
                            type="date"
                            value={formData.construction_date}
                            onChange={(e) => setFormData({ ...formData, construction_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Asset Cost (XAF)</label>
                        <input
                            type="number"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label>Additional Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
                    />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="submit" className="primary" style={{ flex: 2 }} disabled={loading}>
                        {loading ? 'Registering...' : 'Save Infrastructure Asset'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Discard</button>
                </div>
            </form>
        </div>
    );
};

export default InfrastructureForm;
