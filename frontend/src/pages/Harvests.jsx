import React, { useState, useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import useHarvestStore from '../store/harvestStore';
import useCropStore from '../store/cropStore';
import HarvestForm from '../components/harvests/HarvestForm';
import { CROP_CATEGORIES } from '../constants/agriculturalData';

const Harvests = () => {
    const { currentFarm } = useFarmStore();
    const { harvests, fetchHarvestsByFarm, loading } = useHarvestStore();
    const { crops, fetchCropsByFarm } = useCropStore();
    const [view, setView] = useState('list'); // list, add
    const [selectedCropId, setSelectedCropId] = useState('');

    useEffect(() => {
        if (currentFarm) {
            fetchHarvestsByFarm(currentFarm.id);
            fetchCropsByFarm(currentFarm.id);
        }
    }, [currentFarm, fetchHarvestsByFarm, fetchCropsByFarm]);

    if (!currentFarm) return <div style={{ padding: '24px' }}>Please select a farm to view harvests.</div>;

    if (view === 'add') {
        if (!selectedCropId) {
            return (
                <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
                    <div className="card">
                        <h3 style={{ marginBottom: '20px' }}>Select Crop to Harvest</h3>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Planted Crops & Agricultural Catalog</label>
                            <select
                                value={selectedCropId}
                                onChange={(e) => setSelectedCropId(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }}
                            >
                                <option value="">-- Choose a crop to harvest --</option>
                                <optgroup label="✅ ACTIVE PLANTINGS">
                                    {crops.map(crop => (
                                        <option key={crop.id} value={crop.id}>
                                            {crop.crop_type} - {crop.variety} (Field: {crop.Field?.name}) [PLANTED]
                                        </option>
                                    ))}
                                </optgroup>
                                {Object.entries(CROP_CATEGORIES).map(([category, items]) => (
                                    <optgroup key={category} label={category}>
                                        {items.map(item => {
                                            const isPlanted = crops.some(c => c.crop_type === item.id);
                                            return (
                                                <option key={item.id} value={`TYPE:${item.id}`}>
                                                    {item.label} {isPlanted ? ' (PLANTED)' : ''}
                                                </option>
                                            );
                                        })}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="primary" style={{ flex: 1 }} disabled={!selectedCropId} onClick={() => setView('add-form')}>Continue</button>
                            <button className="outline" style={{ flex: 1 }} onClick={() => setView('list')}>Cancel</button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    if (view === 'add-form') return <HarvestForm cropId={selectedCropId} onComplete={() => { setView('list'); setSelectedCropId(''); }} />;

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Harvest Tracking</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Record yields, moisture levels, and quality grades for {currentFarm?.name}.</p>
                </div>
                <button className="primary" onClick={() => setView('add')}>+ Record New Harvest</button>
            </div>

            <div className="snapshot-grid" style={{ marginBottom: '32px' }}>
                <div className="snapshot-card">
                    <div className="snapshot-label">Total Weight</div>
                    <div className="snapshot-value">{harvests.reduce((acc, h) => acc + parseFloat(h.quantity || 0), 0).toFixed(2)} kg</div>
                </div>
                <div className="snapshot-card">
                    <div className="snapshot-label">Total Revenue</div>
                    <div className="snapshot-value">{harvests.reduce((acc, h) => acc + parseFloat(h.revenue_total || 0), 0).toLocaleString()} XAF</div>
                </div>
                <div className="snapshot-card">
                    <div className="snapshot-label">Avg Moisture</div>
                    <div className="snapshot-value">
                        {harvests.length > 0
                            ? (harvests.reduce((acc, h) => acc + parseFloat(h.moisture_content || 0), 0) / harvests.length).toFixed(1)
                            : 0}%
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '16px' }}>Date</th>
                            <th style={{ padding: '16px' }}>Crop</th>
                            <th style={{ padding: '16px' }}>Quantity</th>
                            <th style={{ padding: '16px' }}>Quality</th>
                            <th style={{ padding: '16px' }}>Moisture</th>
                            <th style={{ padding: '16px' }}>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {harvests.map(harvest => (
                            <tr key={harvest.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                <td style={{ padding: '16px' }}>{new Date(harvest.harvest_date).toLocaleDateString()}</td>
                                <td style={{ padding: '16px', fontWeight: '600' }}>{harvest.Crop?.crop_name || 'Unknown'}</td>
                                <td style={{ padding: '16px' }}>{harvest.quantity} {harvest.unit}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        backgroundColor: harvest.quality_grade === 'Premium' ? '#e6f4ea' : '#fef7e0',
                                        color: harvest.quality_grade === 'Premium' ? '#1e7e34' : '#b05d22'
                                    }}>
                                        {harvest.quality_grade}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>{harvest.moisture_content}%</td>
                                <td style={{ padding: '16px', fontWeight: 'bold' }}>{parseFloat(harvest.revenue_total || 0).toLocaleString()} XAF</td>
                            </tr>
                        ))}
                        {harvests.length === 0 && !loading && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No harvest records found.</td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading harvests...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Harvests;
