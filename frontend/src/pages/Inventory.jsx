import React, { useEffect, useState } from 'react';
import useFarmStore from '../store/farmStore';
import useInventoryStore from '../store/inventoryStore';
import InputForm from '../components/inventory/InputForm';

const Inventory = () => {
    const { currentFarm } = useFarmStore();
    const { inputs, fetchInputs, adjustStock, loading } = useInventoryStore();
    const [view, setView] = useState('list'); // list, add
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (currentFarm) {
            fetchInputs(currentFarm.id);
        }
    }, [currentFarm, fetchInputs]);

    if (!currentFarm) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>No Farm Selected</h2>
            <p>Please select a farm from the sidebar to view inventory.</p>
        </div>
    );

    if (loading && inputs.length === 0) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p>Loading inventory data...</p>
        </div>
    );

    const filteredInputs = inputs.filter(i => filter === 'all' || i.input_type === filter);

    if (view === 'add') return <InputForm farmId={currentFarm.id} onComplete={() => setView('list')} />;

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Input Inventory</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage fertilizers, pesticides, seeds and other farm supplies.</p>
                </div>
                <button className="primary" onClick={() => setView('add')}>+ New Input</button>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="flex gap-16">
                    <button className={filter === 'all' ? 'primary' : 'outline'} style={{ padding: '6px 16px', fontSize: '13px' }} onClick={() => setFilter('all')}>All Items</button>
                    <button className={filter === 'fertilizer' ? 'primary' : 'outline'} style={{ padding: '6px 16px', fontSize: '13px' }} onClick={() => setFilter('fertilizer')}>Fertilizers</button>
                    <button className={filter === 'pesticide' ? 'primary' : 'outline'} style={{ padding: '6px 16px', fontSize: '13px' }} onClick={() => setFilter('pesticide')}>Pesticides</button>
                    <button className={filter === 'seed' ? 'primary' : 'outline'} style={{ padding: '6px 16px', fontSize: '13px' }} onClick={() => setFilter('seed')}>Seeds</button>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '16px' }}>Type</th>
                            <th style={{ padding: '16px' }}>Product Name</th>
                            <th style={{ padding: '16px' }}>Brand</th>
                            <th style={{ padding: '16px' }}>In Stock</th>
                            <th style={{ padding: '16px' }}>Storage</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInputs.map(input => (
                            <tr key={input.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                <td style={{ padding: '16px' }}><span style={{ textTransform: 'capitalize', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f0f2f0', fontSize: '11px', fontWeight: 'bold' }}>{input.input_type}</span></td>
                                <td style={{ padding: '16px', fontWeight: '600' }}>{input.name}</td>
                                <td style={{ padding: '16px' }}>{input.brand || '—'}</td>
                                <td style={{ padding: '16px' }}>{input.quantity_in_stock} {input.unit}</td>
                                <td style={{ padding: '16px' }}>{input.storage_location || '—'}</td>
                                <td style={{ padding: '16px' }}>
                                    {input.quantity_in_stock < 10 ? (
                                        <span style={{ color: 'var(--error)', fontSize: '11px', fontWeight: 'bold' }}>⚠️ LOW STOCK</span>
                                    ) : (
                                        <span style={{ color: 'var(--success)', fontSize: '11px', fontWeight: 'bold' }}>✓ OPTIMAL</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <button className="outline" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => {
                                        const adj = prompt('Adjust stock by (e.g. 50 or -10):');
                                        if (adj) adjustStock(input.id, parseFloat(adj));
                                    }}>Adjust</button>
                                </td>
                            </tr>
                        ))}
                        {filteredInputs.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No inventory items found matching the filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
