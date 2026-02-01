import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFarmStore from '../store/farmStore';
import useAuthStore from '../store/authStore';
import WeatherWidget from '../components/weather/WeatherWidget';

const MobileApp = () => {
    const navigate = useNavigate();
    const { currentFarm } = useFarmStore();
    const { user, logout } = useAuthStore();
    const [activeTab, setActiveTab] = useState('home');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { label: 'Farm Journal', icon: '🚜', path: '/activities', color: '#4caf50', desc: 'Log daily activities' },
        { label: 'Harvests', icon: '🌾', path: '/harvests', color: '#ff9800', desc: 'Record tabular harvests' },
        { label: 'Expenses', icon: '💸', path: '/production-costs', color: '#f44336', desc: 'Track spending' },
        { label: 'Scout Field', icon: '🔭', path: '/fields', color: '#2196f3', desc: 'Map & Monitor' },
        { label: 'Inventory', icon: '📦', path: '/stores', color: '#795548', desc: 'Manage Stock' },
        { label: 'Contracts', icon: '📜', path: '/contracts', color: '#673ab7', desc: 'Sales & Purchases' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Inter, sans-serif', paddingBottom: '80px', position: 'relative', overflowX: 'hidden' }}>

            {/* Mobile Header (App Bar) */}
            <header style={{
                backgroundColor: '#fff',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: 0 }}
                    >
                        ☰
                    </button>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                            <span style={{ color: '#cc0000' }}>PRO</span>FARMER
                        </div>
                        <div style={{ fontSize: '10px', color: '#888', fontWeight: '600' }}>MOBILE EDITION</div>
                    </div>
                </div>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eee',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#555'
                }}>
                    {user?.first_name?.charAt(0) || 'U'}
                </div>
            </header>

            {/* Sidebar Drawer */}
            {isSidebarOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
                    <div
                        onClick={() => setSidebarOpen(false)}
                        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
                    ></div>
                    <div className="animate-slide-in-right" style={{ width: '280px', backgroundColor: '#1a1a1a', color: 'white', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '20px', fontWeight: '900', marginBottom: '30px' }}>MENU</div>
                        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div onClick={() => navigate('/')} style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
                                <span>📺</span> Dashboard
                            </div>
                            <div onClick={() => navigate('/weather')} style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
                                <span>☁️</span> Forecast Center
                            </div>
                            <div onClick={() => navigate('/team')} style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
                                <span>👥</span> Team
                            </div>
                            <div onClick={() => navigate('/vault')} style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
                                <span>📂</span> Documents
                            </div>
                        </nav>
                        <button
                            onClick={handleLogout}
                            style={{ padding: '12px', backgroundColor: '#cc0000', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
                        >
                            LOGOUT
                        </button>
                    </div>
                </div>
            )}

            {/* Content Body */}
            <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Hello, {user?.first_name} 👋</h1>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        {currentFarm ? `Managing ${currentFarm.name}` : 'Select a station to begin'}
                    </p>
                </div>

                {/* Weather Card - Reduced visual noise */}
                <div style={{ marginBottom: '24px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                    <WeatherWidget />
                </div>

                {/* Quick Actions Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(item.path)}
                            style={{
                                backgroundColor: '#fff',
                                padding: '20px',
                                borderRadius: '16px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                border: '1px solid rgba(0,0,0,0.02)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                cursor: 'pointer',
                                transition: 'transform 0.1s',
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                backgroundColor: `${item.color}15`, color: item.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '24px'
                            }}>
                                {item.icon}
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '15px', color: '#111' }}>{item.label}</div>
                                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => navigate('/planner')}
                style={{
                    position: 'fixed',
                    bottom: '90px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '24px',
                    backgroundColor: '#111',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                    fontSize: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 90
                }}
            >
                +
            </button>

            {/* Bottom Navigation Bar */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#fff',
                borderTop: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-around',
                padding: '12px 0 24px 0', // Extra padding for safe area
                zIndex: 100
            }}>
                <NavButton icon="🏠" label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <NavButton icon="📊" label="Reports" active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); navigate('/reports'); }} />
                <NavButton icon="🔔" label="Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} />
                <NavButton icon="👤" label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            </div>
        </div>
    );
};

const NavButton = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: active ? '#cc0000' : '#888',
            cursor: 'pointer'
        }}
    >
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{label}</span>
    </button>
);

export default MobileApp;
