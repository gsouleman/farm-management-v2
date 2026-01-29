import React, { useState, useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import api from '../services/api';

const Contracts = () => {
    const { currentFarm } = useFarmStore();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // list, add

    useEffect(() => {
        if (currentFarm) {
            fetchContracts();
        }
    }, [currentFarm]);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/contracts/farm/${currentFarm.id}`);
            setContracts(res.data);
        } catch (err) {
            console.error('Error fetching contracts:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!currentFarm) return <div style={{ padding: '24px' }}>Please select a farm.</div>;

    const stats = [
        { label: 'Active Sales', value: (contracts || []).filter(c => c.contract_type === 'sales' && c.status === 'active').length, color: 'var(--success)' },
        { label: 'Pending Purchases', value: (contracts || []).filter(c => c.contract_type === 'purchase' && c.status === 'draft').length, color: 'var(--warning)' },
        { label: 'Total Value', value: `${(contracts || []).reduce((sum, c) => sum + parseFloat(c.total_value || 0), 0).toLocaleString()} XAF`, color: 'var(--primary)' }
    ];

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Contract Registry</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage your sales and purchase agreements with partners.</p>
                </div>
                <button className="primary" onClick={() => { }}>+ New Contract</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {stats.map((s, i) => (
                    <div key={i} className="card" style={{ padding: '20px', borderLeft: `4px solid ${s.color}` }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '2px solid var(--border)', backgroundColor: '#fafafa' }}>
                            <th style={{ padding: '16px' }}>TYPE</th>
                            <th style={{ padding: '16px' }}>PARTNER</th>
                            <th style={{ padding: '16px' }}>COMMODITY</th>
                            <th style={{ padding: '16px' }}>QUANTITY</th>
                            <th style={{ padding: '16px' }}>TOTAL VALUE</th>
                            <th style={{ padding: '16px' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.map(c => (
                            <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '2px',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        backgroundColor: c.contract_type === 'sales' ? '#e8f5e9' : '#e3f2fd',
                                        color: c.contract_type === 'sales' ? '#2e7d32' : '#1565c0'
                                    }}>
                                        {c.contract_type.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', fontWeight: '700' }}>{c.partner_name}</td>
                                <td style={{ padding: '16px' }}>{c.Crop?.crop_type || 'General'}</td>
                                <td style={{ padding: '16px' }}>{c.quantity} {c.unit}</td>
                                <td style={{ padding: '16px', fontWeight: '700' }}>{parseFloat(c.total_value).toLocaleString()} <span style={{ fontSize: '10px' }}>XAF</span></td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: c.status === 'active' ? 'var(--success)' : '#888' }}>
                                        {c.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {contracts.length === 0 && !loading && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No contracts found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Contracts;
