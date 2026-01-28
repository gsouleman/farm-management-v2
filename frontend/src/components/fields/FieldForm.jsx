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
        <div className="glass-card animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px' }}>Add New Field Boundary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Field Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Field Number</label>
                        <input
                            type="text"
                            value={formData.field_number}
                            onChange={(e) => setFormData({ ...formData, field_number: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Soil Type</label>
                        <input
                            type="text"
                            value={formData.soil_type}
                            onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <div style={{ marginBottom: '24px', padding: '12px', background: 'var(--background)', borderRadius: '8px' }}>
                        <strong>Calculated Area:</strong> {calculatedArea} ha
                    </div>
                    <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Field'}
                    </button>
                </form>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Draw Boundary on Map</label>
                    <FieldMap
                        center={currentFarm?.coordinates?.coordinates ? [currentFarm.coordinates.coordinates[1], currentFarm.coordinates.coordinates[0]] : [37.7749, -122.4194]}
                        onBoundaryCreate={handleBoundarySave}
                        editable={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default FieldForm;
