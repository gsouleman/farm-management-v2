import React from 'react';
import InfrastructureLibrary from '../components/infrastructure/InfrastructureLibrary';

const InfrastructureLibraryPage = () => {
    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', textTransform: 'uppercase' }}>Infrastructure Library</h1>

            <div style={{ width: '100%' }}>
                <InfrastructureLibrary />
            </div>
        </div>
    );
};

export default InfrastructureLibraryPage;
