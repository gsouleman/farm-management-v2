import { create } from 'zustand';

const usePlannerStore = create((set) => ({
    scenarios: [
        { id: 1, name: '2026 Optimized Rotation', year: 2026, status: 'draft', area: 120, estRevenue: 15000000 },
        { id: 2, name: 'High Yield Corn Scenario', year: 2026, status: 'active', area: 85, estRevenue: 12000000 }
    ],
    plannedRotations: [],
    loading: false,

    createScenario: (scenario) => set((state) => ({
        scenarios: [...state.scenarios, { ...scenario, id: Date.now() }]
    })),

    deleteScenario: (id) => set((state) => ({
        scenarios: state.scenarios.filter(s => s.id !== id)
    }))
}));

export default usePlannerStore;
