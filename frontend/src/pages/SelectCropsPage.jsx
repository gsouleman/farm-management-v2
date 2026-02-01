import React, { useState } from 'react';
import CropSelector from '../components/crops/CropSelector';
import CropForm from '../components/crops/CropForm';

const SelectCropsPage = () => {
    const [showForm, setShowForm] = useState(false);

    if (showForm) {
        return (
            <div style={{ padding: '24px' }}>
                <button
                    onClick={() => setShowForm(false)}
                    style={{ marginBottom: '16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    ← Back to List
                </button>
                <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                    <CropForm onComplete={() => setShowForm(false)} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', textTransform: 'uppercase' }}>Select Crops</h1>
            <div style={{ maxWidth: '600px' }}>
                <p style={{ marginBottom: '16px', color: '#666' }}>Manage your active cultivation selection here.</p>
                <CropSelector onAdd={() => setShowForm(true)} />
            </div>
        </div>
    );
};

export default SelectCropsPage;
