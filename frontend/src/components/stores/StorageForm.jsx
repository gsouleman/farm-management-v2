import React, { useState, useEffect } from 'react';
import useInfrastructureStore from '../../store/infrastructureStore';

const StorageForm = ({ farmId, onComplete, initialData = null }) => {
    const { createInfrastructure, updateInfrastructure, loading, error } = useInfrastructureStore();
    const [formData, setFormData] = useState({
        name: '',
        type: 'Storage',
        status: 'operational',
        area_sqm: '', // Using area_sqm for capacity (e.g. Metric Tons)
        notes: '',
        sub_type: 'Silo' // Custom field for better categorization
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                type: initialData.type || 'Storage',
                status: initialData.status || 'operational',
                area_sqm: initialData.area_sqm || '',
                notes: initialData.notes || '',
                sub_type: initialData.sub_type || 'Silo'
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Normalize numeric fields: empty strings or NaN should be null for the backend
            const parseNum = (val) => {
                if (val === '' || val === null || val === undefined) return null;
                const parsed = parseFloat(val);
                return isNaN(parsed) ? null : parsed;
            };

            const submissionData = {
                ...formData,
                area_sqm: parseNum(formData.area_sqm)
            };

            if (initialData) {
                await updateInfrastructure(initialData.id, submissionData);
            } else {
                await createInfrastructure(farmId, submissionData);
            }
            onComplete();
        } catch (err) {
            console.error('Failed to save storage unit:', err);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>{initialData ? 'Edit Storage Unit' : 'Add New Storage Unit'}</h2>
                <button className="outline" onClick={onComplete}>Back</button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>NAME</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Silo #01 - North"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>STORAGE TYPE</label>
                        <select
                            name="sub_type"
                            value={formData.sub_type}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        >
                            <option value="Silo">Silo</option>
                            <option value="Warehouse">Warehouse</option>
                            <option value="Cold Storage">Cold Storage</option>
                            <option value="Shed">Shed</option>
                            <option value="Tank">Tank</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>STATUS</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        >
                            <option value="operational">Operational</option>
                            <option value="under_construction">Under Construction</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="retired">Retired</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>CAPACITY (MT or SQM)</label>
                    <input
                        type="number"
                        name="area_sqm"
                        value={formData.area_sqm}
                        onChange={handleChange}
                        placeholder="e.g. 500"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-muted)' }}>NOTES</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Additional details about the storage..."
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', resize: 'vertical' }}
                    ></textarea>
                </div>

                <button type="submit" className="primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                    {loading ? 'Saving...' : initialData ? 'Update Storage' : 'Create Storage'}
                </button>
            </form>
        </div>
    );
};

export default StorageForm;
