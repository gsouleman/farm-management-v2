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
                <nav style={{ flex: 1, overflowY: 'auto', padding: '20px 12px' }}>
                    <NavGroup
                        label="CONTROL CENTER"
                        isOpen={true}
                        onToggle={() => { }}
                    >
                        <SidebarLink to="/" icon="📺" label="DASHBOARD" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="FARM & INFRASTRUCTURE"
                        isOpen={openGroups.estate}
                        onToggle={() => toggleGroup('estate')}
                    >
                        <SidebarLink to="/fields" icon="🗺️" label="Manage Farm" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/infrastructure" icon="🏗️" label="Manage Infrastructure" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="CULTIVATION & OPERATIONS"
                        isOpen={openGroups.cultivation}
                        onToggle={() => toggleGroup('cultivation')}
                    >
                        <SidebarLink to="/select-crops" icon="🌿" label="Manage Cultivation" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/crop-library" icon="✅" label="Manage Crops" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/activities" icon="🚜" label="Manage Journal" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/harvests" icon="🌾" label="Manage Harvest" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/planner" icon="📅" label="Manage Production" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="FINANCE & CONTRACTS"
                        isOpen={openGroups.finance}
                        onToggle={() => toggleGroup('finance')}
                    >
                        <SidebarLink to="/contracts" icon="📜" label="Contracts" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/production-costs" icon="💰" label="Cost Analytics" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/reports" icon="📊" label="Farm Reports" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="LOGISTICS & STORAGE"
                        isOpen={true}
                        onToggle={() => { }}
                    >
                        <SidebarLink to="/stores?view=structures" icon="🏢" label="Stores & Silos" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/input-list" icon="📦" label="Input Inventory" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="SYSTEMS & COMPLIANCE"
                        isOpen={openGroups.systems}
                        onToggle={() => toggleGroup('systems')}
                    >
                        <SidebarLink to="/weather" icon="☁️" label="Forecast Center" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/production-costs?view=settings" icon="⚙️" label="Cost Settings" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/vault" icon="📂" label="Knowledge Vault" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/team" icon="👥" label="Human Resources" sub onClick={handleNavItemClick} />
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

const SidebarLink = ({ to, icon, label, sub, nested, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: isActive && !sub ? '12px' : '12px',
            padding: sub ? (nested ? '8px 16px 8px 32px' : '8px 16px') : '12px 16px',
            color: isActive ? 'white' : '#aaa',
            textDecoration: 'none',
            backgroundColor: isActive ? 'var(--primary)' : 'transparent',
            margin: sub ? '2px 0' : '4px 0',
            fontSize: nested ? '13px' : (sub ? '14px' : '15px'),
            fontWeight: sub ? '400' : '600',
            transition: 'all 0.2s',
            borderRadius: '6px',
            borderLeft: 'none'
        })}
    >
        {!sub && <span style={{ fontSize: '18px' }}>{icon}</span>}
        {sub && icon && <span style={{ fontSize: nested ? '12px' : '14px', marginRight: '4px' }}>{icon}</span>}
        <span>{label.toUpperCase()}</span>
    </NavLink>
);

export default MainLayout;
