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

// TEST VERSION 3E: ALL 4 fetch calls (complete useEffect 1)
const Dashboard = () => {
    console.log('[TEST 3E] Dashboard rendering...');

    // Store hooks
    const { fetchFarms, farms, currentFarm, fields, fetchFields, loading, loadFarm } = useFarmStore();
    const { fetchAllCrops, crops } = useCropStore();
    const { infrastructure, fetchInfrastructure } = useInfrastructureStore();
    const { fetchAllHarvests, harvests } = useHarvestStore();
    const { fetchAllActivities, activities } = useActivityStore();
    const { budgetData, fetchCropBudgets } = useReportStore();

    const [view, setView] = useState('overview');
    const [isGlobalView, setIsGlobalView] = useState(true);
    const [selectedField, setSelectedField] = useState(null);
    const navigate = useNavigate();

    // ALL 4 fetch calls - complete useEffect 1
    useEffect(() => {
        console.log('[TEST 3E] useEffect - ALL 4 fetches...');
        fetchFarms();
        fetchAllCrops();
        fetchAllActivities();
        fetchAllHarvests();  // ← ADDED
    }, []);

    console.log('[TEST 3E] About to render, farms:', farms?.length, 'crops:', crops?.length, 'activities:', activities?.length, 'harvests:', harvests?.length);

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>🧪 TEST 3E: All 4 Fetches</h1>
            <p>If you see this, ALL fetch calls are fine.</p>
            <p>farms: {farms?.length || 0}, crops: {crops?.length || 0}, activities: {activities?.length || 0}, harvests: {harvests?.length || 0}</p>
        </div>
    );
};

export default Dashboard;
