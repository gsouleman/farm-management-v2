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
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import api from '../services/api';

const Dashboard = () => {
    const { fetchFarms, currentFarm, fields, fetchFields, loading } = useFarmStore();
    const { fetchCropsByFarm, crops } = useCropStore();
    const { infrastructure, fetchInfrastructure } = useInfrastructureStore();
    const { harvests, fetchFarmHarvests } = useHarvestStore();
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
            fetchFarmHarvests(currentFarm.id);
            fetchActivitiesByFarm(currentFarm.id);
            fetchCropBudgets(currentFarm.id);
        }
    }, [currentFarm, fetchFields, fetchCropsByFarm, fetchInfrastructure, fetchFarmHarvests, fetchActivitiesByFarm, fetchCropBudgets]);

    // Derived Statistics
    const totalPlantedArea = useMemo(() => (crops || [])
        .filter(c => c.status === 'planted' || c.status === 'active')
        .reduce((sum, c) => sum + parseFloat(c.planted_area || 0), 0), [crops]);

    const totalRevenue = useMemo(() =>
        activities.filter(a => a.transaction_type === 'income' || a.activity_type === 'harvesting')
            .reduce((sum, a) => sum + parseFloat(a.total_cost || a.labor_cost || 0), 0)
        , [activities]);

    const totalExpenses = useMemo(() =>
        activities.filter(a => a.transaction_type === 'expense')
            .reduce((sum, a) => sum + parseFloat(a.total_cost || a.labor_cost || 0), 0)
        , [activities]);

    const netCashFlow = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);

    const landUtilization = useMemo(() => currentFarm?.total_area > 0
        ? (totalPlantedArea / parseFloat(currentFarm.total_area) * 100).toFixed(1)
        : 0, [currentFarm, totalPlantedArea]);

    const stats = useMemo(() => [
        { label: 'Revenue', value: `${(totalRevenue / 1000).toFixed(1)}k`, icon: '💰', color: '#4caf50' },
        { label: 'Expenses', value: `${(totalExpenses / 1000).toFixed(1)}k`, icon: '📉', color: '#cc0000' },
        { label: 'Cash Flow', value: `${(netCashFlow / 1000).toFixed(1)}k`, icon: '⚖️', color: netCashFlow >= 0 ? '#4caf50' : '#cc0000' },
        { label: 'Total Area', value: `${currentFarm?.total_area || '0.0'} ha`, icon: '📏' },
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
                    {crops.filter(c => c.status === 'planted' || c.status === 'active').map(c => (
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
                {/* Intelligence KPI Bar - Condensed */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '24px',
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
                                flex: '1 1 120px',
                                padding: '8px 16px',
                                borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
                                cursor: stat.clickable ? 'pointer' : 'default',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px'
                            }}
                        >
                            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {stat.label}
                            </span>
                            <div style={{ fontSize: '18px', fontWeight: '800', color: stat.color || 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{stat.value}</span>
                                <span style={{ fontSize: '14px', opacity: 0.6 }}>{stat.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Professional 3-Column Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 300px 300px',
                    gap: '20px',
                    alignItems: 'start'
                }}>
                    {/* Left Column: Map Visualize (Primary Focus) */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden', height: '100%' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', letterSpacing: '0.5px' }}>FARM VISUALIZER</h3>
                            <button className="outline" style={{ padding: '4px 10px', fontSize: '10px', fontWeight: '800' }} onClick={() => setView('add-field')}>+ BOUNDARY</button>
                        </div>
                        <div style={{ height: '450px' }}>
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

                    {/* Middle Column: Utilization & Pro Insight */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                            <h3 style={{ fontSize: '12px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Land Utilization</h3>
                            <div style={{ height: '180px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                {landUtilization !== undefined ? (
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Planted', value: parseFloat(landUtilization) || 0 },
                                                    { name: 'Available', value: Math.max(0, 100 - (parseFloat(landUtilization) || 0)) }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                                startAngle={180}
                                                endAngle={0}
                                            >
                                                <Cell fill="#cc0000" />
                                                <Cell fill="#eee" />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Calculating...</div>
                                )}
                                <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '900' }}>{landUtilization}%</div>
                                    <div style={{ fontSize: '9px', color: '#888', fontWeight: 'bold' }}>OCCUPIED</div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ backgroundColor: '#000', color: 'white', padding: '16px', borderLeft: '4px solid #cc0000' }}>
                            <h3 style={{ color: '#cc0000', fontSize: '12px', marginBottom: '10px', fontWeight: '900', letterSpacing: '1px' }}>PRO INSIGHT</h3>
                            <p style={{ fontSize: '12px', margin: 0, color: '#bbb', lineHeight: '1.5', fontStyle: 'italic' }}>
                                Land utilization is at {landUtilization}%. Consider expanding cultivation to optimize seasonal revenue targets.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Recent Operations */}
                    <div className="card" style={{ padding: '16px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '12px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Recent Operations</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <ActivityItem type="Seeding" date="Just now" field="Field A" />
                            <ActivityItem type="Irrigation" date="2h ago" field="North Field" />
                            <ActivityItem type="Harvesting" date="Yesterday" field="Field B" />
                            <ActivityItem type="Maintenance" date="Yesterday" field="Main Road" />
                        </div>
                    </div>
                </div>

                {/* Full Width Table Registry - High Density */}
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


const ActivityItem = ({ type, date, field }) => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '6px' }} />
        <div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{type} on {field}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{date}</div>
        </div>
    </div>
);

export default Dashboard;
