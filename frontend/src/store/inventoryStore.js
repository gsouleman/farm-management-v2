import { create } from 'zustand';
import api from '../services/api';

const useInventoryStore = create((set, get) => ({
    inputs: [],
    loading: false,

    fetchInputs: async (farmId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/farms/${farmId}/inputs`);
            set({ inputs: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    createInput: async (farmId, inputData) => {
        try {
            const response = await api.post(`/farms/${farmId}/inputs`, inputData);
            set((state) => ({ inputs: [...state.inputs, response.data] }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateInput: async (id, inputData) => {
        try {
            const response = await api.put(`/inputs/${id}`, inputData);
            set((state) => ({
                inputs: state.inputs.map(i => i.id === id ? response.data : i)
            }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    adjustStock: async (id, quantity) => {
        try {
            const response = await api.post(`/inputs/${id}/adjust`, { quantity });
            set((state) => ({
                inputs: state.inputs.map(i => i.id === id ? response.data : i)
            }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteInput: async (id) => {
        try {
            await api.delete(`/inputs/${id}`);
            set((state) => ({
                inputs: state.inputs.filter(i => i.id !== id)
            }));
        } catch (error) {
            throw error;
        }
    }
}));

export default useInventoryStore;
