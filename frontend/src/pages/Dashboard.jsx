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

    // ...

    const renderCropBreakdown = () => (
        // ...
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {/* ... */}
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
        </div >
    );

const renderContent = () => {
    if (view === 'add-farm') return <FarmForm onComplete={() => { setView('overview'); fetchFarms(); }} />;
    if (view === 'add-field') return <FieldForm onComplete={() => { setView('overview'); fetchFields(currentFarm.id); }} />;
    if (view === 'field-details') return <FieldDetails field={selectedField} onBack={() => setView('overview')} />;
    if (view === 'crop-breakdown') return renderCropBreakdown();

    return (
        <div className="animate-fade-in">
            {/* Section 1: Top Widgets (Clones) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <WeatherWidget />
                <QuickLinks />
                <div className="card" style={{ padding: '0', border: '1px solid #000', borderRadius: '0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#bb1919', color: 'white' }}>
                    <div style={{ fontSize: '42px', fontWeight: '900' }}>{new Date().toLocaleDateString('en-US', { day: 'numeric' })}</div>
                    <div style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>{new Date().toLocaleDateString('en-US', { month: 'long' })}</div>
                    <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.8 }}>CY: 2026-Q1</div>
                </div>
            </div>

            {/* Section 2: Main Operations (Map + Lists) */}
            <div style={{
                display: 'block',
                gap: '20px',
                alignItems: 'start'
            }}>
                {/* Left: Map & Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* KPI Bar */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        backgroundColor: '#fff',
                        padding: '12px',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                onClick={stat.onClick}
                                style={{
                                    flex: '1 1 100px',
                                    padding: '8px 12px',
                                    borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
                                    cursor: stat.clickable ? 'pointer' : 'default',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    {stat.label}
                                </span>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: stat.color || 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>{stat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

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
                <div style={{ padding: '12px 16px', borderBottom: '2px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', letterSpacing: '0.5px' }}>FIELD REGISTRY & SOIL ANALYTICS</h3>
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
                                            <button onClick={() => { setSelectedField(f); setView('field-details'); }} style={{ padding: '3px 10px', borderRadius: '1px', fontSize: '10px', backgroundColor: '#000', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '800' }}>MANAGE</button>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #000', paddingBottom: '16px' }}>
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '-1px' }}>
                    {currentFarm?.name || 'CENTRAL STATION'}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#cc0000', fontWeight: '900', letterSpacing: '1px' }}>● LIVE TELEMETRY</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SYSTEM STATUS: OPTIMAL</span>
                </div>
            </div>
            {view !== 'overview' && (
                <button onClick={() => setView('overview')} className="outline" style={{ fontWeight: '800', fontSize: '11px' }}>← RETURN TO CONTROL</button>
            )}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px', fontSize: '14px', fontWeight: '700', color: '#888' }}>SYNCING STATION DATA...</div>}

        {!loading && renderContent()}
    </div>
);
};

export default Dashboard;
