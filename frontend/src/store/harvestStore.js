import { create } from 'zustand';
import api from '../services/api';

const useHarvestStore = create((set, get) => ({
    harvests: [],
    loading: false,

    fetchHarvestsByCrop: async (cropId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/crops/${cropId}/harvests`);
            set({ harvests: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    fetchHarvestsByFarm: async (farmId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/farms/${farmId}/harvests`);
            set({ harvests: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    createHarvest: async (cropId, harvestData) => {
        try {
            const response = await api.post(`/crops/${cropId}/harvests`, harvestData);
            set((state) => ({ harvests: [...state.harvests, response.data] }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateHarvest: async (id, harvestData) => {
        try {
            const response = await api.put(`/harvests/${id}`, harvestData);
            set((state) => ({
                harvests: state.harvests.map(h => h.id === id ? response.data : h)
            }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteHarvest: async (id) => {
        try {
            await api.delete(`/harvests/${id}`);
            set((state) => ({
                harvests: state.harvests.filter(h => h.id !== id)
            }));
        } catch (error) {
            throw error;
        }
    }
}));

export default useHarvestStore;
