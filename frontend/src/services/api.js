import axios from 'axios';
import { queueForSync } from './db';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the JWT token and handle offline queueing
api.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Offline Queueing Logic
        if (!navigator.onLine && config.method !== 'get' && !config.skipQueue) {
            console.warn(`[API] Offline detected. Queuing ${config.method.toUpperCase()} ${config.url}`);
            await queueForSync(config.method, config.url, config.data);

            // Return a "fake" successful response so the UI doesn't crash
            // The sync engine will handle the actual server update later
            return Promise.reject({
                isOfflineQueue: true,
                message: 'Request queued for synchronization'
            });
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle notifications and errors
api.interceptors.response.use(
    async (response) => {
        // Automatic Notification Handling
        if (response.data?.notification) {
            const { showNotification } = (await import('../store/uiStore')).default.getState();
            showNotification(response.data.notification.message, response.data.notification.type || 'success');
        }
        return response;
    },
    async (error) => {
        // Automatic Error Notification Handling
        if (error.response?.data?.notification) {
            const { showNotification, showAlert } = (await import('../store/uiStore')).default.getState();
            const notif = error.response.data.notification;

            if (notif.type === 'error') {
                // Interruption Alert for critical errors
                showAlert('PROTOCOL ALERT', notif.message);
            } else {
                showNotification(notif.message, notif.type);
            }
        }

        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            // Only redirect if we're not already on the login page to avoid loops
            if (!window.location.pathname.includes('/login')) {
                console.warn('[API] 401 Unauthorized detected. Clearing token and redirecting to login.');
                localStorage.removeItem('token');
                // Force a page reload to clear state and redirect via App.jsx/ProtectedRoute
                window.location.href = '/login';
            }
        }

        // Log other network errors more clearly
        if (!error.response) {
            console.error('[API] Network Error or Server Unreachable:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;

