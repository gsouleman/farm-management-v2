import React from 'react';
import CropLibrary from '../components/crops/CropLibrary';

const CropLibraryPage = () => {
    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', textTransform: 'uppercase' }}>List of Crops</h1>

            <div style={{ width: '100%' }}>
                <CropLibrary />
            </div>
        </div>
    );
};

export default CropLibraryPage;
