import React from 'react';
import CropLibrary from '../components/crops/CropLibrary';

const CropLibraryPage = () => {
    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', textTransform: 'uppercase' }}>Select Your Crops</h1>
            <p style={{ marginBottom: '16px', color: '#666' }}>
                Manage the master library of crops available for cultivation planning.
                Only crops selected as "Active" here will appear in dropdown lists.
            </p>
            <div style={{ maxWidth: '1000px' }}>
                <CropLibrary />
            </div>
        </div>
    );
};

export default CropLibraryPage;
