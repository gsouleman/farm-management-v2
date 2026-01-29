import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`
});

// Add interceptor for auth
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const useInfrastructureStore = create((set) => ({
    infrastructure: [],
    loading: false,

    fetchInfrastructure: async (farmId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/infrastructure/farm/${farmId}`);
            set({ infrastructure: response.data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },

    createInfrastructure: async (farmId, data) => {
        try {
            const response = await api.post(`/infrastructure/farm/${farmId}`, data);
            set(state => ({ infrastructure: [...state.infrastructure, response.data] }));
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    deleteInfrastructure: async (id) => {
        try {
            await api.delete(`/infrastructure/${id}`);
            set(state => ({ infrastructure: state.infrastructure.filter(i => i.id !== id) }));
        } catch (error) {
            console.error(error);
        }
    }
}));

export default useInfrastructureStore;
