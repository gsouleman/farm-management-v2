import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFarmStore from '../store/farmStore';
import useCropStore from '../store/cropStore';
import useInfrastructureStore from '../store/infrastructureStore';
import useHarvestStore from '../store/harvestStore';
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
    const { fetchHarvestsByFarm, harvests } = useHarvestStore();
    const [view, setView] = useState('overview');
    const [selectedField, setSelectedField] = useState(null);
    const [budgetData, setBudgetData] = useState([]);
    const [trendData, setTrendData] = useState([]);
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
        if (currentFarm) {
            fetchFields(currentFarm.id);
            fetchCropsByFarm(currentFarm.id);
            fetchInfrastructure(currentFarm.id);
            fetchHarvestsByFarm(currentFarm.id);

            // Fetch budget for expenses
            api.get('/reports/crop-budget', { params: { farmId: currentFarm.id } })
                .then(res => {
                    setBudgetData(res.data);
                    // Prepare trend data
                    const trend = [
                        { name: 'Jan', revenue: 0, expenses: 1000 },
                        { name: 'Feb', revenue: 0, expenses: 5000 },
                        { name: 'Mar', revenue: 0, expenses: 12000 },
                        { name: 'Apr', revenue: 0, expenses: 15000 },
                        { name: 'Today', revenue: (harvests || []).reduce((s, h) => s + parseFloat(h.total_revenue || 0), 0), expenses: (res.data || []).reduce((s, b) => s + parseFloat(b.actualCosts || 0), 0) }
                    ];
                    setTrendData(trend);
                })
                .catch(err => console.error('Error fetching budget:', err));
        }
    }, [currentFarm, fetchFields, fetchCropsByFarm, fetchInfrastructure, fetchHarvestsByFarm, harvests]);

    const totalPlantedArea = (crops || [])
        .filter(c => c.status === 'planted' || c.status === 'active')
        .reduce((sum, c) => sum + parseFloat(c.planted_area || 0), 0);

    const totalRevenue = (harvests || []).reduce((sum, h) => sum + parseFloat(h.total_revenue || 0), 0);
    const totalExpenses = (budgetData || []).reduce((sum, b) => sum + parseFloat(b.actualCosts || 0), 0);
    const netCashFlow = totalRevenue - totalExpenses;
    const landUtilization = currentFarm?.total_area > 0
        ? (totalPlantedArea / parseFloat(currentFarm.total_area) * 100).toFixed(1)
        : 0;

    const stats = [
        { label: 'TOTAL REVENUE', value: `${totalRevenue.toLocaleString()} Xaf`, icon: '💰', color: '#4caf50' },
        { label: 'TOTAL EXPENSES', value: `${totalExpenses.toLocaleString()} Xaf`, icon: '📉', color: '#cc0000' },
        { label: 'NET CASH FLOW', value: `${netCashFlow.toLocaleString()} Xaf`, icon: '⚖️', color: netCashFlow >= 0 ? '#4caf50' : '#cc0000' },
        { label: 'LAND UTILIZATION', value: `${landUtilization}%`, icon: '📊', color: '#2196f3' },
        { label: 'TOTAL AREA', value: `${currentFarm?.total_area || '0.00'} ha`, icon: '📏' },
        {
            label: 'PLANTED AREA',
            value: `${totalPlantedArea.toFixed(2)} ha`,
            icon: '🌱',
            onClick: () => setView('crop-breakdown'),
            clickable: true
        },
        { label: 'TOTAL FIELDS', value: fields.length, icon: '🗺️' },
        { label: 'ACTIVE CROPS', value: crops.filter(c => c.status === 'planted').length, icon: '🚜' }
    ];

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
                {/* Dashboard Intelligence Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className={`card ${stat.clickable ? 'clickable-card' : ''}`}
                            onClick={stat.onClick}
                            style={{
                                padding: '20px',
                                borderLeft: stat.color ? `4px solid ${stat.color}` : '1px solid var(--border)',
                                cursor: stat.clickable ? 'pointer' : 'default',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseOver={(e) => {
                                if (stat.clickable) e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                            }}
                            onMouseOut={(e) => {
                                if (stat.clickable) e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    color: 'var(--text-muted)',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase'
                                }}>
                                    {stat.label}
                                </span>
                                <span style={{ fontSize: '20px', opacity: 0.8 }}>{stat.icon}</span>
                            </div>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: '800',
                                color: stat.color || 'inherit'
                            }}>
                                {stat.value}
                            </div>
                            {stat.clickable && (
                                <div style={{
                                    fontSize: '10px',
                                    color: 'var(--primary)',
                                    marginTop: '8px',
                                    fontWeight: 'bold'
                                }}>
                                    VIEW BREAKDOWN →
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '24px' }}>
                    {/* Left Panel: Map & Financial Trends */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '16px' }}>Farm Visualizer</h3>
                                <button className="outline" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => setView('add-field')}>+ Boundary</button>
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

                        {/* Cash Flow Trend Chart */}
                        <div className="card">
                            <div className="card-header">
                                <h3 style={{ margin: 0, fontSize: '16px' }}>Cash Flow Trend</h3>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PROJECTED VS ACTUAL</div>
                            </div>
                            <div style={{ height: '300px', width: '100%', marginTop: '20px', position: 'relative' }}>
                                {trendData && trendData.length > 0 ? (
                                    <ResponsiveContainer width="100%" aspect={2.5} debounce={100}>
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#cc0000" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#cc0000" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="revenue" stroke="#4caf50" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                                            <Area type="monotone" dataKey="expenses" stroke="#cc0000" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                        No trend data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Utilization & Inventory */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '14px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Land Utilization</h3>
                            <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                                {landUtilization !== undefined ? (
                                    <ResponsiveContainer width="100%" aspect={1.5} debounce={100}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Planted', value: parseFloat(landUtilization) || 0 },
                                                    { name: 'Available', value: Math.max(0, 100 - (parseFloat(landUtilization) || 0)) }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
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
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', minHeight: '150px' }}>Calculating...</div>
                                )}
                                <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                    <div style={{ fontSize: '28px', fontWeight: '800' }}>{landUtilization}%</div>
                                    <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold' }}>ESTATE OCCUPIED</div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: '800' }}>Recent Operations</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <ActivityItem type="Seeding" date="Just now" field="Field A" />
                                <ActivityItem type="Irrigation" date="2h ago" field="North Field" />
                                <ActivityItem type="Harvesting" date="Yesterday" field="Field B" />
                            </div>
                        </div>

                        <div className="card" style={{ backgroundColor: '#000', color: 'white' }}>
                            <h3 style={{ color: '#cc0000', fontSize: '14px', marginBottom: '12px' }}>PRO INSIGHT</h3>
                            <p style={{ fontSize: '12px', margin: 0, color: '#aaa', lineHeight: '1.5' }}>
                                Your land utilization is at {landUtilization}%. Expanding cultivation to available fields could increase seasonal revenue by up to 15%.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Full Width Inventory */}
                <div className="card" style={{ marginTop: '24px' }}>
                    <div className="card-header">
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Field Inventory & Soil Profile</h3>
                        <button className="outline" style={{ fontSize: '11px' }} onClick={() => window.print()}>EXPORT DATA</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '12px 8px' }}>Field Name</th>
                                    <th style={{ padding: '12px 8px' }}>Surface Area</th>
                                    <th style={{ padding: '12px 8px' }}>Soil Class</th>
                                    <th style={{ padding: '12px 8px' }}>Drainage</th>
                                    <th style={{ padding: '12px 8px' }}>Actions</th>
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
                                        <tr key={f.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--primary)' }}>{f.name}</td>
                                            <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{fieldDisplayArea.toFixed(2)} ha</td>
                                            <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>{f.soil_type || '—'}</td>
                                            <td style={{ padding: '12px 8px' }}>{f.drainage || '—'}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <button onClick={() => { setSelectedField(f); setView('field-details'); }} style={{ padding: '4px 12px', borderRadius: '2px', fontSize: '10px', backgroundColor: '#000', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>MANAGE</button>
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
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>{currentFarm?.name || 'Farm Overview'}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Welcome back! Here's what's happening on your farm.</p>
                </div>
                {view !== 'overview' && (
                    <button onClick={() => setView('overview')} className="outline">← Back to Dashboard</button>
                )}
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading farm data...</div>}

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
