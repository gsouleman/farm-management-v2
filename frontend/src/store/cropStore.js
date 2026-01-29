import { create } from 'zustand';
import api from '../services/api';

const useCropStore = create((set, get) => ({
    crops: [],
    currentCrop: null,
    loading: false,

    fetchCropsByField: async (fieldId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/fields/${fieldId}/crops`);
            set({ crops: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    fetchCropsByFarm: async (farmId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/farms/${farmId}/crops`);
            set({ crops: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
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

    createCrop: async (fieldId, cropData) => {
        try {
            const response = await api.post(`/fields/${fieldId}/crops`, cropData);
            set((state) => ({ crops: [...state.crops, response.data] }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateCrop: async (id, cropData) => {
        try {
            const response = await api.put(`/crops/${id}`, cropData);
            set((state) => ({
                crops: state.crops.map(c => c.id === id ? response.data : c),
                currentCrop: state.currentCrop?.id === id ? response.data : state.currentCrop
            }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteCrop: async (id) => {
        try {
            await api.delete(`/crops/${id}`);
            set((state) => ({
                crops: state.crops.filter(c => c.id !== id),
                currentCrop: state.currentCrop?.id === id ? null : state.currentCrop
            }));
        } catch (error) {
            throw error;
        }
    }
}));

export default useCropStore;
