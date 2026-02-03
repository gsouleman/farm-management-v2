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

// TEST VERSION: All imports, NO hooks, just return a simple div
// This tests if the crash is in the imports themselves
const Dashboard = () => {
    console.log('[TEST] Dashboard rendering with all imports, no hooks...');
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>🧪 TEST: All Imports, No Hooks</h1>
            <p>If you see this, the imports are NOT the problem.</p>
            <p>The issue is in the store hooks or useMemo.</p>
        </div>
    );
};

export default Dashboard;
