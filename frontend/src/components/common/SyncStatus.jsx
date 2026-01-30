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
            padding: '8px 16px',
            fontSize: '10px',
            fontWeight: '900',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderTop: '1px solid #333',
            backgroundColor: isOnline ? '#000' : '#1a1a1a',
            color: isOnline ? '#4caf50' : '#888'
        },
        dot: {
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isOnline ? '#4caf50' : '#ff9800',
            boxShadow: isOnline ? '0 0 8px #4caf50' : 'none',
            animation: isSyncing ? 'pulse 1s infinite' : 'none'
        },
        pending: {
            marginLeft: 'auto',
            color: '#cc0000',
            backgroundColor: '#fff',
            padding: '2px 6px',
            borderRadius: '10px',
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
