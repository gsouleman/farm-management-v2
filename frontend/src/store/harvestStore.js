import { create } from 'zustand';
import api from '../services/api';

const useHarvestStore = create((set, get) => ({
    harvests: [],
    loading: false,
    error: null,

    fetchHarvestsByCrop: async (cropId) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/crops/${cropId}/harvests`);
            set({ harvests: response.data, loading: false });
        } catch (error) {
            console.error('[HarvestStore] Fetch by crop error:', error);
            set({ error: error.response?.data?.message || 'Failed to fetch harvests', loading: false });
        }
    },

    fetchHarvestsByFarm: async (farmId) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/farms/${farmId}/harvests`);
            set({ harvests: response.data, loading: false });
        } catch (error) {
            console.error('[HarvestStore] Fetch by farm error:', error);
            set({ error: error.response?.data?.message || 'Failed to fetch harvests', loading: false });
        }
    },


    createHarvest: async (cropId, harvestData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post(`/crops/${cropId}/harvests`, harvestData);
            set((state) => ({ harvests: [...state.harvests, response.data] }));
            return response.data;
        } catch (error) {
            console.error('[HarvestStore] Create error:', error);
            set({ error: error.response?.data?.message || 'Failed to create harvest' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    updateHarvest: async (id, harvestData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/harvests/${id}`, harvestData);
            set((state) => ({
                harvests: state.harvests.map(h => h.id === id ? response.data : h)
            }));
            return response.data;
        } catch (error) {
            console.error('[HarvestStore] Update error:', error);
            set({ error: error.response?.data?.message || 'Failed to update harvest' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    deleteHarvest: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/harvests/${id}`);
            set((state) => ({
                harvests: state.harvests.filter(h => h.id !== id)
            }));
        } catch (error) {
            console.error('[HarvestStore] Delete error:', error);
            set({ error: error.response?.data?.message || 'Failed to delete harvest' });
            throw error;
        } finally {
            set({ loading: false });
        }
    }

}));

export default useHarvestStore;
