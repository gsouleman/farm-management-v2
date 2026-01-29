import { create } from 'zustand';
import api from '../services/api';

const useInfrastructureStore = create((set) => ({
    infrastructure: [],
    loading: false,
    error: null,

    fetchInfrastructure: async (farmId) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/infrastructure/farm/${farmId}`);
            set({ infrastructure: response.data });
        } catch (error) {
            console.error('[InfrastructureStore] Fetch error:', error);
            set({ error: error.response?.data?.message || 'Failed to fetch infrastructure' });
        } finally {
            set({ loading: false });
        }
    },

    createInfrastructure: async (farmId, data) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post(`/infrastructure/farm/${farmId}`, data);
            set(state => ({ infrastructure: [...state.infrastructure, response.data] }));
            return response.data;
        } catch (error) {
            console.error('[InfrastructureStore] Create error:', error);
            set({ error: error.response?.data?.message || 'Failed to create infrastructure' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },


    deleteInfrastructure: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/infrastructure/${id}`);
            set(state => ({ infrastructure: state.infrastructure.filter(i => i.id !== id) }));
        } catch (error) {
            console.error('[InfrastructureStore] Delete error:', error);
            set({ error: error.response?.data?.message || 'Failed to delete infrastructure' });
        } finally {
            set({ loading: false });
        }
    }

}));

export default useInfrastructureStore;
