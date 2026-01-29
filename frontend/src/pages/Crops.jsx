import React, { useState, useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import useCropStore from '../store/cropStore';
import CropForm from '../components/crops/CropForm';

const Crops = () => {
    const { currentFarm } = useFarmStore();
    const { crops, fetchCropsByFarm, loading, fetchCropTimeline, deleteCrop } = useCropStore();
    const [view, setView] = useState('list'); // list, add, details

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');
        if (viewParam) {
            setView(viewParam);
            // Clear the param after reading to prevent sticky view on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const [selectedCrop, setSelectedCrop] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [costData, setCostData] = useState(null);
    const [timelineLoading, setTimelineLoading] = useState(false);

    useEffect(() => {
        if (currentFarm) {
            fetchCropsByFarm(currentFarm.id);
        }
    }, [currentFarm, fetchCropsByFarm]);

    const handleViewDetails = async (crop) => {
        setSelectedCrop(crop);
        setView('details');
        setTimelineLoading(true);
        try {
            const [timelineData, costResult] = await Promise.all([
                fetchCropTimeline(crop.id),
                useCropStore.getState().fetchCropProductionCost(crop.id)
            ]);
            setTimeline(timelineData);
            setCostData(costResult);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setTimelineLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this crop record?')) {
            await deleteCrop(id);
            if (selectedCrop?.id === id) setView('list');
        }
    };

    if (!currentFarm) return <div style={{ padding: '24px' }}>Please select a farm to view crops.</div>;

    if (view === 'add') return <CropForm onComplete={() => setView('list')} />;

    if (view === 'details' && selectedCrop) {
        return (
            <div className="animate-fade-in" style={{ padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <button className="outline" onClick={() => setView('list')}>← Back to Crops</button>
                </div>

                <div className="flex gap-24 wrap">
                    <div className="card" style={{ flex: '1 1 300px' }}>
                        <div className="flex j-between a-center" style={{ marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>{selectedCrop.crop_type}</h2>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                backgroundColor: 'var(--primary-light)',
                                color: 'var(--primary)',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                {selectedCrop.status.toUpperCase()}
                            </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <InfoItem label="Variety" value={selectedCrop.variety} />
                            <InfoItem label="Season" value={selectedCrop.season} />
                            <InfoItem label="Planted" value={new Date(selectedCrop.planting_date).toLocaleDateString()} />
                            <InfoItem label="Est. Harvest" value={selectedCrop.expected_harvest_date ? new Date(selectedCrop.expected_harvest_date).toLocaleDateString() : 'N/A'} />
                            <InfoItem label="Area" value={`${selectedCrop.planted_area} ha`} />
                            <InfoItem label="Field" value={selectedCrop.Field?.name || 'Unknown'} />
                        </div>

                        {costData && (
                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                                <h4 style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '16px' }}>PRODUCTION COST SUMMARY</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div className="flex j-between">
                                        <span style={{ fontSize: '13px' }}>Budgeted</span>
                                        <span style={{ fontWeight: 'bold' }}>{costData.estimatedCost.toLocaleString()} XAF</span>
                                    </div>
                                    <div className="flex j-between">
                                        <span style={{ fontSize: '13px' }}>Actual Total</span>
                                        <span style={{ fontWeight: 'bold', color: costData.variance < 0 ? '#dc3545' : '#28a745' }}>
                                            {costData.totalActualCost.toLocaleString()} XAF
                                        </span>
                                    </div>
                                    <div style={{ height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.min(100, (costData.totalActualCost / (costData.estimatedCost || 1)) * 100)}%`,
                                            backgroundColor: costData.variance < 0 ? '#dc3545' : 'var(--primary)'
                                        }} />
                                    </div>
                                    <div className="flex j-between" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span>Labor: {costData.actualLaborCost.toLocaleString()}</span>
                                        <span>Inputs: {costData.actualInputCost.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Notes</label>
                            <p style={{ marginTop: '8px', fontSize: '14px', lineHeight: '1.6' }}>{selectedCrop.notes || 'No notes provided.'}</p>
                        </div>
                        <button
                            className="outline"
                            style={{ marginTop: '24px', width: '100%', color: '#dc3545', borderColor: '#dc3545' }}
                            onClick={() => handleDelete(selectedCrop.id)}
                        >
                            Delete Cultivation Record
                        </button>
                    </div>

                    <div className="card" style={{ flex: '2 1 500px' }}>
                        <h3 style={{ marginBottom: '24px' }}>Activity Timeline</h3>
                        {timelineLoading ? (
                            <p>Loading timeline...</p>
                        ) : (
                            <div className="timeline">
                                {timeline.map((item, idx) => (
                                    <div key={idx} className="timeline-item" style={{
                                        display: 'flex',
                                        gap: '16px',
                                        marginBottom: '24px',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: item.type === 'activity' ? 'var(--primary)' : '#ff9800',
                                            marginTop: '6px',
                                            zIndex: 2
                                        }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(item.date).toLocaleDateString()}</div>
                                            <div style={{ fontWeight: 'bold', margin: '4px 0' }}>{item.title}</div>
                                            <div style={{ fontSize: '14px' }}>{item.description}</div>
                                        </div>
                                    </div>
                                ))}
                                {timeline.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No activities recorded for this crop yet.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Crops & Cultivation</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage all active and historical plantings for {currentFarm?.name}.</p>
                </div>
                <button className="primary" onClick={() => setView('add')}>+ Plan New Crop</button>
            </div>

            {/* AgriXP Style Summary Box */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                marginBottom: '32px'
            }}>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>TOTAL PLANTED AREA</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>
                        {crops.reduce((sum, c) => sum + parseFloat(c.planted_area || 0), 0).toFixed(2)} ha
                    </div>
                </div>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid #4a90e2' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>CROP DIVERSITY</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>
                        {new Set(crops.map(c => c.crop_type)).size} Active Types
                    </div>
                </div>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f5a623' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>ESTIMATED TOTAL BUDGET</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>
                        {crops.reduce((sum, c) => sum + parseFloat(c.estimated_cost || 0), 0).toLocaleString()} <span style={{ fontSize: '14px' }}>XAF</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {crops.map(crop => (
                    <div key={crop.id} className="card hover-glow" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => handleViewDetails(crop)}>
                        <div className="flex j-between a-start">
                            <div style={{ fontSize: '32px' }}>🌱</div>
                            <span style={{
                                fontSize: '10px',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                backgroundColor: crop.status === 'planted' ? '#e8f5e9' : '#fff3e0',
                                color: crop.status === 'planted' ? '#2e7d32' : '#ef6c00',
                                fontWeight: 'bold'
                            }}>
                                {crop.status.toUpperCase()}
                            </span>
                        </div>
                        <h3 style={{ margin: '16px 0 8px 0' }}>{crop.crop_type}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            {crop.variety} • {crop.season}
                        </p>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            <div style={{ marginBottom: '4px' }}>📍 Field: {crop.Field?.name || 'N/A'}</div>
                            <div>🗓️ Planted: {new Date(crop.planting_date).toLocaleDateString()}</div>
                        </div>
                    </div>
                ))}
            </div>

            {crops.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '24px' }}>🚜</div>
                    <h3>No crops currently recorded.</h3>
                    <p>Start by planning a new cultivation record for your fields.</p>
                </div>
            )}

            {loading && <p style={{ textAlign: 'center', padding: '40px' }}>Loading crops...</p>}
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</label>
        <div style={{ fontWeight: '500', fontSize: '14px', marginTop: '4px' }}>{value || 'N/A'}</div>
    </div>
);

export default Crops;
