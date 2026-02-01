import React, { useState, useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import useHarvestStore from '../store/harvestStore';
import useCropStore from '../store/cropStore';
import useUIStore from '../store/uiStore';
import HarvestForm from '../components/harvests/HarvestForm';
import { CROP_CATEGORIES } from '../constants/agriculturalData';

const Harvests = () => {
    const { currentFarm } = useFarmStore();
    const { harvests, fetchHarvestsByFarm, deleteHarvest, loading } = useHarvestStore();
    const { crops, fetchCropsByFarm } = useCropStore();
    const { showNotification, showConfirm, showAlert } = useUIStore();
    const [view, setView] = useState('list'); // list, add, edit
    const [selectedCropId, setSelectedCropId] = useState('');
    const [selectedHarvest, setSelectedHarvest] = useState(null);

    useEffect(() => {
        if (currentFarm) {
            fetchHarvestsByFarm(currentFarm.id);
            fetchCropsByFarm(currentFarm.id);
        }
    }, [currentFarm, fetchHarvestsByFarm, fetchCropsByFarm]);

    const handleDelete = (id) => {
        showConfirm('DELETE_HARVEST', async () => {
            try {
                const response = await deleteHarvest(id);
                const msg = response?.notification?.message || 'HARVEST RECORD DELETED - ARCHIVE UPDATED';
                showNotification(msg, 'success');
            } catch (error) {
                const msg = error.response?.data?.notification?.message || 'DELETE FAILED: SYSTEM INTEGRITY ERROR';
                showNotification(msg, 'error');
            }
        });
    };

    const handleEdit = (harvest) => {
        setSelectedHarvest(harvest);
        setSelectedCropId(harvest.crop_id);
        setView('edit');
    };

    const handleView = (harvest) => {
        setSelectedHarvest(harvest);
        setView('view-details');
    };

    if (!currentFarm) return <div style={{ padding: '24px' }}>Please select a farm to view harvests.</div>;

    if (view === 'view-details' && selectedHarvest) {
        return (
            <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '40px auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'var(--primary)', padding: '24px 40px', color: 'white' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Harvest Intelligence Report</h1>
                </div>
                <div style={{ padding: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CROP TYPE</label>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>{selectedHarvest.Crop?.crop_type}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>HARVEST DATE</label>
                            <div style={{ fontSize: '18px', fontWeight: '600' }}>{new Date(selectedHarvest.harvest_date).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>QUANTITY COLLECTED</label>
                            <div style={{ fontSize: '18px', fontWeight: '600' }}>{parseFloat(selectedHarvest.quantity).toLocaleString()} {selectedHarvest.unit}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL REVENUE</label>
                            <div style={{ fontSize: '18px', fontWeight: '700' }}>{parseFloat(selectedHarvest.total_revenue).toLocaleString()} XAF</div>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TECHNICAL NOTES</label>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>{selectedHarvest.notes || 'No operational notes provided.'}</p>
                    </div>
                    <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
                        <button className="primary" onClick={() => setView('edit')} style={{ flex: 1, padding: '12px', fontWeight: '600' }}>EDIT RECORD</button>
                        <button className="outline" onClick={() => setView('list')} style={{ flex: 1, padding: '12px', fontWeight: '600' }}>CLOSE REPORT</button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'add') {
        return (
            <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '40px auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'var(--primary)', padding: '24px 40px', color: 'white' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Select Harvest Operation</h1>
                </div>

                <div style={{ padding: '40px' }}>
                    <div style={{ backgroundColor: '#f0f9ff', color: '#1e3a8a', padding: '16px', marginBottom: '32px', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>🌱</span>
                        <p style={{ fontSize: '13px', fontWeight: '500', margin: 0 }}>
                            Identify the active planting or agricultural asset for harvest logging.
                        </p>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', display: 'block' }}>
                            Target Cultivation / Planted Area
                        </label>
                        <select
                            value={selectedCropId}
                            onChange={(e) => setSelectedCropId(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                        >
                            <option value="">-- ARCHIVE LOOKUP: CHOOSE ACTIVE PLANTING --</option>
                            {crops.length > 0 ? (
                                <optgroup label="✅ ACTIVE FIELD PLANTINGS">
                                    {crops.map(crop => (
                                        <option key={crop.id} value={crop.id}>
                                            {crop.crop_type} - {crop.variety} (FIELD: {crop.Field?.name || 'GENERIC'})
                                        </option>
                                    ))}
                                </optgroup>
                            ) : (
                                <option disabled value="no-plantings">⚠️ NO ACTIVE PLANTINGS DETECTED - REGISTER CROP FIRST</option>
                            )}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button
                            className="primary"
                            disabled={!selectedCropId || selectedCropId.startsWith('TYPE:') || selectedCropId === 'no-plantings'}
                            onClick={() => {
                                if (selectedCropId && !selectedCropId.startsWith('TYPE:')) {
                                    setView('add-form');
                                } else {
                                    showAlert('INVALID_CROP');
                                }
                            }}
                            style={{ flex: 2, padding: '14px' }}
                        >
                            Initialize Harvest Ledger
                        </button>
                        <button
                            className="outline"
                            onClick={() => setView('list')}
                            style={{ flex: 1, padding: '14px' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'add-form') return <HarvestForm cropId={selectedCropId} onComplete={() => { setView('list'); setSelectedCropId(''); }} />;
    if (view === 'edit' && selectedHarvest) return <HarvestForm initialData={selectedHarvest} onComplete={() => { setView('list'); setSelectedHarvest(null); }} />;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 0 40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '0 24px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        Harvest Records
                    </h1>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        <span>STATION: {currentFarm?.name}</span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span>DEPT: YIELD INTELLIGENCE</span>
                    </div>
                </div>
                <button
                    className="primary"
                    onClick={() => { setView('add'); setSelectedCropId(''); }}
                >
                    + Record New Harvest
                </button>
            </div>

            <div style={{ padding: '0 24px' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                    {/* Summary Cards */}
                    <div style={{ flex: 1, backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Net Weight</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>{harvests.reduce((acc, h) => acc + parseFloat(h.quantity || 0), 0).toLocaleString()} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>KG</span></div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Audit Revenue</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--success)' }}>{harvests.reduce((acc, h) => acc + parseFloat(h.total_revenue || 0), 0).toLocaleString()} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>XAF</span></div>
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Quality Average</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {harvests.length > 0
                                ? (harvests.reduce((acc, h) => acc + parseFloat(h.moisture_content || 0), 0) / harvests.length).toFixed(1)
                                : 0}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>% MOISTURE</span>
                        </div>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>OPERATIONAL HARVEST LEDGER</div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Date</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Crop Intelligence</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Log Quantity</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Grade</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Moist. Index</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Revenue (XAF)</th>
                                <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {harvests.map(harvest => (
                                <tr key={harvest.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>{new Date(harvest.harvest_date).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--primary)' }}>{harvest.Crop?.crop_type || 'Unknown'}</td>
                                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>{parseFloat(harvest.quantity || 0).toLocaleString()} {harvest.unit}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            backgroundColor: '#f1f5f9',
                                            color: 'var(--text-secondary)',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase'
                                        }}>
                                            {harvest.quality_grade || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>{harvest.moisture_content}%</td>
                                    <td style={{ padding: '16px 24px', fontWeight: '600' }}>{parseFloat(harvest.total_revenue || 0).toLocaleString()}</td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                className="outline"
                                                onClick={() => handleView(harvest)}
                                                style={{ padding: '6px 12px', fontSize: '11px' }}
                                            >VIEW</button>
                                            <button
                                                className="outline"
                                                onClick={() => handleEdit(harvest)}
                                                style={{ padding: '6px 12px', fontSize: '11px' }}
                                            >EDIT</button>
                                            <button
                                                onClick={() => handleDelete(harvest.id)}
                                                style={{ border: '1px solid var(--error)', background: 'white', color: 'var(--error)', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', borderRadius: '4px' }}
                                            >DEL</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {harvests.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '32px', marginBottom: '16px' }}>🌾</div>
                                        <div style={{ fontSize: '14px', fontWeight: '500' }}>No operational data found in archive.</div>
                                    </td>
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
