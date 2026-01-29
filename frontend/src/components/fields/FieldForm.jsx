import React, { useState } from 'react';
import useFarmStore from '../../store/farmStore';
import FieldMap from './FieldMap';

const FieldForm = ({ onComplete }) => {
    const { currentFarm, createField } = useFarmStore();
    const [formData, setFormData] = useState({
        name: '',
        field_number: '',
        soil_type: '',
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
            await createField({
                ...formData,
                farm_id: currentFarm.id
            });
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Define Field Boundary</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label>Field Designation</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. North Plateau"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label>Lot / Field Number</label>
                        <input
                            type="text"
                            value={formData.field_number}
                            onChange={(e) => setFormData({ ...formData, field_number: e.target.value })}
                            placeholder="e.g. #42"
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label>Soil Classification</label>
                        <input
                            type="text"
                            value={formData.soil_type}
                            onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                            placeholder="e.g. Silty Loam"
                        />
                    </div>

                    <div className="card" style={{ background: 'var(--bg-main)', borderStyle: 'dashed', textAlign: 'center', padding: '16px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Surface Measurement</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>{calculatedArea} <span style={{ fontSize: '14px' }}>ha</span></div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                            {loading ? 'Processing...' : 'Save Field'}
                        </button>
                        <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Discard</button>
                    </div>
                </form>

                <div>
                    <div style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent)', borderRadius: '50%' }}></span>
                        Use the drawing tools on the map right to delineate the exact field perimeter.
                    </div>
                    <div style={{ height: '480px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
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
