import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useFarmStore from '../store/farmStore';

const MainLayout = ({ children }) => {
    const { user, logout } = useAuthStore();
    const { farms, currentFarm, setCurrentFarm } = useFarmStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: '#1a1d21',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                zIndex: 100
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #2d3238' }}>
                    <h2 style={{ margin: 0, color: '#4caf50', fontSize: '20px', letterSpacing: '1px' }}>FARMER PRO</h2>
                    <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>BY AGRIXP INSPIRED</div>
                </div>

                {/* Farm Selector */}
                <div style={{ padding: '20px' }}>
                    <label style={{ fontSize: '12px', color: '#6c757d', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Current Farm</label>
                    <select
                        value={currentFarm?.id || ''}
                        onChange={(e) => {
                            const farm = farms.find(f => f.id === e.target.value);
                            if (farm) setCurrentFarm(farm);
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            backgroundColor: '#2d3238',
                            color: 'white',
                            border: 'none',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        {farms.length === 0 && <option value="">No Farms Found</option>}
                        {farms.map(farm => (
                            <option key={farm.id} value={farm.id}>{farm.name}</option>
                        ))}
                    </select>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '10px' }}>
                    <SidebarLink to="/" icon="📊" label="Dashboard" />
                    <SidebarLink to="/crops" icon="🌱" label="Crops" />
                    <SidebarLink to="/planner" icon="📅" label="Crop Planner" />
                    <SidebarLink to="/fields" icon="🗺️" label="My Fields" />
                    <SidebarLink to="/activities" icon="🚜" label="Activities" />
                    <SidebarLink to="/inventory" icon="📦" label="Inventory" />
                    <SidebarLink to="/harvests" icon="🌾" label="Harvests" />
                    <SidebarLink to="/weather" icon="☁️" label="Weather" />
                    <SidebarLink to="/vault" icon="📂" label="Documents" />
                    <SidebarLink to="/team" icon="👥" label="Team" />
                    <SidebarLink to="/reports" icon="📑" label="Reports" />
                </nav>

            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top Header */}
                <header style={{
                    height: '70px',
                    backgroundColor: '#1a1d21',
                    borderBottom: '4px solid var(--primary)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    padding: '0 40px',
                    color: 'white',
                    zIndex: 90
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '0.02em' }}>{user?.first_name} {user?.last_name}</div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    color: '#adb5bd',
                                    padding: 0,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    marginTop: '2px'
                                }}
                            >
                                Logout
                            </button>
                        </div>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: '#4caf50',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            border: '2px solid rgba(255,255,255,0.1)'
                        }}>
                            {user?.first_name?.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

const SidebarLink = ({ to, icon, label }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            color: isActive ? 'white' : '#adb5bd',
            textDecoration: 'none',
            backgroundColor: isActive ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
            marginBottom: '4px',
            transition: 'all 0.2s'
        })}
    >
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontWeight: '500' }}>{label}</span>
    </NavLink>
);

export default MainLayout;
