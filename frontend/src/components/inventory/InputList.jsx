import React, { useState, useEffect } from 'react';
import useInventoryStore from '../../store/inventoryStore';
import useFarmStore from '../../store/farmStore';
import useUIStore from '../../store/uiStore';

const InputList = ({ onAdd }) => {
    const { currentFarm } = useFarmStore();
    const { inputs, fetchInputs } = useInventoryStore(); // Assuming fetchInputs exists in inventoryStore
    const { showNotification } = useUIStore();

    // Local state for basic filtering
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        if (currentFarm?.id) {
            // Ensure inventoryStore has fetchInputs or compatible method
            fetchInputs(currentFarm.id);
        }
    }, [currentFarm?.id]);

    const filteredInputs = inputs.filter(item =>
        filter === 'ALL' || item.type === filter
    );

    const categories = ['ALL', 'SEED', 'FERTILIZER', 'CHEMICAL', 'FUEL'];

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
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: '#fafafa', padding: '0 16px' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        style={{
                            padding: '12px 16px',
                            border: 'none',
                            background: 'transparent',
                            color: filter === cat ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: filter === cat ? '700' : '500',
                            fontSize: '13px',
                            cursor: 'pointer',
                            borderBottom: filter === cat ? '2px solid var(--primary)' : '2px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        {cat === 'ALL' ? 'All Items' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Inventory List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', backgroundColor: '#fff', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Item Name</th>
                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Type</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600' }}>Stock Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInputs.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px', transition: 'background 0.1s' }} className="hover-row">
                                <td style={{ padding: '16px 24px', fontWeight: '500', color: 'var(--text-primary)' }}>
                                    {item.name}
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '400', marginTop: '2px' }}>SKU: {item.sku || '—'}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-secondary)',
                                        textTransform: 'capitalize'
                                    }}>
                                        {item.type.toLowerCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600' }}>
                                    <span style={{ color: item.quantity < 10 ? 'var(--error)' : 'var(--success)' }}>
                                        {item.quantity} {item.unit}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredInputs.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                    No inputs found for this category.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Status Bar */}
            <div style={{ padding: '12px 24px', backgroundColor: '#fafafa', color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
                <span>Total Items: <strong>{inputs.length}</strong></span>
                <span style={{ color: inputs.some(i => i.quantity < 10) ? 'var(--error)' : 'var(--success)', fontWeight: '600' }}>
                    {inputs.filter(i => i.quantity < 10).length} Low Stock Alerts
                </span>
            </div>
        </div>
    );
};

export default InputList;
