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
        return (
            <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '40px auto', backgroundColor: '#fff', border: '1px solid #000', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
                {/* BBC/CNN Style Header Banner */}
                <div style={{ backgroundColor: '#bb1919', padding: '24px 40px', color: 'white', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '0', left: '0', height: '100%', width: '4px', backgroundColor: '#000' }}></div>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase' }}>
                        <span style={{ backgroundColor: '#fff', color: '#bb1919', padding: '2px 8px', marginRight: '10px' }}>SELECT</span>
                        Harvest Operation
                    </h1>
                </div>

                <div style={{ padding: '40px', backgroundColor: '#fcfcfc' }}>
                    <div style={{ backgroundColor: '#000', color: '#fff', padding: '12px 20px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>🌱</span>
                        <p style={{ fontSize: '12px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Identify the active planting or agricultural asset for harvest logging.
                        </p>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '10px', display: 'block', letterSpacing: '1px' }}>
                            Target Cultivation / Planted Area
                        </label>
                        <select
                            value={selectedCropId}
                            onChange={(e) => setSelectedCropId(e.target.value)}
                            style={{ width: '100%', padding: '15px', borderRadius: '0', border: '2px solid #ddd', fontSize: '14px', fontWeight: '700', backgroundColor: '#fff' }}
                        >
                            <option value="">-- ARCHIVE LOOKUP: CHOOSE PLANTING --</option>
                            <optgroup label="✅ ACTIVE FIELD PLANTINGS">
                                {crops.map(crop => (
                                    <option key={crop.id} value={crop.id}>
                                        {crop.crop_type} - {crop.variety} (FIELD: {crop.Field?.name})
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="📂 GLOBAL CROP CATALOG">
                                {Object.entries(CROP_CATEGORIES).map(([category, items]) => (
                                    <optgroup key={category} label={`   ${category.toUpperCase()}`}>
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
                            </optgroup>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button
                            className="primary"
                            disabled={!selectedCropId}
                            onClick={() => setView('add-form')}
                            style={{ flex: 2, padding: '18px', borderRadius: '0', backgroundColor: selectedCropId ? '#000' : '#ccc', color: '#fff', fontSize: '13px', fontWeight: '900', border: 'none', textTransform: 'uppercase', letterSpacing: '1px', cursor: selectedCropId ? 'pointer' : 'not-allowed' }}
                        >
                            Initialize Harvest Ledger
                        </button>
                        <button
                            className="outline"
                            onClick={() => setView('list')}
                            style={{ flex: 1, padding: '18px', borderRadius: '0', backgroundColor: '#fff', color: '#000', border: '2px solid #000', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
                        >
                            Abort
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'add-form') return <HarvestForm cropId={selectedCropId} onComplete={() => { setView('list'); setSelectedCropId(''); }} />;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 0 40px 0', backgroundColor: '#fff', border: '1px solid #000', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            {/* BBC/CNN Style Header Banner */}
            <div style={{ backgroundColor: '#bb1919', padding: '32px 40px', color: 'white', position: 'relative', marginBottom: '32px' }}>
                <div style={{ position: 'absolute', top: '0', left: '0', height: '100%', width: '4px', backgroundColor: '#000' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase' }}>
                            <span style={{ backgroundColor: '#fff', color: '#bb1919', padding: '2px 8px', marginRight: '10px' }}>LOG</span>
                            Harvest Records
                        </h1>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <span>STATION: {currentFarm?.name}</span>
                            <span style={{ opacity: 0.6 }}>|</span>
                            <span>DEPT: YIELD INTELLIGENCE</span>
                        </div>
                    </div>
                    <button
                        className="primary"
                        onClick={() => { setView('add'); setSelectedCropId(''); }}
                        style={{ backgroundColor: '#000', color: '#fff', border: 'none', padding: '12px 24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
                    >
                        + Record New Harvest
                    </button>
                </div>
            </div>

            <div style={{ padding: '0 40px' }}>
                <div style={{ backgroundColor: '#000', color: '#fff', padding: '15px 25px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '24px' }}>📊</span>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Yield Analytics & Revenue Tracking
                        </p>
                        <p style={{ fontSize: '12px', opacity: 0.7, margin: 0 }}>Real-time data synchronization with global farm intelligence protocols.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', backgroundColor: '#000', border: '2px solid #000', marginBottom: '48px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', letterSpacing: '2px', marginBottom: '8px' }}>Total Net Weight</div>
                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#000' }}>{harvests.reduce((acc, h) => acc + parseFloat(h.quantity || 0), 0).toFixed(2)} <span style={{ fontSize: '14px', color: '#bb1919' }}>KG</span></div>
                    </div>
                    <div style={{ backgroundColor: '#fff', padding: '24px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', letterSpacing: '2px', marginBottom: '8px' }}>Audit Revenue</div>
                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#000' }}>{harvests.reduce((acc, h) => acc + parseFloat(h.revenue_total || 0), 0).toLocaleString()} <span style={{ fontSize: '14px', color: '#bb1919' }}>XAF</span></div>
                    </div>
                    <div style={{ backgroundColor: '#fff', padding: '24px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#777', letterSpacing: '2px', marginBottom: '8px' }}>Quality Average</div>
                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#000' }}>
                            {harvests.length > 0
                                ? (harvests.reduce((acc, h) => acc + parseFloat(h.moisture_content || 0), 0) / harvests.length).toFixed(1)
                                : 0}<span style={{ fontSize: '14px', color: '#bb1919' }}>% MOISTURE</span>
                        </div>
                    </div>
                </div>

                <div style={{ border: '2px solid #000' }}>
                    <div style={{ backgroundColor: '#000', color: '#fff', padding: '12px 20px', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Operational Harvest Ledger
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', fontSize: '11px', color: '#000', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #000', backgroundColor: '#f4f4f4' }}>
                                <th style={{ padding: '15px 20px', fontWeight: '900' }}>Date</th>
                                <th style={{ padding: '15px 20px', fontWeight: '900' }}>Crop Intelligence</th>
                                <th style={{ padding: '15px 20px', fontWeight: '900' }}>Log Quantity</th>
                                <th style={{ padding: '15px 20px', fontWeight: '900' }}>Grade</th>
                                <th style={{ padding: '15px 20px', fontWeight: '900' }}>Moist. Index</th>
                                <th style={{ padding: '15px 20px', fontWeight: '900' }}>Revenue (XAF)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {harvests.map(harvest => (
                                <tr key={harvest.id} style={{ borderBottom: '1px solid #eee', fontSize: '13px' }}>
                                    <td style={{ padding: '15px 20px', fontWeight: '700' }}>{new Date(harvest.harvest_date).toLocaleDateString()}</td>
                                    <td style={{ padding: '15px 20px', fontWeight: '900', color: '#bb1919' }}>{harvest.Crop?.crop_type || 'Unknown'}</td>
                                    <td style={{ padding: '15px 20px', fontWeight: '700' }}>{harvest.quantity} {harvest.unit}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            backgroundColor: '#000',
                                            color: '#fff',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase'
                                        }}>
                                            {harvest.quality_grade || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', fontWeight: '700' }}>{harvest.moisture_content}%</td>
                                    <td style={{ padding: '15px 20px', fontWeight: '900' }}>{parseFloat(harvest.revenue_total || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                            {harvests.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#777', textTransform: 'uppercase', fontSize: '11px', fontWeight: '900', letterSpacing: '2px' }}>No operational data found in archive.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Harvests;
