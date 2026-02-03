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
    const { fetchFarms, farms, currentFarm, fields, fetchFields, loading, loadFarm } = useFarmStore();
    const { fetchAllCrops, crops } = useCropStore();
    const { infrastructure, fetchInfrastructure } = useInfrastructureStore(); // Assuming global fetch exists or we filter? Infrastructure store needs check, but we'll stick to farm for now as it's minor. Actually, let's just fetch by farm when switching.
    // For simplicity given prev step, we fetch ALL crops/activities/harvests.
    const { fetchAllHarvests, harvests } = useHarvestStore();
    const { fetchAllActivities, activities } = useActivityStore();
    const { budgetData, fetchCropBudgets } = useReportStore();

    const [view, setView] = useState('overview');
    const [isGlobalView, setIsGlobalView] = useState(true); // Default to Global View
    const [selectedField, setSelectedField] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFarms();
        fetchAllCrops();
        fetchAllActivities();
        fetchAllHarvests();
    }, []);

    // When switching farms or views, update local contexts if needed
    useEffect(() => {
        if (!isGlobalView && currentFarm?.id) {
            fetchFields(currentFarm.id);
            // We have all crops/activities/harvests in memory, so no need to refetch specific farm endpoints if we filter locally.
            // However, fetchFields is specific.
            fetchInfrastructure(currentFarm.id);
            fetchCropBudgets(currentFarm.id);
        } else if (isGlobalView && farms && farms.length > 0) {
            // In global, we might want to fetch ALL fields? fieldStore doesn't have fetchAllFields yet... 
            // For now, if global, we aggregate fields from currentFarm? No.
            // Limitations: Fields are fetched by farm. Map will only show fields of selected farm if we don't fetch all.
            // Workaround: Loop fetch fields for all farms? Or just accept fields are per farm?
            // User requirement: "All details for a selected farm".
            // Global view map: "All farms".
            // Let's iterate fetchFields for all farms if global?
            farms.forEach(f => fetchFields(f.id)); // This might be heavy but ensures map has all fields.
        }
    }, [currentFarm, isGlobalView, farms?.length]);

    // Listen for 'open-new-farm' event from sidebar
    useEffect(() => {
        const handleOpenNewFarm = () => {
            setView('add-farm');
        };
        window.addEventListener('open-new-farm', handleOpenNewFarm);
        return () => window.removeEventListener('open-new-farm', handleOpenNewFarm);
    }, []);

    // FILTER DATA BASED ON VIEW MODE
    const activeFarms = isGlobalView ? (farms || []) : (currentFarm ? [currentFarm] : []);

    const activeCrops = useMemo(() => {
        if (!crops || !Array.isArray(crops)) return [];
        return isGlobalView
            ? crops
            : crops.filter(c => c.Field?.farm_id === currentFarm?.id);
    }, [crops, isGlobalView, currentFarm]);

    const activeActivities = useMemo(() => {
        if (!activities || !Array.isArray(activities)) return [];
        return isGlobalView
            ? activities
            : activities.filter(a => a.farm_id === currentFarm?.id);
    }, [activities, isGlobalView, currentFarm]);

    const activeFields = useMemo(() => {
        if (!fields || !Array.isArray(fields)) return [];
        return isGlobalView
            ? fields
            : fields;
    }, [fields, isGlobalView]);


    // Derived Statistics

    const totalPlantedArea = useMemo(() => {
        return (activeCrops || [])
            .filter(c => c.status === 'planted' || c.status === 'active' || c.status === 'growing')
            .reduce((sum, c) => sum + parseFloat(c.planted_area || 0), 0);
    }, [activeCrops]);

    const totalFarmArea = useMemo(() => (activeFarms || [])
        .reduce((sum, f) => sum + parseFloat(f.total_area || 0), 0), [activeFarms]);

    const totalRevenue = useMemo(() =>
        (activeActivities || []).filter(a => a.transaction_type === 'income' || a.activity_type === 'harvesting')
            .reduce((sum, a) => sum + (parseFloat(a.total_cost) || parseFloat(a.labor_cost) || 0), 0)
        , [activeActivities]);

    const totalExpenses = useMemo(() =>
        (activeActivities || []).filter(a => a.transaction_type === 'expense')
            .reduce((sum, a) => sum + (parseFloat(a.total_cost) || parseFloat(a.labor_cost) || 0), 0)
        , [activeActivities]);

    const netCashFlow = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);

    const formatToXAF = (value) => {
        return new Intl.NumberFormat('en-US').format(Math.round(value)) + ' XAF';
    };

    const stats = useMemo(() => [
        { label: 'Revenue', value: formatToXAF(totalRevenue), icon: '💰', color: 'var(--success)' },
        { label: 'Expenses', value: formatToXAF(totalExpenses), icon: '📉', color: 'var(--error)' },
        { label: 'Cash Flow', value: formatToXAF(netCashFlow), icon: '⚖️', color: netCashFlow >= 0 ? 'var(--success)' : 'var(--error)' },
        { label: 'Total Area', value: `${totalFarmArea.toFixed(2)} ha`, icon: '📏', color: 'var(--accent)' },
        {
            label: 'Planted',
            value: `${totalPlantedArea.toFixed(1)} ha`,
            icon: '🌱',
            onClick: () => setView('crop-breakdown'),
            clickable: true
        },
        { label: 'Farms Active', value: activeFarms.length, icon: '🚜' } // Changed from Fields to Farms count or Fields count?
    ], [totalRevenue, totalExpenses, netCashFlow, totalFarmArea, totalPlantedArea, activeFarms.length]);



    // LOADING GUARD: After all hooks, before JSX rendering
    if (loading || (!farms || farms.length === 0)) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '60vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{ fontSize: '32px' }}>🌾</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#666' }}>
                    Loading Dashboard...
                </div>
            </div>
        );
    }

    const renderCropBreakdown = () => (
        <div className="animate-fade-in card">
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>{isGlobalView ? 'Enterprise' : (currentFarm?.name || 'Farm')} Crop Portfolio</h3>
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
                        <th style={{ padding: '12px 8px' }}>{isGlobalView ? 'Farm Origin' : 'Location'}</th>
                    </tr>
                </thead>
                <tbody>
                    {activeCrops.filter(c => c.status === 'planted' || c.status === 'active' || c.status === 'growing').map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                            <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{c.crop_type}</td>
                            <td style={{ padding: '12px 8px' }}>{c.variety}</td>
                            <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--secondary)' }}>{parseFloat(c.planted_area || 0).toFixed(2)} ha</td>
                            <td style={{ padding: '12px 8px' }}>{c.Field?.Farm?.name || (fields || []).find(f => f.id === c.field_id)?.name || 'N/A'}</td>
                        </tr>
                    ))}
                    {activeCrops.length === 0 && (
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
        if (view === 'edit-farm') return <FarmForm initialData={currentFarm} onComplete={() => setView('overview')} />;
        if (view === 'add-field') return <FieldForm onComplete={() => { setView('overview'); fetchFields(currentFarm.id); }} />;
        if (view === 'field-details') return <FieldDetails field={selectedField} onBack={() => setView('overview')} />;
        if (view === 'crop-breakdown') return renderCropBreakdown();

        return (
            <div className="animate-fade-in">
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
                {/* Section 1: Top Widgets */}
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
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', letterSpacing: '0.5px' }}>
                                    {isGlobalView ? 'ENTERPRISE GEO-SPATIAL VIEW' : `${currentFarm?.name?.toUpperCase()} MAP`}
                                </h3>
                                {!isGlobalView && <button className="outline" style={{ padding: '4px 10px', fontSize: '10px', fontWeight: '800' }} onClick={() => setView('add-field')}>+ BOUNDARY</button>}
                            </div>
                            <div style={{ height: '400px' }}>
                                <FieldMap
                                    center={(!isGlobalView && currentFarm?.coordinates?.coordinates)
                                        ? [currentFarm.coordinates.coordinates[1], currentFarm.coordinates.coordinates[0]]
                                        : [3.8480, 11.5021]} // Default to Cameroon Center if Global and no specific center logic
                                    fields={activeFields} // Note: global view might lack fields if fieldStore isn't aggregated
                                    crops={activeCrops}
                                    infrastructure={infrastructure}
                                    farms={activeFarms} // Pass only active farms (all or one)
                                    editable={false}
                                />
                            </div>
                        </div>

                    </div>

                </div>

                {/* Section 3: Farm Portfolio Registry or Single Farm Fields */}

                {isGlobalView ? (
                    <div className="card" style={{ marginTop: '24px', padding: '0' }}>
                        <div style={{ padding: '16px', borderBottom: '2px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--secondary)' }}>Farm Portfolio & Field Analytics</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="outline" style={{ fontSize: '10px', fontWeight: '800', padding: '4px 10px' }} onClick={() => window.print()}>EXPORT</button>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', fontSize: '11px', color: '#fff', borderBottom: '1px solid #eee', backgroundColor: 'var(--secondary)' }}>
                                        <th style={{ padding: '10px 16px' }}>FARM NAME</th>
                                        <th style={{ padding: '10px 16px' }}>TOTAL AREA</th>
                                        <th style={{ padding: '10px 16px' }}>LOCATION</th>
                                        <th style={{ padding: '10px 16px', textAlign: 'right' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(farms || []).map(f => (
                                        <tr key={f.id} style={{ borderBottom: '1px solid #f5f5f5', fontSize: '13px', backgroundColor: '#f0f7f0' }}>
                                            <td style={{ padding: '10px 16px', fontWeight: '800', color: 'var(--primary)' }}>{f.name.toUpperCase()}</td>
                                            <td style={{ padding: '10px 16px', fontWeight: '600' }}>{parseFloat(f.total_area || 0).toFixed(2)} ha</td>
                                            <td style={{ padding: '10px 16px' }}>{f.city}, {f.country}</td>
                                            <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                                                <button onClick={() => {
                                                    loadFarm(f.id);
                                                    setIsGlobalView(false); // Auto-switch to single view
                                                }} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '10px', backgroundColor: 'white', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer', fontWeight: '700' }}>MANAGE</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ marginTop: '24px', padding: '0' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#666' }}>Active Field Details ({currentFarm?.name})</h3>
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
                                    {(fields || []).map(f => {
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
                                    {(!fields || fields.length === 0) && <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No fields. Click +BOUNDARY on the map to add one.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            {/* Header: Modern & Clean */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: 'var(--secondary)', letterSpacing: '-1px' }}>
                        {isGlobalView ? 'ENTERPRISE OVERVIEW' : (currentFarm?.name || 'CENTRAL STATION')}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        {/* View Toggle */}
                        <div style={{ display: 'flex', backgroundColor: '#e0e0e0', borderRadius: '20px', padding: '2px' }}>
                            <button
                                onClick={() => setIsGlobalView(true)}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    backgroundColor: isGlobalView ? 'var(--primary)' : 'transparent',
                                    color: isGlobalView ? 'white' : '#666',
                                    boxShadow: isGlobalView ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                GLOBAL
                            </button>
                            <button
                                onClick={() => setIsGlobalView(false)}
                                disabled={!currentFarm}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: !currentFarm ? 'not-allowed' : 'pointer',
                                    backgroundColor: !isGlobalView ? 'var(--primary)' : 'transparent',
                                    color: !isGlobalView ? 'white' : '#666',
                                    boxShadow: !isGlobalView ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s',
                                    opacity: !currentFarm ? 0.5 : 1
                                }}
                            >
                                SINGLE FARM
                            </button>
                        </div>

                        <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '700', padding: '4px 10px', backgroundColor: 'rgba(46, 125, 50, 0.1)', borderRadius: '12px' }}>
                            ● {activeFarms.length} ACTIVE UNITS
                        </span>
                        {!isGlobalView && (
                            <button
                                onClick={() => setView('edit-farm')}
                                style={{
                                    marginLeft: '12px',
                                    border: '1px solid #ddd',
                                    backgroundColor: 'white',
                                    fontSize: '11px',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    color: '#555'
                                }}
                            >
                                ⚙️ EDIT CONFIG
                            </button>
                        )}
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
