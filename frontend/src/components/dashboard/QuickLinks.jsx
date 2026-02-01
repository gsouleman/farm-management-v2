import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickLinks = () => {
    const navigate = useNavigate();

    const links = [
        { label: 'New Harvest', icon: '🌾', path: '/harvests', color: '#bb1919' },
        { label: 'Add Expense', icon: '💸', path: '/production-costs?view=settings', color: '#000' },
        { label: 'Scout Field', icon: '🔭', path: '/scouting', color: '#000' },
        { label: 'Log Activity', icon: '🚜', path: '/planner', color: '#000' },
    ];

    return (
        <div className="card animate-fade-in" style={{ padding: '20px', border: '1px solid #000', borderRadius: '0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #bb1919', paddingBottom: '8px', display: 'inline-block' }}>
                QUICK ACCESS
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                {links.map((link, i) => (
                    <div
                        key={i}
                        onClick={() => navigate(link.path)}
                        style={{
                            padding: '15px',
                            backgroundColor: '#f9f9f9',
                            border: '1px solid #ddd',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = link.color; e.currentTarget.style.backgroundColor = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.backgroundColor = '#f9f9f9'; }}
                    >
                        <div style={{ fontSize: '20px' }}>{link.icon}</div>
                        <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: link.color }}>
                            {link.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuickLinks;
