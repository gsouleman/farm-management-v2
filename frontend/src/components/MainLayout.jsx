import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useFarmStore from '../store/farmStore';

const MainLayout = ({ children }) => {
    const { user, logout } = useAuthStore();
    const { farms, currentFarm, setCurrentFarm } = useFarmStore();
    const navigate = useNavigate();

    // State for collapsible sections
    const [openGroups, setOpenGroups] = useState({
        estate: true,
        cultivation: true,
        finance: false,
        systems: false
    });

    const toggleGroup = (group) => {
        setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* CNN Style Sidebar */}
            <aside style={{
                width: '280px',
                backgroundColor: '#000000',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 15px rgba(0,0,0,0.5)',
                zIndex: 100,
                borderRight: '1px solid #333'
            }}>
                <div style={{ padding: '30px 24px', borderBottom: '1px solid #222' }}>
                    <h2 style={{
                        margin: 0,
                        color: 'white',
                        fontSize: '22px',
                        fontWeight: '800',
                        letterSpacing: '-0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ backgroundColor: '#cc0000', padding: '2px 8px', borderRadius: '2px' }}>PRO</span>
                        FARMER
                    </h2>
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '6px', fontWeight: 'bold', letterSpacing: '1px' }}>GLOBAL AGRICULTURE NETWORK</div>
                </div>

                {/* Farm Selector - CNN Styled */}
                <div style={{ padding: '20px 24px', backgroundColor: '#111' }}>
                    <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>STATION SELECTOR</label>
                    <select
                        value={currentFarm?.id || ''}
                        onChange={(e) => {
                            const farm = farms.find(f => f.id === e.target.value);
                            if (farm) setCurrentFarm(farm);
                        }}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#222',
                            color: 'white',
                            border: '1px solid #333',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        {farms.length === 0 && <option value="">No Active Stations</option>}
                        {farms.map(farm => (
                            <option key={farm.id} value={farm.id}>{farm.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, overflowY: 'auto', padding: '20px 12px' }}>
                    <SidebarLink to="/" icon="📺" label="DASHBOARD" />

                    <NavGroup
                        label="ESTATE & INFRASTRUCTURE"
                        isOpen={openGroups.estate}
                        onToggle={() => toggleGroup('estate')}
                    >
                        <SidebarLink to="/fields" icon="🗺️" label="Estates & Fields" sub />
                        <SidebarLink to="/infrastructure" icon="🏗️" label="Infrastructure" sub />
                    </NavGroup>

                    <NavGroup
                        label="CULTIVATION"
                        isOpen={openGroups.cultivation}
                        onToggle={() => toggleGroup('cultivation')}
                    >
                        <SidebarLink to="/crops" icon="🌿" label="Crop Portfolio" sub />
                        <SidebarLink to="/planner" icon="📅" label="Growth Planner" sub />
                        <SidebarLink to="/activities" icon="🚜" label="Operations Log" sub />
                        <SidebarLink to="/harvests" icon="🌾" label="Harvest Registry" sub />
                    </NavGroup>

                    <NavGroup
                        label="FINANCE & LOGISTICS"
                        isOpen={openGroups.finance}
                        onToggle={() => toggleGroup('finance')}
                    >
                        <SidebarLink to="/inventory" icon="📦" label="Stock & Inventory" sub />
                        <SidebarLink to="/production-costs" icon="💰" label="Cost Analytics" sub />
                        <SidebarLink to="/reports" icon="📊" label="Performance Insights" sub />
                    </NavGroup>

                    <NavGroup
                        label="SYSTEMS & COMPLIANCE"
                        isOpen={openGroups.systems}
                        onToggle={() => toggleGroup('systems')}
                    >
                        <SidebarLink to="/weather" icon="☁️" label="Forecast Center" sub />
                        <SidebarLink to="/vault" icon="📂" label="Knowledge Vault" sub />
                        <SidebarLink to="/team" icon="👥" label="Human Resources" sub />
                    </NavGroup>
                </nav>

                {/* Footer User Profile */}
                <div style={{ padding: '20px', borderTop: '1px solid #222', backgroundColor: '#000' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#cc0000',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '18px'
                        }}>
                            {user?.first_name?.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>{user?.first_name}</div>
                            <button onClick={handleLogout} style={{ fontSize: '11px', color: '#cc0000', background: 'none', padding: 0, fontWeight: 'bold', cursor: 'pointer' }}>LOGOUT</button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* CNN Red bar top */}
                <div style={{ height: '4px', backgroundColor: '#cc0000' }}></div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

const NavGroup = ({ label, children, isOpen, onToggle }) => (
    <div style={{ marginBottom: '8px' }}>
        <button
            onClick={onToggle}
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                background: 'none',
                color: '#888',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '1px',
                cursor: 'pointer',
                textAlign: 'left',
                border: 'none',
                fontFamily: 'inherit'
            }}
        >
            {label}
            <span>{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && <div style={{ paddingLeft: '8px' }}>{children}</div>}
    </div>
);

const SidebarLink = ({ to, icon, label, sub }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: sub ? '8px 16px' : '12px 16px',
            color: isActive ? 'white' : '#aaa',
            textDecoration: 'none',
            backgroundColor: isActive ? '#cc0000' : 'transparent',
            margin: sub ? '2px 0' : '4px 0',
            fontSize: sub ? '13px' : '14px',
            fontWeight: sub ? '500' : '700',
            transition: 'all 0.2s'
        })}
    >
        {!sub && <span style={{ fontSize: '18px' }}>{icon}</span>}
        <span>{label.toUpperCase()}</span>
    </NavLink>
);

export default MainLayout;
