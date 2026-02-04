import React, { useState, useEffect } from 'react';
import useInventoryStore from '../../store/inventoryStore';
import useFarmStore from '../../store/farmStore';
import useUIStore from '../../store/uiStore';

const InputList = ({ onAdd }) => {
    const { currentFarm } = useFarmStore();
    const { inputs, fetchInputs, adjustStock } = useInventoryStore();
    const { showNotification } = useUIStore();

    // Local state for basic filtering
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (currentFarm?.id) {
            fetchInputs(currentFarm.id);
        }
    }, [currentFarm?.id]);

    const filteredInputs = inputs.filter(item =>
        filter === 'all' || item.input_type === filter
    );

    const categories = [
        { id: 'all', label: 'All Items' },
        { id: 'fertilizer', label: 'Fertilizers' },
        { id: 'pesticide', label: 'Pesticides' },
        { id: 'seed', label: 'Seeds' },
        { id: 'fuel', label: 'Fuel' }
    ];

    const handleAdjust = async (id) => {
        const adj = prompt('Adjust stock by (e.g. 50 or -10):');
        if (adj && !isNaN(parseFloat(adj))) {
            try {
                await adjustStock(id, parseFloat(adj));
                showNotification('Stock level updated', 'success');
            } catch (error) {
                showNotification('Failed to adjust stock', 'error');
            }
        }
    };

    return (
        <div className="card animate-fade-in" style={{ padding: '0', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#fff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px', fontWeight: '700' }}>
                    Input Inventory
                </h3>
                <button
                    className="primary"
                    style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'none',
                        borderRadius: '8px'
                    }}
                    onClick={onAdd}
                >
                    + New Stock
                </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: '#fafafa', padding: '0 16px', overflowX: 'auto' }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setFilter(cat.id)}
                        style={{
                            padding: '12px 16px',
                            border: 'none',
                            background: 'transparent',
                            color: filter === cat.id ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: filter === cat.id ? '700' : '500',
                            fontSize: '13px',
                            cursor: 'pointer',
                            borderBottom: filter === cat.id ? '2px solid var(--primary)' : '2px solid transparent',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Inventory List */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', borderBottom: '2px solid var(--border)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <th style={{ padding: '16px 24px' }}>Type</th>
                            <th style={{ padding: '16px 24px' }}>Product</th>
                            <th style={{ padding: '16px 24px' }}>In Stock</th>
                            <th style={{ padding: '16px 24px' }}>Status</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInputs.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px', transition: 'background 0.1s' }} className="hover-row">
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        backgroundColor: '#f0f2f0',
                                        color: '#2e7d32',
                                        textTransform: 'uppercase'
                                    }}>
                                        {item.input_type || 'GENERAL'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-primary)' }}>
                                    <div style={{ fontWeight: '700' }}>{item.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400', marginTop: '2px' }}>{item.brand || 'No Brand'}</div>
                                </td>
                                <td style={{ padding: '16px 24px', fontWeight: '700' }}>
                                    {item.quantity_in_stock} {item.unit}
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    {item.quantity_in_stock < 10 ? (
                                        <span style={{ color: 'var(--error)', fontSize: '10px', fontWeight: '900' }}>● LOW STOCK</span>
                                    ) : (
                                        <span style={{ color: 'var(--success)', fontSize: '10px', fontWeight: '900' }}>● OPTIMAL</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <button
                                        className="outline"
                                        style={{ fontSize: '11px', padding: '4px 8px' }}
                                        onClick={() => handleAdjust(item.id)}
                                    >
                                        Adjust
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredInputs.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>📦</div>
                                    No inventory items found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Status Bar */}
            <div style={{ padding: '12px 24px', backgroundColor: '#fafafa', color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
                <span>Total Items: <strong>{inputs.length}</strong></span>
                <span style={{ color: inputs.some(i => (i.quantity_in_stock || i.quantity) < 10) ? 'var(--error)' : 'var(--success)', fontWeight: '600' }}>
                    {inputs.filter(i => (i.quantity_in_stock || i.quantity) < 10).length} Low Stock Alerts
                </span>
            </div>
        </div>
    );
};

export default InputList;
