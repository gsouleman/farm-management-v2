import { create } from 'zustand';
import authService from '../services/auth.service';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const { user } = await authService.login(credentials);
            set({ user, isAuthenticated: true, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Login failed', loading: false });
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const { user } = await authService.register(userData);
            set({ user, isAuthenticated: true, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Registration failed', loading: false });
        }
    },

    logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        if (!localStorage.getItem('token')) return;
        set({ loading: true });
        try {
            const user = await authService.getCurrentUser();
            set({ user, isAuthenticated: true, loading: false });
        } catch (error) {
            set({ user: null, isAuthenticated: false, loading: false });
        }
    }
}));

export default useAuthStore;
