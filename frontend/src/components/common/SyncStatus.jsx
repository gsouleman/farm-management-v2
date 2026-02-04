import React, { useEffect, useState } from 'react';
import syncService from '../../services/syncService';
import { db } from '../../services/db';

const SyncStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const updateStatus = async () => {
        setIsOnline(navigator.onLine);
        const count = await db.sync_outbox.where({ status: 'pending' }).count();
        setPendingCount(count);
    };

    useEffect(() => {
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        const interval = setInterval(async () => {
            await updateStatus();
            if (navigator.onLine && !isSyncing) {
                const count = await db.sync_outbox.where({ status: 'pending' }).count();
                if (count > 0) {
                    setIsSyncing(true);
                    await syncService.syncOutbox();
                    setIsSyncing(false);
                    await updateStatus();
                }
            }
        }, 5000);

        updateStatus();

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
            clearInterval(interval);
        };
    }, [isSyncing]);

    const styles = {
        container: {
            padding: '10px 24px',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderTop: '1px solid #222',
            backgroundColor: '#000',
            color: isOnline ? '#4caf50' : '#888',
            transition: 'all 0.3s ease'
        },
        dot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isSyncing ? '#2196f3' : isOnline ? '#4caf50' : '#ff9800',
            boxShadow: isSyncing ? '0 0 10px #2196f3' : isOnline ? '0 0 10px #4caf50' : 'none',
            animation: isSyncing ? 'pulse 1.5s infinite' : 'none'
        },
        pending: {
            marginLeft: 'auto',
            color: 'white',
            backgroundColor: '#cc0000',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '9px',
            fontWeight: '900',
            display: pendingCount > 0 ? 'inline' : 'none'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.dot} />
            <span>{isSyncing ? 'Synchronizing Data...' : isOnline ? 'System Online' : 'Offline Mode Enabled'}</span>
            <span style={styles.pending}>{pendingCount} QUEUED</span>
            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(1.5); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                `}
            </style>
        </div>
    );
};

export default SyncStatus;
