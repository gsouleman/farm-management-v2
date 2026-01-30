import React, { useEffect, useRef, useCallback } from 'react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const IDLE_TIME_LIMIT = 10 * 60 * 1000; // 10 minutes in milliseconds

const IdleTimer = () => {
    const { isAuthenticated, logout } = useAuthStore();
    const { showNotification } = useUIStore();
    const timeoutRef = useRef(null);

    const handleLogout = useCallback(() => {
        if (isAuthenticated) {
            logout();
            showNotification('Session expired due to 10 minutes of inactivity.', 'info');
        }
    }, [isAuthenticated, logout, showNotification]);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (isAuthenticated) {
            timeoutRef.current = setTimeout(handleLogout, IDLE_TIME_LIMIT);
        }
    }, [handleLogout, isAuthenticated]);

    useEffect(() => {
        const events = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click'
        ];

        if (isAuthenticated) {
            // Start the timer when authentication is confirmed
            resetTimer();

            // Add event listeners for user activity
            events.forEach(event => {
                window.addEventListener(event, resetTimer);
            });
        }

        return () => {
            // Cleanup: remove listeners and clear timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [isAuthenticated, resetTimer]);

    return null; // This component doesn't render any UI
};

export default IdleTimer;
