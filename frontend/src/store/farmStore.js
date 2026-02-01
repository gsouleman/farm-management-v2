import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';
import { getFromLocal, saveToLocal } from '../services/db';

const useFarmStore = create(
    persist(
        (set, get) => ({
            farms: [],
            currentFarm: null,
            fields: [],
            loading: false,

            fetchFarms: async () => {
                set({ loading: true });

                // Load from local DB first for list
                const localData = await getFromLocal('farms');
                if (localData.length > 0) {
                    set(state => ({
                        farms: localData,
                        loading: false,
                        // Keep persisted currentFarm if valid, else default to first
                        currentFarm: state.currentFarm || localData[0]
                    }));
                }

                try {
                    const response = await api.get('/farms');
                    await saveToLocal('farms', response.data);

                    set(state => ({
                        farms: response.data,
                        loading: false,
                        // Ensure currentFarm refers to an existing farm in the new list
                        currentFarm: state.currentFarm
                            ? (response.data.find(f => f.id === state.currentFarm.id) || response.data[0])
                            : response.data[0]
                    }));

                    // Fetch fields for the active farm
                    const activeFarm = get().currentFarm;
                    if (activeFarm) {
                        get().fetchFields(activeFarm.id);
                    }
                } catch (error) {
                    set({ loading: false });
                }
            },

            setCurrentFarm: (farm) => {
                set({ currentFarm: farm });
                if (farm) {
                    get().fetchFields(farm.id);
                }
            },

            fetchFields: async (farmId) => {
                set({ loading: true });

                // Load from local DB
                const localData = await getFromLocal('fields', { farm_id: farmId });
                if (localData.length > 0) {
                    set({ fields: localData, loading: false });
                }

                try {
                    const response = await api.get(`/farms/${farmId}/fields`);
                    await saveToLocal('fields', response.data);
                    set({ fields: response.data, loading: false });
                } catch (error) {
                    set({ loading: false });
                }
            },

            createFarm: async (farmData) => {
                try {
                    const response = await api.post('/farms', farmData);
                    set((state) => ({ farms: [...state.farms, response.data] }));
                    if (!get().currentFarm) set({ currentFarm: response.data });
                    return response.data;
                } catch (error) {
                    throw error;
                }
            },

            updateFarm: async (id, farmData) => {
                try {
                    const response = await api.put(`/farms/${id}`, farmData);
                    set((state) => ({
                        farms: state.farms.map(f => f.id === id ? response.data : f),
                        currentFarm: state.currentFarm?.id === id ? response.data : state.currentFarm
                    }));
                    return response.data;
                } catch (error) {
                    throw error;
                }
            },

            createField: async (farmId, fieldData) => {
                try {
                    const response = await api.post(`/farms/${farmId}/fields`, fieldData);
                    set((state) => ({ fields: [...state.fields, response.data] }));
                    await saveToLocal('fields', response.data);
                    return response.data;
                } catch (error) {
                    if (error.isOfflineQueue) {
                        const tempField = {
                            ...fieldData,
                            id: `temp-${Date.now()}`,
                            farm_id: farmId,
                            status: 'syncing'
                        };
                        set((state) => ({ fields: [...state.fields, tempField] }));
                        await saveToLocal('fields', tempField);
                        return tempField;
                    }
                    throw error;
                }
            },

            updateField: async (id, fieldData) => {
                try {
                    const response = await api.put(`/fields/${id}`, fieldData);
                    set((state) => ({
                        fields: state.fields.map(f => f.id === id ? response.data : f)
                    }));
                    return response.data;
                } catch (error) {
                    throw error;
                }
            },

            deleteField: async (id) => {
                try {
                    const response = await api.delete(`/fields/${id}`);
                    set((state) => ({
                        fields: state.fields.filter(f => f.id !== id)
                    }));
                    return response.data;
                } catch (error) {
                    throw error;
                }
            }
        }),
        {
            name: 'farm-storage', // unique name
            storage: createJSONStorage(() => localStorage), // use localStorage
            partialize: (state) => ({ currentFarm: state.currentFarm }), // Only persist currentFarm
        }
    )
);

export default useFarmStore;
