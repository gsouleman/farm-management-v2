import React, { useState } from 'react';
import useFarmStore from '../../store/farmStore';
import FieldMap from './FieldMap';

const FieldForm = ({ onComplete }) => {
    const { currentFarm, createField } = useFarmStore();
    const [formData, setFormData] = useState({
        name: '',
        field_number: '',
        soil_type: '',
        drainage: '',
        slope: '',
        irrigation: false,
        area_unit: 'hectares',
        notes: '',
        boundary_coordinates: []
    });
    const [calculatedArea, setCalculatedArea] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleBoundarySave = (data) => {
        setFormData({ ...formData, boundary_coordinates: data.coordinates });
        setCalculatedArea(data.area);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.boundary_coordinates.length === 0) {
            alert('Please draw a field boundary on the map first.');
            return;
        }

        setLoading(true);
        try {
            await createField(currentFarm.id, {
                ...formData,
                area: calculatedArea
            });
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Define Field Boundary & Profile</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label>Field Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label>Lot #</label>
                                <input
                                    type="text"
                                    value={formData.field_number}
                                    onChange={(e) => setFormData({ ...formData, field_number: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label>Soil Type</label>
                                <input
                                    type="text"
                                    value={formData.soil_type}
                                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Drainage</label>
                                <input
                                    type="text"
                                    value={formData.drainage}
                                    onChange={(e) => setFormData({ ...formData, drainage: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label>Slope</label>
                                <input
                                    type="text"
                                    value={formData.slope}
                                    onChange={(e) => setFormData({ ...formData, slope: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Area Unit</label>
                                <select
                                    value={formData.area_unit}
                                    onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                                >
                                    <option value="hectares">Hectares</option>
                                    <option value="acres">Acres</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                checked={formData.irrigation}
                                onChange={(e) => setFormData({ ...formData, irrigation: e.target.checked })}
                                style={{ width: 'auto' }}
                                id="irrigation-toggle"
                            />
                            <label htmlFor="irrigation-toggle" style={{ margin: 0 }}>Irrigation Available</label>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--bg-main)', borderStyle: 'dashed', textAlign: 'center', padding: '16px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MAPPED SURFACE AREA</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>{calculatedArea} <span style={{ fontSize: '14px' }}>{formData.area_unit === 'hectares' ? 'ha' : 'ac'}</span></div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label>Operational Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="3"
                            style={{ resize: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Saving...' : 'Establish Field'}
                        </button>
                        <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Discard</button>
                    </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '550px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <FieldMap
                            center={currentFarm?.coordinates?.coordinates ? [currentFarm.coordinates.coordinates[1], currentFarm.coordinates.coordinates[0]] : [37.7749, -122.4194]}
                            onBoundaryCreate={handleBoundarySave}
                            editable={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldForm;
