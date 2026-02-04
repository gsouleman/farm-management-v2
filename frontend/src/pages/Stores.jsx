import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFarmStore from '../store/farmStore';
import useInventoryStore from '../store/inventoryStore';
import useInfrastructureStore from '../store/infrastructureStore';
import InputForm from '../components/inventory/InputForm';
import StorageForm from '../components/stores/StorageForm';
import InputList from '../components/inventory/InputList';

const Stores = () => {
    const { currentFarm } = useFarmStore();
    const { inputs, fetchInputs, adjustStock, loading: invLoading } = useInventoryStore();
    const { infrastructure, fetchInfrastructure, deleteInfrastructure, loading: infraLoading } = useInfrastructureStore();
    const [searchParams, setSearchParams] = useSearchParams();

    // Default to 'inventory' but respect URL params
    const viewParam = searchParams.get('view') || 'inventory';
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
        const cat = item.category || item.input_type || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

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
        const { getConfirmation, showNotification } = (await import('../store/uiStore')).default.getState();
        const template = getConfirmation('DELETE_INFRA'); // Storage is a type of infra
        const msg = template ? `${template.title}\n------------------\n${template.body}` : 'Are you sure you want to delete this storage unit?';

        if (window.confirm(msg)) {
            try {
                const response = await deleteInfrastructure(id);
                showNotification(response?.notification?.message || 'Storage unit deleted', 'success');
            } catch (error) {
                showNotification(error.response?.data?.notification?.message || 'Delete failed', 'error');
            }
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Assets & Stock</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage farm assets, structures, and input stock levels.</p>
                </div>
                <div className="flex gap-12">
                    <button
                        className={viewParam === 'inventory' ? 'primary' : 'outline'}
                        onClick={() => setSearchParams({ view: 'inventory' })}
                        style={{
                            borderBottom: viewParam === 'inventory' ? '3px solid var(--primary)' : '3px solid transparent',
                            color: viewParam === 'inventory' ? 'var(--primary)' : '#666',
                        }}
                    >
                        Stock Inventory
                    </button>
                    <button
                        className={viewParam === 'structures' ? 'primary' : 'outline'}
                        onClick={() => setSearchParams({ view: 'structures' })}
                        style={{
                            borderBottom: viewParam === 'structures' ? '3px solid var(--primary)' : '3px solid transparent',
                            color: viewParam === 'structures' ? 'var(--primary)' : '#666',
                        }}
                    >
                        Farm Assets
                    </button>
                    {viewParam === 'inventory' ? (
                        <button className="primary" onClick={() => setInternalAddMode(true)}>+ New Input</button>
                    ) : (
                        <button className="primary" onClick={() => setInfrastructureAddMode(true)}>+ New Asset</button>
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
                                    <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'capitalize' }}>{cat}</h3>
                                    <span style={{ fontSize: '20px' }}>📦</span>
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '800' }}>{inventoryByCategory[cat]} Items</div>
                            </div>
                        ))}
                    </div>

                    <InputList onAdd={() => setInternalAddMode(true)} />
                </>
            ) : (
                /* Assets View - Now as a Table */
                <div className="card" style={{ padding: 0, border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', borderBottom: '2px solid var(--border)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <th style={{ padding: '16px 24px' }}>Asset Name</th>
                                <th style={{ padding: '16px 24px' }}>Type</th>
                                <th style={{ padding: '16px 24px' }}>Status</th>
                                <th style={{ padding: '16px 24px' }}>Capacity/Area</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(infrastructure || []).map(unit => (
                                <tr key={unit.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }} className="hover-row">
                                    <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                        {unit.name}
                                        {unit.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400', marginTop: '2px' }}>{unit.notes}</div>}
                                    </td>
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
                                            {unit.type} {unit.sub_type ? `(${unit.sub_type})` : ''}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            color: unit.status === 'operational' ? 'var(--success)' : 'var(--warning)'
                                        }}>
                                            ● {unit.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>
                                        {unit.area_sqm || '0'} MT / sqm
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div className="flex gap-8 j-end">
                                            <button
                                                className="outline"
                                                style={{ fontSize: '11px', padding: '4px 12px' }}
                                                onClick={() => setEditingInfra(unit)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="outline"
                                                style={{ fontSize: '11px', padding: '4px 12px', color: 'var(--error)', borderColor: '#fed7d7' }}
                                                onClick={() => handleDeleteStorage(unit.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(infrastructure || []).length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏗️</div>
                                        <h3 style={{ margin: 0 }}>No farm assets located.</h3>
                                        <p style={{ margin: '8px 0 0 0' }}>Click "+ New Asset" to register your first infrastructure unit.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Stores;
