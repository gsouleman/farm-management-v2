import { create } from 'zustand';
import api from '../services/api';

const useUserStore = create((set, get) => ({
    teamMembers: [],
    loading: false,

    fetchTeamMembers: async (farmId) => {
        set({ loading: true });
        try {
            // Updated to handle both the Farm Users junction (3.9) and the invitation logic
            const response = await api.get(`/farms/${farmId}/team`);
            set({ teamMembers: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    inviteUser: async (farmId, invitationData) => {
        try {
            // matches /api/farms/:id/invite (4.2)
            const response = await api.post(`/farms/${farmId}/invite`, invitationData);
            set((state) => ({ teamMembers: [...state.teamMembers, response.data] }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updatePermissions: async (farmUserId, permissions) => {
        try {
            const response = await api.put(`/farm-users/${farmUserId}/permissions`, { permissions });
            set((state) => ({
                teamMembers: state.teamMembers.map(m => m.id === farmUserId ? { ...m, permissions: response.data.permissions } : m)
            }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    removeMember: async (farmUserId) => {
        try {
            await api.delete(`/farm-users/${farmUserId}`);
            set((state) => ({
                teamMembers: state.teamMembers.filter(m => m.id !== farmUserId)
            }));
        } catch (error) {
            throw error;
        }
    }
}));

export default useUserStore;
