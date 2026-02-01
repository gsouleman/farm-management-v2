import React, { useState } from 'react';
import InputList from '../components/inventory/InputList';
import InputForm from '../components/inventory/InputForm';
import useFarmStore from '../store/farmStore';

const InputListPage = () => {
    const [showForm, setShowForm] = useState(false);
    const { currentFarm } = useFarmStore();

    if (showForm) {
        return (
            <div style={{ padding: '24px' }}>
                <button
                    onClick={() => setShowForm(false)}
                    style={{ marginBottom: '16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    ← Back to List
                </button>
                <InputForm
                    farmId={currentFarm?.id}
                    onComplete={() => setShowForm(false)}
                />
            </div>
        );
    }
    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', textTransform: 'uppercase' }}>Input Inventory List</h1>
            <div style={{ maxWidth: '600px' }}>
                <p style={{ marginBottom: '16px', color: '#666' }}>Track and manage your farming inputs (Seeds, Fertilizer, Chemicals, Fuel).</p>
                <InputList onAdd={() => setShowForm(true)} />
            </div>
        </div>
    );
};

export default InputListPage;
