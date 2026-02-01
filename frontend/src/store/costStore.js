import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';
import { getFromLocal, saveToLocal } from '../services/db';

const useCostStore = create(
    persist(
        (set, get) => ({
            costSettings: [],
            loading: false,
            error: null,

            fetchSettings: async (farmId) => {
                set({ loading: true, error: null });

                // Load from local DB
                const localData = await getFromLocal('cost_settings', { farm_id: farmId });
                if (localData.length > 0) {
                    set({ costSettings: localData, loading: false });
                }

                try {
                    const response = await api.get(`/farms/${farmId}/cost-settings`);
                    await saveToLocal('cost_settings', response.data);
                    set({ costSettings: response.data, loading: false });
                } catch (error) {
                    console.error('[CostStore] Fetch error:', error);
                    set({ loading: false });
                }
            },

            createSetting: async (farmId, data) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.post(`/farms/${farmId}/cost-settings`, data);

                    // Force re-fetch to ensure consistency
                    await get().fetchSettings(farmId);

                    return response.data;
                } catch (error) {
                    console.error('[CostStore] Create error:', error);
                    set({ error: error.response?.data?.message || 'Failed to create setting', loading: false });
                    throw error;
                }
            },

            updateSetting: async (id, data) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.put(`/farms/cost-settings/${id}`, data);

                    const farmId = (await import('./farmStore')).default.getState().currentFarm?.id;
                    if (farmId) await get().fetchSettings(farmId);

                    return response.data;
                } catch (error) {
                    console.error('[CostStore] Update error:', error);
                    set({ error: error.response?.data?.message || 'Failed to update setting', loading: false });
                    throw error;
                }
            },

            deleteSetting: async (id) => {
                set({ loading: true, error: null });
                try {
                    await api.delete(`/farms/cost-settings/${id}`);

                    const farmId = (await import('./farmStore')).default.getState().currentFarm?.id;
                    if (farmId) await get().fetchSettings(farmId);
                } catch (error) {
                    console.error('[CostStore] Delete error:', error);
                    set({ error: error.response?.data?.message || 'Failed to delete setting', loading: false });
                    throw error;
                }
            }
        }),
        {
            name: 'cost-settings-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useCostStore;
