import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useFarmStore from '../../store/farmStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const { farms, currentFarm, setCurrentFarm } = useFarmStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 40px',
            backgroundColor: '#ffffff',
            borderBottom: '4px solid var(--primary)',
            position: 'sticky',
            top: '0',
            zIndex: '1000'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <h2 style={{ margin: '0', color: 'var(--primary)', fontWeight: 'bold' }}>FARMER PRO</h2>

                <select
                    value={currentFarm?.id || ''}
                    onChange={(e) => {
                        const farm = farms.find(f => f.id === e.target.value);
                        if (farm) setCurrentFarm(farm);
                    }}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'white',
                        fontWeight: '500'
                    }}
                >
                    {farms.length === 0 && <option>No Farms Found</option>}
                    {farms.map(farm => (
                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <span style={{ fontWeight: '500' }}>{user?.first_name} {user?.last_name}</span>
                <button onClick={handleLogout} style={{
                    background: 'none',
                    color: 'var(--error)',
                    padding: '8px 16px',
                    border: '1px solid var(--error)'
                }}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
