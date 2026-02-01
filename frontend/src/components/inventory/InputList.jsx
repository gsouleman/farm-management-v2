import React, { useState, useEffect } from 'react';
import useInventoryStore from '../../store/inventoryStore';
import useFarmStore from '../../store/farmStore';
import useUIStore from '../../store/uiStore';

const InputList = () => {
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
        <div className="card animate-fade-in" style={{ padding: '0', border: '1px solid #000', borderRadius: '0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#000', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    INPUT INVENTORY
                </h3>
                <button
                    style={{
                        backgroundColor: '#bb1919',
                        color: 'white',
                        border: 'none',
                        padding: '4px 10px',
                        fontSize: '10px',
                        fontWeight: '800',
                        textTransform: 'uppercase'
                    }}
                    onClick={() => showNotification('Opening Inventory Form...', 'info')}
                >
                    + NEW STOCK
                </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid #000', backgroundColor: '#f5f5f5' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            background: filter === cat ? '#fff' : 'transparent',
                            color: filter === cat ? '#bb1919' : '#888',
                            fontWeight: '900',
                            fontSize: '10px',
                            cursor: 'pointer',
                            borderRight: '1px solid #ddd',
                            borderBottom: filter === cat ? '2px solid #bb1919' : 'none'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Inventory List */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '10px', color: '#888', backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '10px 15px' }}>ITEM NAME</th>
                            <th style={{ padding: '10px 15px' }}>TYPE</th>
                            <th style={{ padding: '10px 15px', textAlign: 'right' }}>STOCK LEVEL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInputs.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee', fontSize: '12px' }}>
                                <td style={{ padding: '12px 15px', fontWeight: '700', color: '#000' }}>
                                    {item.name}
                                    <div style={{ fontSize: '10px', color: '#666', fontWeight: '400' }}>SKU: {item.sku || 'N/A'}</div>
                                </td>
                                <td style={{ padding: '12px 15px' }}>
                                    <span style={{
                                        fontSize: '9px',
                                        fontWeight: '800',
                                        padding: '2px 6px',
                                        backgroundColor: '#eee',
                                        color: '#555',
                                        textTransform: 'uppercase'
                                    }}>
                                        {item.type}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '800' }}>
                                    <span style={{ color: item.quantity < 10 ? '#bb1919' : '#000' }}>
                                        {item.quantity} {item.unit}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredInputs.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '12px' }}>
                                    No inputs found for this category.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Status Bar */}
            <div style={{ padding: '8px 15px', backgroundColor: '#000', color: '#fff', fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>TOTAL ITEMS: {inputs.length}</span>
                <span style={{ color: '#bb1919', fontWeight: 'bold' }}>LOW STOCK ALERTS: {inputs.filter(i => i.quantity < 10).length}</span>
            </div>
        </div>
    );
};

export default InputList;
