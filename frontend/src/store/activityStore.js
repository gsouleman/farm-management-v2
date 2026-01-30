import { create } from 'zustand';
import api from '../services/api';

const useActivityStore = create((set, get) => ({
    activities: [],
    loading: false,

    fetchActivitiesByCrop: async (cropId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/crops/${cropId}/activities`);
            set({ activities: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    fetchActivitiesByFarm: async (farmId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/farms/${farmId}/activities`);
            set({ activities: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    createActivity: async (cropId, activityData) => {
        try {
            const response = await api.post(`/crops/${cropId}/activities`, activityData);
            set((state) => ({ activities: [...state.activities, response.data] }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logActivity: async (activityData) => {
        try {
            const response = await api.post('/activities', activityData);
            set((state) => ({ activities: [...state.activities, response.data] }));
            return response.data;
        } catch (error) {
            console.error('[ActivityStore] logActivity error:', error);
            throw error;
        }
    },

    updateActivity: async (id, activityData) => {
        try {
            const response = await api.put(`/activities/${id}`, activityData);
            set((state) => ({
                activities: state.activities.map(a => a.id === id ? response.data : a)
            }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteActivity: async (id) => {
        try {
            await api.delete(`/activities/${id}`);
            set((state) => ({
                activities: state.activities.filter(a => a.id !== id)
            }));
        } catch (error) {
            throw error;
        }
    },

    bulkUploadActivities: async (farmId, file) => {
        set({ loading: true });
        console.log(`[ActivityStore] Starting bulk upload for farm: ${farmId}`);
        try {
            if (!farmId) throw new Error('Farm ID is required for bulk upload');

            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(`/activities/bulk-upload/${farmId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('[ActivityStore] Bulk upload success:', response.data);

            // Update local state by fetching fresh data to ensure synchronization
            try {
                const freshActivities = await api.get(`/farms/${farmId}/activities`);
                set({ activities: freshActivities.data, loading: false });
            } catch (fetchError) {
                console.error('[ActivityStore] Post-upload sync failed:', fetchError);
                // Even if sync fails, the upload succeeded
                set({ loading: false });
            }

            return response.data;
        } catch (error) {
            console.error('[ActivityStore] Bulk upload error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            set({ loading: false });
            throw error;
        }
    }
}));

export default useActivityStore;
