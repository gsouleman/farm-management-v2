import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFarmStore from '../store/farmStore';
import WeatherWidget from '../components/weather/WeatherWidget';

const MobileApp = () => {
    const navigate = useNavigate();
    const { currentFarm } = useFarmStore();

    const menuItems = [
        { label: 'Farm Journal', icon: '🚜', path: '/activities', color: '#4caf50' },
        { label: 'Harvests', icon: '🌾', path: '/harvests', color: '#ff9800' },
        { label: 'Expenses', icon: '💸', path: '/production-costs', color: '#f44336' },
        { label: 'Scout Field', icon: '🔭', path: '/fields', color: '#2196f3' },
        { label: 'Weather', icon: '☁️', path: '/weather', color: '#607d8b' },
        { label: 'Inventory', icon: '📦', path: '/stores', color: '#795548' },
    ];

    return (
        <div className="animate-fade-in" style={{ padding: '16px', paddingBottom: '80px' }}>
            {/* Mobile Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>MOBILE DASHBOARD</h2>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>{currentFarm?.name}</div>
            </div>

            {/* Weather Widget */}
            <div style={{ marginBottom: '20px' }}>
                <WeatherWidget />
            </div>

            {/* Grid Menu */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(item.path)}
                        style={{
                            backgroundColor: '#fff',
                            padding: '24px 16px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            border: `1px solid ${item.color}20`,
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ fontSize: '32px' }}>{item.icon}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Action FAB */}
            <button
                onClick={() => navigate('/planner')}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#cc0000',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(204,0,0,0.4)',
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100
                }}
            >
                +
            </button>
        </div>
    );
};

export default MobileApp;
