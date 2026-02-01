import React from 'react';
import InputList from '../components/inventory/InputList';

const InputListPage = () => {
    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', textTransform: 'uppercase' }}>Input Inventory List</h1>
            <div style={{ maxWidth: '600px' }}>
                <p style={{ marginBottom: '16px', color: '#666' }}>Track and manage your farming inputs (Seeds, Fertilizer, Chemicals, Fuel).</p>
                <InputList />
            </div>
        </div>
    );
};

export default InputListPage;
