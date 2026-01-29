import React, { useState, useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import useInventoryStore from '../store/inventoryStore';

const Stores = () => {
    const { currentFarm } = useFarmStore();
    const { inputs, fetchInputs, loading } = useInventoryStore();
    const [view, setView] = useState('inventory'); // inventory, structures

    useEffect(() => {
        if (currentFarm) {
            fetchInputs(currentFarm.id);
        }
    }, [currentFarm]);

    if (!currentFarm) return <div style={{ padding: '24px' }}>Please select a farm.</div>;

    const inventoryByCategory = inputs.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Storage & Inventory</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage physical storage structures and input stock levels.</p>
                </div>
                <div className="flex gap-12">
                    <button className={view === 'inventory' ? 'primary' : 'outline'} onClick={() => setView('inventory')}>Stock Inventory</button>
                    <button className={view === 'structures' ? 'primary' : 'outline'} onClick={() => setView('structures')}>Storage Units</button>
                </div>
            </div>

            {view === 'inventory' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {Object.keys(inventoryByCategory).map(cat => (
                        <div key={cat} className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', textTransform: 'capitalize' }}>{cat || 'Uncategorized'}</h3>
                                <span style={{ fontSize: '20px' }}>📦</span>
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '800' }}>{inventoryByCategory[cat]} Items</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Total products registered in this category.</div>
                        </div>
                    ))}
                    {inputs.length === 0 && !loading && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#888' }}>No inventory items recorded.</div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#cc0000', height: '60px', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                            <h3 style={{ color: 'white', margin: 0, fontSize: '14px', fontWeight: '900' }}>SILO #01 - MAIN</h3>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold' }}>CAPACITY</div>
                                    <div style={{ fontSize: '18px', fontWeight: '900' }}>500 MT</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold', textAlign: 'right' }}>UTILIZATION</div>
                                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--success)' }}>65%</div>
                                </div>
                            </div>
                            <div style={{ height: '12px', backgroundColor: '#eee', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{ width: '65%', height: '100%', backgroundColor: 'var(--success)' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stores;
