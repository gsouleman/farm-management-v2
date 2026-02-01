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

const Dashboard = () => {
    const { fetchFarms, currentFarm, fields, fetchFields, loading } = useFarmStore();
    const { fetchCropsByFarm, crops } = useCropStore();
    const { infrastructure, fetchInfrastructure } = useInfrastructureStore();
    const { harvests, fetchHarvestsByFarm } = useHarvestStore();
    const { activities, fetchActivitiesByFarm } = useActivityStore();
    const { budgetData, fetchCropBudgets } = useReportStore();

    const [view, setView] = useState('overview');
    const [selectedField, setSelectedField] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFarms();
    }, [fetchFarms]);

    useEffect(() => {
        const handleOpenNewFarm = () => setView('add-farm');
        window.addEventListener('open-new-farm', handleOpenNewFarm);
        return () => window.removeEventListener('open-new-farm', handleOpenNewFarm);
    }, []);

    useEffect(() => {
        if (currentFarm?.id) {
            fetchFields(currentFarm.id);
            fetchCropsByFarm(currentFarm.id);
            fetchInfrastructure(currentFarm.id);
            fetchHarvestsByFarm(currentFarm.id);
            fetchActivitiesByFarm(currentFarm.id);
            fetchCropBudgets(currentFarm.id);
        }
    }, [currentFarm, fetchFields, fetchCropsByFarm, fetchInfrastructure, fetchHarvestsByFarm, fetchActivitiesByFarm, fetchCropBudgets]);

    // Derived Statistics
    const totalPlantedArea = useMemo(() => (crops || [])
        .filter(c => c.status === 'planted' || c.status === 'active' || c.status === 'growing')
        .reduce((sum, c) => sum + parseFloat(c.planted_area || 0), 0), [crops]);

    const totalRevenue = useMemo(() =>
        activities.filter(a => a.transaction_type === 'income' || a.activity_type === 'harvesting')
            .reduce((sum, a) => sum + (parseFloat(a.total_cost) || parseFloat(a.labor_cost) || 0), 0)
        , [activities]);

    const totalExpenses = useMemo(() =>
        activities.filter(a => a.transaction_type === 'expense')
            .reduce((sum, a) => sum + (parseFloat(a.total_cost) || parseFloat(a.labor_cost) || 0), 0)
        , [activities]);

    const netCashFlow = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);

    const formatToXAF = (value) => {
        return new Intl.NumberFormat('en-US').format(Math.round(value)) + ' XAF';
    };

    const landUtilization = useMemo(() => currentFarm?.total_area > 0
        ? (totalPlantedArea / parseFloat(currentFarm.total_area) * 100).toFixed(1)
        : 0, [currentFarm, totalPlantedArea]);

    const stats = useMemo(() => [
        { label: 'Revenue', value: formatToXAF(totalRevenue), icon: '💰', color: 'var(--success)' },
        { label: 'Expenses', value: formatToXAF(totalExpenses), icon: '📉', color: 'var(--error)' },
        { label: 'Cash Flow', value: formatToXAF(netCashFlow), icon: '⚖️', color: netCashFlow >= 0 ? 'var(--success)' : 'var(--error)' },
        { label: 'Total Area', value: `${currentFarm?.total_area || '0.0'} ha`, icon: '📏', color: 'var(--accent)' },
        {
            label: 'Planted',
            value: `${totalPlantedArea.toFixed(1)} ha`,
            icon: '🌱',
            onClick: () => setView('crop-breakdown'),
            clickable: true
        },
        { label: 'Fields', value: fields.length, icon: '🗺️' }
    ], [totalRevenue, totalExpenses, netCashFlow, currentFarm, totalPlantedArea, fields.length]);

    const renderCropBreakdown = () => (
        <div className="animate-fade-in card">
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Crop Allocation Breakdown</h3>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)' }}>
                    Total Planted: {totalPlantedArea.toFixed(2)} ha
                </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '2px solid var(--border)' }}>
                        <th style={{ padding: '12px 8px' }}>Crop Type</th>
                        <th style={{ padding: '12px 8px' }}>Variety</th>
                        <th style={{ padding: '12px 8px' }}>Surface Area (ha)</th>
                        <th style={{ padding: '12px 8px' }}>Location/Field</th>
                    </tr>
                </thead>
                <tbody>
                    {crops.filter(c => c.status === 'planted' || c.status === 'active' || c.status === 'growing').map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                            <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{c.crop_type}</td>
                            <td style={{ padding: '12px 8px' }}>{c.variety}</td>
                            <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--secondary)' }}>{parseFloat(c.planted_area || 0).toFixed(2)} ha</td>
                            <td style={{ padding: '12px 8px' }}>{fields.find(f => f.id === c.field_id)?.name || 'N/A'}</td>
                        </tr>
                    ))}
                    {crops.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No active crops found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderContent = () => {
        if (view === 'add-farm') return <FarmForm onComplete={() => { setView('overview'); fetchFarms(); }} />;
        if (view === 'add-field') return <FieldForm onComplete={() => { setView('overview'); fetchFields(currentFarm.id); }} />;
        if (view === 'field-details') return <FieldDetails field={selectedField} onBack={() => setView('overview')} />;
        if (view === 'crop-breakdown') return renderCropBreakdown();

        return (
            <div className="animate-fade-in">
                {/* KPI Bar (Moved to Top) */}
                {/* KPI Bar */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px'
                }}>
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            onClick={stat.onClick}
                            style={{
                                backgroundColor: '#fff',
                                padding: '16px',
                                borderRadius: '12px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                                border: '1px solid rgba(0,0,0,0.05)',
                                cursor: stat.clickable ? 'pointer' : 'default',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={e => stat.clickable && (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={e => stat.clickable && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {stat.label}
                                </span>
                                <span style={{ fontSize: '16px' }}>{stat.icon}</span>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: stat.color || 'var(--text-main)' }}>
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Section 1: Top Widgets (Clones) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                    <WeatherWidget />
                    <QuickLinks />
                </div>

                {/* Section 2: Main Operations (Map + Lists) */}
                <div style={{
                    display: 'block',
                    gap: '20px',
                    alignItems: 'start'
                }}>
                    {/* Left: Map & Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>


                        <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', letterSpacing: '0.5px' }}>FARM VISUALIZER</h3>
                                <button className="outline" style={{ padding: '4px 10px', fontSize: '10px', fontWeight: '800' }} onClick={() => setView('add-field')}>+ BOUNDARY</button>
                            </div>
                            <div style={{ height: '400px' }}>
                                <FieldMap
                                    center={currentFarm?.coordinates?.coordinates ? [currentFarm.coordinates.coordinates[1], currentFarm.coordinates.coordinates[0]] : [37.7749, -122.4194]}
                                    fields={fields}
                                    crops={crops}
                                    infrastructure={infrastructure}
                                    farmBoundary={currentFarm?.boundary}
                                    editable={false}
                                />
                            </div>
                        </div>

                    </div>

                </div>

                {/* Section 3: Field Registry */}
                <div className="card" style={{ marginTop: '24px', padding: '0' }}>
                    <div style={{ padding: '16px', borderBottom: '2px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--secondary)' }}>Field Registry & Soil Analytics</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="outline" style={{ fontSize: '10px', fontWeight: '800', padding: '4px 10px' }}>FILTER</button>
                            <button className="outline" style={{ fontSize: '10px', fontWeight: '800', padding: '4px 10px' }} onClick={() => window.print()}>EXPORT</button>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', fontSize: '11px', color: '#888', borderBottom: '1px solid #eee', backgroundColor: '#fafafa' }}>
                                    <th style={{ padding: '10px 16px' }}>FIELD IDENTIFIER</th>
                                    <th style={{ padding: '10px 16px' }}>SURFACE AREA</th>
                                    <th style={{ padding: '10px 16px' }}>SOIL CLASS</th>
                                    <th style={{ padding: '10px 16px' }}>DRAINAGE</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map(f => {
                                    let fieldDisplayArea = parseFloat(f.area || 0);
                                    if (fieldDisplayArea === 0 && f.boundary?.coordinates?.[0]) {
                                        try {
                                            const poly = turf.polygon(f.boundary.coordinates);
                                            fieldDisplayArea = turf.area(poly) / 10000;
                                        } catch (e) {
                                            console.error('Dashboard field area calc failed:', e);
                                        }
                                    }
                                    return (
                                        <tr key={f.id} style={{ borderBottom: '1px solid #f5f5f5', fontSize: '13px' }}>
                                            <td style={{ padding: '10px 16px', fontWeight: '800', color: 'var(--primary)' }}>{f.name.toUpperCase()}</td>
                                            <td style={{ padding: '10px 16px', fontWeight: '600' }}>{fieldDisplayArea.toFixed(2)} ha</td>
                                            <td style={{ padding: '10px 16px', textTransform: 'capitalize' }}>{f.soil_type || '—'}</td>
                                            <td style={{ padding: '10px 16px' }}>{f.drainage || '—'}</td>
                                            <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                                                <button onClick={() => { setSelectedField(f); setView('field-details'); }} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', backgroundColor: 'var(--secondary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Manage</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            {/* Header: Modern & Clean */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: 'var(--secondary)', letterSpacing: '-1px' }}>
                        {currentFarm?.name || 'CENTRAL STATION'}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '700', padding: '4px 10px', backgroundColor: 'rgba(46, 125, 50, 0.1)', borderRadius: '12px' }}>● SYSTEM OPTIMAL</span>
                    </div>
                </div>
                {view !== 'overview' && (
                    <button onClick={() => setView('overview')} className="outline" style={{ fontWeight: '600', fontSize: '12px', borderRadius: '8px' }}>← BACK TO OVERVIEW</button>
                )}
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '40px', fontSize: '14px', fontWeight: '600', color: '#888' }}>Syncing Data...</div>}

            {!loading && renderContent()}
        </div>
    );
};

export default Dashboard;
