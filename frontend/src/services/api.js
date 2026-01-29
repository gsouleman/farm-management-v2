import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Log the API Base URL for debugging purposes
if (import.meta.env.MODE === 'development') {
    console.log(`[API] Base URL configured to: ${baseURL}`);
}

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle unauthorized errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
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

