import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useFarmStore from '../store/farmStore';
import SyncStatus from './common/SyncStatus';
import syncService from '../services/syncService';

const MainLayout = ({ children }) => {
    const { user, logout } = useAuthStore();
    const { farms, currentFarm, setCurrentFarm } = useFarmStore();
    const navigate = useNavigate();

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
            <header className="mobile-header">
                <div className="hamburger" onClick={toggleMobileMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div style={{ marginLeft: '15px', fontWeight: '800', fontSize: '18px' }}>
                    <span style={{ color: '#cc0000' }}>PRO</span>FARMER
                </div>
            </header>

            {/* Mobile Overlay */}
            <div
                className={`mobile-sidebar-overlay ${isMobileMenuOpen ? 'show' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* CNN Style Sidebar */}
            <aside className={`sidebar-container ${isMobileMenuOpen ? 'open' : ''}`} style={{
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '11px', color: '#888', fontWeight: 'bold' }}>STATION SELECTOR</label>
                        <button
                            onClick={() => {
                                navigate('/');
                                window.dispatchEvent(new CustomEvent('open-new-farm'));
                                handleNavItemClick();
                            }}
                            style={{
                                backgroundColor: '#cc0000',
                                color: 'white',
                                border: 'none',
                                padding: '2px 8px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                borderRadius: '2px'
                            }}
                        >
                            + NEW STATION
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
                    <NavGroup
                        label="CONTROL CENTER"
                        isOpen={true}
                        onToggle={() => { }}
                    >
                        <SidebarLink to="/" icon="📺" label="DASHBOARD" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="ESTATE & INFRASTRUCTURE"
                        isOpen={openGroups.estate}
                        onToggle={() => toggleGroup('estate')}
                    >
                        <SidebarLink to="/fields" icon="🗺️" label="Land & Fields" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/infrastructure" icon="🏗️" label="Infrastructure Assets" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="CULTIVATION & OPERATIONS"
                        isOpen={openGroups.cultivation}
                        onToggle={() => toggleGroup('cultivation')}
                    >
                        <SidebarLink to="/crops" icon="🌿" label="Crop Management" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/activities" icon="🚜" label="Farm Journal" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/harvests" icon="🌾" label="Harvest Records" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/planner" icon="📅" label="Production Planner" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="FINANCE & CONTRACTS"
                        isOpen={openGroups.finance}
                        onToggle={() => toggleGroup('finance')}
                    >
                        <SidebarLink to="/contracts" icon="📜" label="Contracts" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/production-costs" icon="💰" label="Cost Analytics" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/reports" icon="📊" label="Performance Insights" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="LOGISTICS & STORAGE"
                        isOpen={true}
                        onToggle={() => { }}
                    >
                        <SidebarLink to="/stores?view=structures" icon="🏢" label="Stores & Silos" sub onClick={handleNavItemClick} />
                        <SidebarLink to="/stores?view=inventory" icon="📦" label="Input Stock" sub onClick={handleNavItemClick} />
                    </NavGroup>

                    <NavGroup
                        label="SYSTEMS & COMPLIANCE"
                        isOpen={openGroups.systems}
                        onToggle={() => toggleGroup('systems')}
                    >
                        <SidebarLink to="/weather" icon="☁️" label="Forecast Center" sub onClick={handleNavItemClick} />
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

const SidebarLink = ({ to, icon, label, sub, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: isActive && !sub ? '12px' : '12px',
            padding: sub ? '8px 16px' : '12px 16px',
            color: isActive ? 'white' : '#aaa',
            textDecoration: 'none',
            backgroundColor: isActive ? '#cc0000' : 'transparent',
            margin: sub ? '2px 0' : '4px 0',
            fontSize: sub ? '13px' : '14px',
            fontWeight: sub ? '500' : '700',
            transition: 'all 0.2s',
            borderLeft: isActive && !sub ? '4px solid white' : 'none'
        })}
    >
        {!sub && <span style={{ fontSize: '18px' }}>{icon}</span>}
        {sub && icon && <span style={{ fontSize: '14px', marginRight: '4px' }}>{icon}</span>}
        <span>{label.toUpperCase()}</span>
    </NavLink>
);

export default MainLayout;
