import React from 'react';
import CropSelector from '../components/crops/CropSelector';

const SelectCropsPage = () => {
    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', textTransform: 'uppercase' }}>Select Crops</h1>
            <div style={{ maxWidth: '600px' }}>
                <p style={{ marginBottom: '16px', color: '#666' }}>Manage your active cultivation selection here.</p>
                <CropSelector />
            </div>
        </div>
    );
};

export default SelectCropsPage;
