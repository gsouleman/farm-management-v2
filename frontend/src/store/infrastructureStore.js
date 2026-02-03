import { create } from 'zustand';
import api from '../services/api';

const useInfrastructureStore = create((set, get) => ({
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
            const newInfra = response.data.data || response.data;

            // Force re-fetch
            await get().fetchInfrastructure(farmId);

            return newInfra;
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
            const response = await api.delete(`/infrastructure/${id}`);

            // Force re-fetch
            const farmId = (await import('./farmStore')).default.getState().currentFarm?.id;
            if (farmId) {
                await get().fetchInfrastructure(farmId);
            }

            return response.data;
        } catch (error) {
            console.error('[InfrastructureStore] Delete error:', error);
            set({ error: error.response?.data?.message || 'Failed to delete infrastructure' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    updateInfrastructure: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/infrastructure/${id}`, data);
            const updatedInfra = response.data.data || response.data;

            // Force re-fetch
            const farmId = (await import('./farmStore')).default.getState().currentFarm?.id;
            if (farmId) {
                await get().fetchInfrastructure(farmId);
            }

            return updatedInfra;
        } catch (error) {
            console.error('[InfrastructureStore] Update error:', error);
            set({ error: error.response?.data?.message || 'Failed to update infrastructure' });
            throw error;
        } finally {
            set({ loading: false });
        }
    }

}));

export default useInfrastructureStore;
