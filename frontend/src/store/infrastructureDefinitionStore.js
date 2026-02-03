import { create } from 'zustand';
import api from '../services/api';

const useInfrastructureDefinitionStore = create((set, get) => ({
    definitions: [],
    loading: false,
    error: null,

    fetchDefinitions: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/infrastructure-definitions');
            set({ definitions: response.data, loading: false });
        } catch (error) {
            console.error('Fetch definitions error:', error);
            set({ error: error.message, loading: false });
        }
    },

    createDefinition: async (data) => {
        set({ loading: true });
        try {
            const response = await api.post('/infrastructure-definitions', data);
            set(state => ({
                definitions: [...state.definitions, response.data].sort((a, b) => a.name.localeCompare(b.name)),
                loading: false
            }));
            return response.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    updateDefinition: async (id, data) => {
        set({ loading: true });
        try {
            const response = await api.put(`/infrastructure-definitions/${id}`, data);
            set(state => ({
                definitions: state.definitions.map(d => d.id === id ? response.data : d),
                loading: false
            }));
            return response.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    deleteDefinition: async (id) => {
        set({ loading: true });
        try {
            await api.delete(`/infrastructure-definitions/${id}`);
            set(state => ({
                definitions: state.definitions.filter(d => d.id !== id),
                loading: false
            }));
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    toggleStatus: async (id) => {
        try {
            const response = await api.patch(`/infrastructure-definitions/${id}/toggle`);
            set(state => ({
                definitions: state.definitions.map(d => d.id === id ? response.data : d)
            }));
        } catch (error) {
            console.error('Toggle status error:', error);
            throw error;
        }
    }
}));

export default useInfrastructureDefinitionStore;
