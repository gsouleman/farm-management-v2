import { create } from 'zustand';
import api from '../services/api';

const useDocumentStore = create((set, get) => ({
    documents: [],
    loading: false,

    fetchDocuments: async (farmId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/farms/${farmId}/documents`);
            set({ documents: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    uploadDocument: async (farmId, file, metadata) => {
        set({ loading: true });
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('farm_id', farmId);
            Object.keys(metadata).forEach(key => formData.append(key, metadata[key]));

            const response = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            set((state) => ({ documents: [...state.documents, response.data], loading: false }));
            return response.data;
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    deleteDocument: async (id) => {
        try {
            await api.delete(`/documents/${id}`);
            set((state) => ({
                documents: state.documents.filter(d => d.id !== id)
            }));
        } catch (error) {
            throw error;
        }
    }
}));

export default useDocumentStore;
