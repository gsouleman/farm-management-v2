import React, { useState } from 'react';
import CropSelector from '../components/crops/CropSelector';
import CropForm from '../components/crops/CropForm';

const SelectCropsPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);

    const handleAddNew = () => {
        setEditingCrop(null);
        setShowForm(true);
    };

    const handleEdit = (crop) => {
        setEditingCrop(crop);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingCrop(null);
    };

    if (showForm) {
        return (
            <div style={{ padding: '24px' }}>
                <button
                    onClick={handleCloseForm}
                    style={{ marginBottom: '16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    ← Back to List
                </button>
                <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                    <CropForm
                        initialData={editingCrop}
                        onComplete={handleCloseForm}
                    />
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', textTransform: 'uppercase' }}>Manage Cultivation</h1>
            <div style={{ maxWidth: '1000px' }}>
                <p style={{ marginBottom: '16px', color: '#666' }}>Manage your active cultivation selection here.</p>
                <CropSelector
                    onAdd={handleAddNew}
                    onEdit={handleEdit}
                />
            </div>
        </div>
    );
};

export default SelectCropsPage;
