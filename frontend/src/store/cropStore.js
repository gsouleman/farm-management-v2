import { create } from 'zustand';
import api from '../services/api';

const useCropStore = create((set, get) => ({
    crops: [],
    currentCrop: null,
    loading: false,
    error: null,


    fetchCropsByField: async (fieldId) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/fields/${fieldId}/crops`);
            set({ crops: response.data, loading: false });
        } catch (error) {
            console.error('[CropStore] Fetch by field error:', error);
            set({ error: error.response?.data?.message || 'Failed to fetch crops', loading: false });
        }
    },

    fetchCropsByFarm: async (farmId) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/farms/${farmId}/crops`);
            set({ crops: response.data, loading: false });
        } catch (error) {
            console.error('[CropStore] Fetch by farm error:', error);
            set({ error: error.response?.data?.message || 'Failed to fetch crops', loading: false });
        }
    },


    fetchCropDetails: async (id) => {
        set({ loading: true });
        try {
            const response = await api.get(`/crops/${id}`);
            set({ currentCrop: response.data, loading: false });
            return response.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    fetchCropTimeline: async (id) => {
        set({ loading: true });
        try {
            const response = await api.get(`/crops/${id}/timeline`);
            set({ loading: false });
            return response.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    fetchCropProductionCost: async (id) => {
        try {
            const response = await api.get(`/reports/production-cost/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createCrop: async (fieldId, cropData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post(`/fields/${fieldId}/crops`, cropData);
            set((state) => ({ crops: [...state.crops, response.data] }));
            return response.data;
        } catch (error) {
            console.error('[CropStore] Create error:', error);
            set({ error: error.response?.data?.message || 'Failed to create crop' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    updateCrop: async (id, cropData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/crops/${id}`, cropData);
            set((state) => ({
                crops: state.crops.map(c => c.id === id ? response.data : c),
                currentCrop: state.currentCrop?.id === id ? response.data : state.currentCrop
            }));
            return response.data;
        } catch (error) {
            console.error('[CropStore] Update error:', error);
            set({ error: error.response?.data?.message || 'Failed to update crop' });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    deleteCrop: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/crops/${id}`);
            set((state) => ({
                crops: state.crops.filter(c => c.id !== id),
                currentCrop: state.currentCrop?.id === id ? null : state.currentCrop
            }));
        } catch (error) {
            console.error('[CropStore] Delete error:', error);
            set({ error: error.response?.data?.message || 'Failed to delete crop' });
            throw error;
        } finally {
            set({ loading: false });
        }
    }

}));

export default useCropStore;
