import { create } from 'zustand';
import api from '../services/api';

const useWeatherStore = create((set, get) => ({
    weatherData: null,
    forecast: [],
    history: [],
    loading: false,

    fetchWeather: async (farmId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/farms/${farmId}/weather`);
            set({ weatherData: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    fetchForecast: async (farmId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/farms/${farmId}/weather/forecast`);
            set({ forecast: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    fetchHistory: async (farmId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/farms/${farmId}/weather/history`);
            set({ history: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    }
}));

export default useWeatherStore;
