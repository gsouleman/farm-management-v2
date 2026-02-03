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

    // ADDED: Global fetch all harvests function (was missing and causing crash!)
    fetchAllHarvests: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/harvests/all');
            set({ harvests: response.data || [], loading: false });
        } catch (error) {
            console.error('[HarvestStore] Fetch all harvests error:', error);
            set({ error: error.response?.data?.message || 'Failed to fetch all harvests', loading: false, harvests: [] });
        }
    },


    createHarvest: async (cropId, harvestData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post(`/crops/${cropId}/harvests`, harvestData);
            // Optimistic update

            // Force re-fetch to ensure consistency as requested
            const farmId = (await import('./farmStore')).default.getState().currentFarm?.id;
            if (farmId) {
                await get().fetchHarvestsByFarm(farmId);
            }

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
            // Optimistic update

            // Force re-fetch
            const farmId = (await import('./farmStore')).default.getState().currentFarm?.id;
            if (farmId) {
                await get().fetchHarvestsByFarm(farmId);
            }

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
            const response = await api.delete(`/harvests/${id}`);
            set((state) => ({
                harvests: state.harvests.filter(h => h.id !== id)
            }));

            // Force re-fetch
            const farmId = (await import('./farmStore')).default.getState().currentFarm?.id;
            if (farmId) {
                await get().fetchHarvestsByFarm(farmId);
            }

            return response.data;
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
