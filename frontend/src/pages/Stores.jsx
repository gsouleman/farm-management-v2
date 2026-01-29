import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFarmStore from '../store/farmStore';
import useInventoryStore from '../store/inventoryStore';
import InputForm from '../components/inventory/InputForm';

const Stores = () => {
    const { currentFarm } = useFarmStore();
    const { inputs, fetchInputs, adjustStock, loading } = useInventoryStore();
    const [searchParams, setSearchParams] = useSearchParams();

    // Default to 'inventory' but respect URL params
    const viewParam = searchParams.get('view') || 'inventory';
    const [filter, setFilter] = useState('all');
    const [internalAddMode, setInternalAddMode] = useState(false);

    useEffect(() => {
        if (currentFarm) {
            fetchInputs(currentFarm.id);
        }
    }, [currentFarm, fetchInputs]);

    if (!currentFarm) return <div style={{ padding: '24px' }}>Please select a farm.</div>;

    const inventoryByCategory = (inputs || []).reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {});

    const filteredInputs = (inputs || []).filter(i => filter === 'all' || i.input_type === filter);

    if (internalAddMode) {
        return <InputForm farmId={currentFarm.id} onComplete={() => setInternalAddMode(false)} />;
    }

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Storage & Inventory</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage physical storage structures and input stock levels.</p>
                </div>
                <div className="flex gap-12">
                    <button
                        className={viewParam === 'inventory' ? 'primary' : 'outline'}
                        onClick={() => setSearchParams({ view: 'inventory' })}
                    >
                        Stock Inventory
                    </button>
                    <button
                        className={viewParam === 'structures' ? 'primary' : 'outline'}
                        onClick={() => setSearchParams({ view: 'structures' })}
                    >
                        Storage Units
                    </button>
                    {viewParam === 'inventory' && (
                        <button className="primary" onClick={() => setInternalAddMode(true)}>+ New Input</button>
                    )}
                </div>
            </div>

            {viewParam === 'inventory' ? (
                <>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        {Object.keys(inventoryByCategory).map(cat => (
                            <div key={cat} className="card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'capitalize' }}>{cat || 'Uncategorized'}</h3>
                                    <span style={{ fontSize: '20px' }}>📦</span>
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '800' }}>{inventoryByCategory[cat]} Items</div>
                            </div>
                        ))}
                    </div>

                    {/* Filter Bar */}
                    <div className="card" style={{ marginBottom: '24px', padding: '12px' }}>
                        <div className="flex gap-12">
                            <button className={filter === 'all' ? 'primary' : 'outline'} style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setFilter('all')}>All</button>
                            <button className={filter === 'fertilizer' ? 'primary' : 'outline'} style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setFilter('fertilizer')}>Fertilizers</button>
                            <button className={filter === 'pesticide' ? 'primary' : 'outline'} style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setFilter('pesticide')}>Pesticides</button>
                            <button className={filter === 'seed' ? 'primary' : 'outline'} style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setFilter('seed')}>Seeds</button>
                        </div>
                    </div>

                    {/* Detailed List */}
                    <div className="card" style={{ padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', borderBottom: '2px solid var(--border)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <th style={{ padding: '16px' }}>Type</th>
                                    <th style={{ padding: '16px' }}>Product</th>
                                    <th style={{ padding: '16px' }}>In Stock</th>
                                    <th style={{ padding: '16px' }}>Status</th>
                                    <th style={{ padding: '16px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInputs.map(input => (
                                    <tr key={input.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ textTransform: 'capitalize', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f0f2f0', fontSize: '10px', fontWeight: 'bold' }}>
                                                {input.input_type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: '700' }}>{input.name}</div>
                                            <div style={{ fontSize: '11px', color: '#888' }}>{input.brand}</div>
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: '700' }}>{input.quantity_in_stock} {input.unit}</td>
                                        <td style={{ padding: '16px' }}>
                                            {input.quantity_in_stock < 10 ? (
                                                <span style={{ color: '#cc0000', fontSize: '10px', fontWeight: '900' }}>● LOW STOCK</span>
                                            ) : (
                                                <span style={{ color: '#2e7d32', fontSize: '10px', fontWeight: '900' }}>● OPTIMAL</span>
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
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                                            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📦</div>
                                            No inventory items recorded in this category.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                /* Storage Units View */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#cc0000', height: '60px', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                            <h3 style={{ color: 'white', margin: 0, fontSize: '13px', fontWeight: '900', letterSpacing: '1px' }}>SILO #01 - MAIN</h3>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold' }}>CAPACITY</div>
                                    <div style={{ fontSize: '18px', fontWeight: '900' }}>500 MT</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold', textAlign: 'right' }}>UTILIZATION</div>
                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#2e7d32' }}>65%</div>
                                </div>
                            </div>
                            <div style={{ height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: '65%', height: '100%', backgroundColor: '#2e7d32' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stores;
