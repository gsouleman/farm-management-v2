import React, { useEffect } from 'react';
import useUIStore from '../../store/uiStore';

const GlobalNotification = () => {
    const { notification, hideNotification, clearNotification } = useUIStore();

    useEffect(() => {
        if (notification && !notification.visible) {
            const timer = setTimeout(() => {
                clearNotification();
            }, 500); // Wait for fade-out animation
            return () => clearTimeout(timer);
        }
    }, [notification, clearNotification]);

    if (!notification) return null;

    const isError = notification.type === 'error';
    const isSuccess = notification.type === 'success';

    const styles = {
        container: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '450px',
            width: 'calc(100% - 40px)',
            transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
            transform: notification.visible ? 'translateX(0)' : 'translateX(120%)',
            opacity: notification.visible ? 1 : 0,
        },
        banner: {
            backgroundColor: isError ? '#bb1919' : isSuccess ? '#166534' : '#000',
            color: '#fff',
            padding: '20px 24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            borderLeft: '8px solid #000',
            position: 'relative'
        },
        icon: {
            fontSize: '24px',
            marginTop: '-2px'
        },
        content: {
            flex: 1
        },
        header: {
            margin: '0 0 4px 0',
            fontSize: '12px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            opacity: 0.9
        },
        message: {
            margin: 0,
            fontSize: '15px',
            fontWeight: '700',
            lineHeight: '1.4',
            whiteSpace: 'pre-wrap'
        },
        close: {
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '18px',
            opacity: 0.6,
            transition: 'opacity 0.2s'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.banner}>
                <div style={styles.icon}>
                    {isError ? '🚨' : isSuccess ? '✅' : 'ℹ️'}
                </div>
                <div style={styles.content}>
                    <div style={styles.header}>
                        {isError ? 'Operational Alert' : isSuccess ? 'Success Protocol' : 'System Intelligence'}
                    </div>
                    <p style={styles.message}>{notification.message}</p>
                </div>
                <button
                    style={styles.close}
                    onClick={hideNotification}
                    onMouseOver={(e) => e.target.style.opacity = 1}
                    onMouseOut={(e) => e.target.style.opacity = 0.6}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default GlobalNotification;
