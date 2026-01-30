import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFarmStore from '../store/farmStore';
import useInventoryStore from '../store/inventoryStore';
import useInfrastructureStore from '../store/infrastructureStore';
import InputForm from '../components/inventory/InputForm';
import StorageForm from '../components/stores/StorageForm';

const Stores = () => {
    const { currentFarm } = useFarmStore();
    const { inputs, fetchInputs, adjustStock, loading: invLoading } = useInventoryStore();
    const { infrastructure, fetchInfrastructure, deleteInfrastructure, loading: infraLoading } = useInfrastructureStore();
    const [searchParams, setSearchParams] = useSearchParams();

    // Default to 'inventory' but respect URL params
    const viewParam = searchParams.get('view') || 'inventory';
    const [filter, setFilter] = useState('all');
    const [internalAddMode, setInternalAddMode] = useState(false);
    const [infrastructureAddMode, setInfrastructureAddMode] = useState(false);
    const [editingInfra, setEditingInfra] = useState(null);

    useEffect(() => {
        if (currentFarm) {
            fetchInputs(currentFarm.id);
            fetchInfrastructure(currentFarm.id);
        }
    }, [currentFarm, fetchInputs, fetchInfrastructure]);

    if (!currentFarm) return <div style={{ padding: '24px' }}>Please select a farm.</div>;

    const inventoryByCategory = (inputs || []).reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {});

    const filteredInputs = (inputs || []).filter(i => filter === 'all' || i.input_type === filter);
    const storageUnits = (infrastructure || []).filter(i => i.type === 'Storage');

    if (internalAddMode) {
        return <InputForm farmId={currentFarm.id} onComplete={() => setInternalAddMode(false)} />;
    }

    if (infrastructureAddMode || editingInfra) {
        return (
            <StorageForm
                farmId={currentFarm.id}
                initialData={editingInfra}
                onComplete={() => {
                    setInfrastructureAddMode(false);
                    setEditingInfra(null);
                }}
            />
        );
    }

    const handleDeleteStorage = async (id) => {
        if (window.confirm('Are you sure you want to delete this storage unit? This action cannot be undone.')) {
            await deleteInfrastructure(id);
        }
    };

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
                    {viewParam === 'inventory' ? (
                        <button className="primary" onClick={() => setInternalAddMode(true)}>+ New Input</button>
                    ) : (
                        <button className="primary" onClick={() => setInfrastructureAddMode(true)}>+ New Storage</button>
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
                    {storageUnits.map(unit => (
                        <div key={unit.id} className="card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                            <div style={{ backgroundColor: '#cc0000', height: '60px', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' }}>
                                <h3 style={{ color: 'white', margin: 0, fontSize: '13px', fontWeight: '900', letterSpacing: '1px' }}>{unit.name.toUpperCase()}</h3>
                                <div className="flex gap-8">
                                    <button
                                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}
                                        onClick={() => setEditingInfra(unit)}
                                    >
                                        EDIT
                                    </button>
                                    <button
                                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}
                                        onClick={() => handleDeleteStorage(unit.id)}
                                    >
                                        DEL
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold' }}>TYPE & STATUS</div>
                                        <div style={{ fontSize: '16px', fontWeight: '900', textTransform: 'capitalize' }}>{unit.sub_type || 'General'} | {unit.status}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold', textAlign: 'right' }}>CAPACITY</div>
                                        <div style={{ fontSize: '18px', fontWeight: '900' }}>{unit.area_sqm || '0'} MT</div>
                                    </div>
                                </div>
                                {unit.notes && (
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                        {unit.notes}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {storageUnits.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#888' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏗️</div>
                            <h3>No storage units found.</h3>
                            <p>Click "+ New Storage" to create your first storage structure.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Stores;
