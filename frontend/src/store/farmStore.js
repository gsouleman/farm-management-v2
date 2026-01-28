import { create } from 'zustand';
import api from '../services/api';

const useFarmStore = create((set, get) => ({
    farms: [],
    currentFarm: null,
    fields: [],
    loading: false,

    fetchFarms: async () => {
        set({ loading: true });
        try {
            const response = await api.get('/farms');
            set({ farms: response.data, loading: false });
            if (response.data.length > 0 && !get().currentFarm) {
                set({ currentFarm: response.data[0] });
            }
        } catch (error) {
            set({ loading: false });
        }
    },

    setCurrentFarm: (farm) => {
        set({ currentFarm: farm });
        get().fetchFields(farm.id);
    },

    fetchFields: async (farmId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/fields/farm/${farmId}`);
            set({ fields: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    createFarm: async (farmData) => {
        try {
            const response = await api.post('/farms', farmData);
            set((state) => ({ farms: [...state.farms, response.data] }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createField: async (fieldData) => {
        try {
            const response = await api.post('/fields', fieldData);
            set((state) => ({ fields: [...state.fields, response.data] }));
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}));

export default useFarmStore;
