import React from 'react';
import { useNavigate } from 'react-router-dom';

const FormHeader = ({ title, subtitle, onBack, onClose, icon = '📄' }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            window.history.back();
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '24px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            borderRadius: '12px 12px 0 0'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={handleBack}
                    style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#4a5568',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#edf2f7'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.transform = 'translateX(0)'; }}
                    title="Go Back"
                >
                    ←
                </button>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{icon}</span>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1a202c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {title}
                        </h2>
                    </div>
                    {subtitle && (
                        <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', marginTop: '2px' }}>
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={handleClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: '#a0aec0',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#e53e3e'; e.currentTarget.style.backgroundColor = '#fff5f5'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = '#a0aec0'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                title="Close and Return to Dashboard"
            >
                ✕
            </button>
        </div>
    );
};

export default FormHeader;
