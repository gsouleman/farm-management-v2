import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useFarmStore from '../store/farmStore';
import SyncStatus from './common/SyncStatus';
import SystemModal from './common/SystemModal';
import syncService from '../services/syncService';

const MainLayout = ({ children }) => {
    const { user, logout } = useAuthStore();
    const { farms, currentFarm, setCurrentFarm, fetchFarms } = useFarmStore();
    const navigate = useNavigate();

    // Init: Load farms if empty
    useEffect(() => {
        fetchFarms();
    }, [fetchFarms]);

    // Pull data from network on farm change/focus
    useEffect(() => {
        if (currentFarm?.id && navigator.onLine) {
            syncService.pullFromNetwork(currentFarm.id);
        }
    }, [currentFarm?.id]);

    // State for collapsible sections (Restored fix)
    const [openGroups, setOpenGroups] = useState({
        operations: true,
        production: true,
        finance: false,
        inventory: false,
        admin: false
    });

    const toggleGroup = (group) => {
        setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Close menu on navigation
    const handleNavItemClick = () => {
        if (window.innerWidth < 1024) {
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa', position: 'relative' }}>
            {/* Mobile Header */}
            {/* Mobile Header */}
            <header className="mobile-header" style={{ backgroundColor: '#fff', borderBottom: '1px solid #eee', color: '#111', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="hamburger" onClick={toggleMobileMenu}>
                        <span style={{ backgroundColor: '#111' }}></span>
                        <span style={{ backgroundColor: '#111' }}></span>
                        <span style={{ backgroundColor: '#111' }}></span>
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                            <span style={{ color: '#cc0000' }}>PRO</span>FARMER
                        </div>
                    </div>
                </div>

            </header>

            {/* Mobile Overlay */}
            <div
                className={`mobile-sidebar-overlay ${isMobileMenuOpen ? 'show' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Modern Sidebar */}
            <aside className={`sidebar-container ${isMobileMenuOpen ? 'open' : ''}`} style={{
                width: '280px',
                backgroundColor: 'var(--bg-sidebar)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 15px rgba(0,0,0,0.1)',
                zIndex: 100,
                borderRight: '1px solid #333'
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #333' }}>
                    <h2 style={{
                        margin: 0,
                        color: 'white',
                        fontSize: '22px',
                        fontWeight: '700',
                        letterSpacing: '-0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ backgroundColor: 'var(--primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '14px' }}>PRO</span>
                        FARMER
                    </h2>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', fontWeight: '500' }}>INTELLIGENT AGRICULTURE</div>
                </div>

                {/* Farm Selector */}
                <div style={{ padding: '20px 24px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '11px', color: '#888', fontWeight: '600' }}>ACTIVE STATION</label>
                        <button
                            onClick={() => {
                                navigate('/');
                                window.dispatchEvent(new CustomEvent('open-new-farm'));
                                handleNavItemClick();
                            }}
                            style={{
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                padding: '4px 10px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                borderRadius: '4px'
                            }}
                        >
                            + NEW
                        </button>
                    </div>
                    <select
                        value={currentFarm?.id || ''}
                        onChange={(e) => {
                            const farm = farms.find(f => f.id === e.target.value);
                            if (farm) setCurrentFarm(farm);
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#000',
                            color: 'white',
                            border: '1px solid #444',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        {farms.length === 0 && <option value="">Select a Station</option>}
                        {farms.map(farm => (
                            <option key={farm.id} value={farm.id}>{farm.name}</option>
                        ))}
                    </select>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
                    <SidebarLink to="/" icon="📊" label="Home" onClick={handleNavItemClick} />

                    <NavGroup
                        label="OPERATIONS"
                        isOpen={openGroups.operations}
                        onToggle={() => toggleGroup('operations')}
                    >
                        <SidebarLink to="/fields" icon="🗺️" label="Map & Fields" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/infrastructure" icon="🏗️" label="Infrastructure" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/weather" icon="☁️" label="Weather" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/agri-calendar" icon="📅" label="Planner" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/advanced-features" icon="🚀" label="Advanced Features" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="PRODUCTION"
                        isOpen={openGroups.production}
                        onToggle={() => toggleGroup('production')}
                    >
                        <SidebarLink to="/select-crops" icon="🌿" label="Active Cultivation" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/activities" icon="🚜" label="Field Journal" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/harvests" icon="🌾" label="Harvest Records" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/planner" icon="📅" label="Crop Planner" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/crop-library" icon="📚" label="Crop Library" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="INVENTORY & ASSETS"
                        isOpen={openGroups.inventory}
                        onToggle={() => toggleGroup('inventory')}
                    >
                        <SidebarLink to="/input-list" icon="📦" label="Inputs (Seed/Chem)" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/stores?view=structures" icon="🏢" label="Stores & Silos" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="FINANCIALS"
                        isOpen={openGroups.finance}
                        onToggle={() => toggleGroup('finance')}
                    >
                        <SidebarLink to="/production-costs" icon="💰" label="Cost Analysis" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/reports" icon="📈" label="Reports" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/contracts" icon="📜" label="Contracts" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="ADMINISTRATION"
                        isOpen={openGroups.admin}
                        onToggle={() => toggleGroup('admin')}
                    >
                        <SidebarLink to="/team" icon="👥" label="Team & Roles" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/production-costs?view=settings" icon="⚙️" label="Settings" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/vault" icon="📂" label="Documents" sub onClick={handleNavItemClick} />
                    </NavGroup>
                </nav>

                <SyncStatus />

                {/* Footer User Profile */}
                <div style={{ padding: '20px', borderTop: '1px solid #222', backgroundColor: '#000' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: 'var(--primary)',
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
                            <button onClick={handleLogout} style={{ fontSize: '11px', color: 'var(--error)', background: 'none', padding: 0, fontWeight: 'bold', cursor: 'pointer' }}>LOGOUT</button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {children}
                </div>
            </main>
            <SystemModal />
        </div>
    );
};

const SidebarLink = ({ to, icon, label, sub, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: sub ? '10px 12px 10px 44px' : '12px 16px',
            color: isActive ? 'var(--primary-light)' : '#ccc',
            textDecoration: 'none',
            fontSize: sub ? '13px' : '14px',
            fontWeight: isActive ? '600' : '400',
            borderLeft: isActive ? '3px solid var(--primary-light)' : '3px solid transparent',
            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            transition: 'all 0.2s',
            marginBottom: '2px',
            borderRadius: '0 4px 4px 0'
        })}
    >
        <span style={{ marginRight: '12px', fontSize: '16px', opacity: sub ? 0.8 : 1 }}>{icon}</span>
        {label}
    </NavLink>
);

const NavGroup = ({ label, children, isOpen, onToggle }) => (
    <div style={{ marginBottom: '8px' }}>
        <div
            onClick={onToggle}
            style={{
                padding: '12px 16px',
                color: '#888',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '1px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                userSelect: 'none',
                textTransform: 'uppercase'
            }}
        >
            {label}
            <span style={{ fontSize: '10px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
        </div>
        <div style={{
            height: isOpen ? 'auto' : '0',
            overflow: 'hidden',
            transition: 'height 0.3s ease'
        }}>
            {children}
        </div>
    </div>
);



export default MainLayout;
