import { create } from 'zustand';
import api from '../services/api';

const useReportStore = create((set) => ({
    budgetData: [],
    loading: false,
    error: null,

    fetchCropBudgets: async (farmId) => {
        set({ loading: true });
        try {
            const response = await api.get('/reports/crop-budget', { params: { farmId } });
            set({ budgetData: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    }
}));

export default useReportStore;
