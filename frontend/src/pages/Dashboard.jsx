import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useFarmStore from '../store/farmStore';
import useCropStore from '../store/cropStore';
import useInfrastructureStore from '../store/infrastructureStore';
import useHarvestStore from '../store/harvestStore';
import useActivityStore from '../store/activityStore';
import useReportStore from '../store/reportStore';
import FieldMap from '../components/fields/FieldMap';
import * as turf from '@turf/turf';
import FarmForm from '../components/farms/FarmForm';
import FieldForm from '../components/fields/FieldForm';
import FieldDetails from '../components/fields/FieldDetails';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import WeatherWidget from '../components/weather/WeatherWidget';
import QuickLinks from '../components/dashboard/QuickLinks';
import api from '../services/api';

// TEST VERSION 3: Store hooks + useEffect (NO useMemo)
const Dashboard = () => {
    console.log('[TEST 3] Dashboard with store hooks + useEffect...');

    // Store hooks
    const { fetchFarms, farms, currentFarm, fields, fetchFields, loading, loadFarm } = useFarmStore();
    const { fetchAllCrops, crops } = useCropStore();
    const { infrastructure, fetchInfrastructure } = useInfrastructureStore();
    const { fetchAllHarvests, harvests } = useHarvestStore();
    const { fetchAllActivities, activities } = useActivityStore();
    const { budgetData, fetchCropBudgets } = useReportStore();

    // State hooks
    const [view, setView] = useState('overview');
    const [isGlobalView, setIsGlobalView] = useState(true);
    const [selectedField, setSelectedField] = useState(null);
    const navigate = useNavigate();

    // useEffect 1: Initial fetch
    useEffect(() => {
        console.log('[TEST 3] useEffect 1 - fetching data...');
        fetchFarms();
        fetchAllCrops();
        fetchAllActivities();
        fetchAllHarvests();
    }, []);

    // useEffect 2: Farm/view change handler
    useEffect(() => {
        console.log('[TEST 3] useEffect 2 - farm/view change...');
        if (!isGlobalView && currentFarm?.id) {
            fetchFields(currentFarm.id);
            fetchInfrastructure(currentFarm.id);
            fetchCropBudgets(currentFarm.id);
        } else if (isGlobalView && farms && farms.length > 0) {
            farms.forEach(f => fetchFields(f.id));
        }
    }, [currentFarm, isGlobalView, farms?.length]);

    console.log('[TEST 3] About to render, farms:', farms?.length, 'loading:', loading);

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>🧪 TEST 3: useEffect Hooks</h1>
            <p>If you see this, useEffect hooks are fine.</p>
            <p>farms.length: {farms?.length || 0}, loading: {String(loading)}</p>
        </div>
    );
};

export default Dashboard;
