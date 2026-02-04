import React, { useState } from 'react';
import useHarvestStore from '../../store/harvestStore';
import useUIStore from '../../store/uiStore';
import FormHeader from '../common/FormHeader';

const HarvestForm = ({ cropId, onComplete, initialData }) => {
    const { createHarvest, updateHarvest } = useHarvestStore();
    const { showNotification } = useUIStore();

    // Helper to format numbers with commas
    const formatValue = (val) => {
        if (val === null || val === undefined || val === '') return '';
        const parts = val.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    // Helper to strip commas for numeric storage
    const stripCommas = (val) => {
        return val.toString().replace(/,/g, '');
    };

    const [formData, setFormData] = useState({
        harvest_date: initialData?.harvest_date || new Date().toISOString().split('T')[0],
        area_harvested: initialData?.area_harvested || '',
        quantity: initialData?.quantity || '',
        unit: initialData?.unit || 'kg',
        yield_per_area: initialData?.yield_per_area || '',
        quality_grade: initialData?.quality_grade || 'A',
        moisture_content: initialData?.moisture_content || '',
        storage_location: initialData?.storage_location || '',
        destination: initialData?.destination || 'stored',
        price_per_unit: initialData?.price_per_unit || '',
        total_revenue: initialData?.total_revenue || '',
        notes: initialData?.notes || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Clean payload (ensure numeric values are stripped of commas)
            const payload = {
                ...formData,
                price_per_unit: stripCommas(formData.price_per_unit),
                total_revenue: stripCommas(formData.total_revenue),
                quantity: stripCommas(formData.quantity),
                area_harvested: stripCommas(formData.area_harvested)
            };

            if (initialData?.id) {
                await updateHarvest(initialData.id, payload);
            } else {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                const isValidId = cropId && uuidRegex.test(cropId);

                if (!isValidId) {
                    console.error('[HarvestForm] Submission blocked - Invalid cropId:', cropId);
                    const uiStore = (await import('../../store/uiStore')).default.getState();
                    uiStore.showAlert('INVALID_CROP');
                    setLoading(false);
                    return;
                }
                await createHarvest(cropId, payload);
            }
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const calculateYield = () => {
        const qty = parseFloat(stripCommas(formData.quantity)) || 0;
        const area = parseFloat(stripCommas(formData.area_harvested)) || 0;
        if (qty && area && area !== 0) {
            const y = (qty / area).toFixed(2);
            setFormData(prev => ({ ...prev, yield_per_area: y }));
        } else {
            setFormData(prev => ({ ...prev, yield_per_area: '0' }));
        }
    };

    const calculateRevenue = () => {
        const qty = parseFloat(stripCommas(formData.quantity)) || 0;
        const price = parseFloat(stripCommas(formData.price_per_unit)) || 0;
        if (qty && price) {
            const r = (qty * price).toFixed(2);
            setFormData(prev => ({ ...prev, total_revenue: r }));
        } else {
            setFormData(prev => ({ ...prev, total_revenue: '0' }));
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '950px', margin: '0 auto', padding: '0' }}>
            <FormHeader
                title="Harvest Operation"
                subtitle={`CROP ID: ${cropId || initialData?.crop_id} | TYPE: YIELD LOGGING`}
                onClose={onComplete}
                icon="🌾"
            />

            <form onSubmit={handleSubmit} style={{ padding: '40px', backgroundColor: '#fcfcfc' }}>
                <div style={{ backgroundColor: '#000', color: '#fff', padding: '12px 20px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '20px' }}>ℹ️</span>
                    <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Harvest data is logged via the operational intelligence ledger for yield auditing.
                    </p>
                </div>

                {/* Section: 01. Harvest Intelligence */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '4px solid #000', paddingBottom: '8px', marginBottom: '24px' }}>
                        01. Harvest Intelligence
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Harvest Date</label>
                            <input
                                type="date"
                                value={formData.harvest_date}
                                onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                                required
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Area Harvested (ha)</label>
                            <input
                                type="text"
                                value={formatValue(formData.area_harvested)}
                                onBlur={calculateYield}
                                onChange={(e) => setFormData({ ...formData, area_harvested: stripCommas(e.target.value) })}
                                required
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Total Quantity</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={formatValue(formData.quantity)}
                                    onBlur={() => { calculateYield(); calculateRevenue(); }}
                                    onChange={(e) => setFormData({ ...formData, quantity: stripCommas(e.target.value) })}
                                    required
                                    style={{ flex: 1, borderRadius: '0', border: '2px solid #ddd', padding: '12px' }}
                                />
                                <select
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    style={{ width: '100px', borderRadius: '0', border: '2px solid #ddd', padding: '12px', fontWeight: '700' }}
                                >
                                    <option value="kg">kg</option>
                                    <option value="tonnes">t</option>
                                    <option value="bushels">bu</option>
                                    <option value="liters">L</option>
                                    <option value="gallons">gal</option>
                                    <option value="bins">bins</option>
                                    <option value="crates">crates</option>
                                    <option value="units">units</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: 02. Quality & Moisture Matrix */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '4px solid #bb1919', paddingBottom: '8px', marginBottom: '24px' }}>
                        02. Quality & Moisture Matrix
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Yield Rate (Unit/ha)</label>
                            <input
                                type="text"
                                value={formatValue(formData.yield_per_area)}
                                readOnly
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px', backgroundColor: '#f0f2f0', fontWeight: '700' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Quality Grade</label>
                            <select
                                value={formData.quality_grade}
                                onChange={(e) => setFormData({ ...formData, quality_grade: e.target.value })}
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px', fontWeight: '700' }}
                            >
                                <option value="A">Grade A (Premium)</option>
                                <option value="B">Grade B (Standard)</option>
                                <option value="C">Grade C (Industrial)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Moisture (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.moisture_content}
                                onChange={(e) => setFormData({ ...formData, moisture_content: e.target.value })}
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Section: 03. Distribution & Revenue Ledger */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '4px solid #000', paddingBottom: '8px', marginBottom: '24px' }}>
                        03. Distribution & Revenue Ledger
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '25px' }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Storage Location</label>
                            <input
                                type="text"
                                placeholder="Siloh 2, Warehouse B"
                                value={formData.storage_location}
                                onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Destination</label>
                            <select
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px', fontWeight: '700' }}
                            >
                                <option value="stored">Standard Storage</option>
                                <option value="sold">Direct Sale</option>
                                <option value="processed">On-farm Processing</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Price per Unit (XAF)</label>
                            <input
                                type="text"
                                value={formatValue(formData.price_per_unit)}
                                onBlur={calculateRevenue}
                                onChange={(e) => setFormData({ ...formData, price_per_unit: stripCommas(e.target.value) })}
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Total Revenue (XAF)</label>
                            <input
                                type="text"
                                value={formatValue(formData.total_revenue)}
                                readOnly
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px', backgroundColor: '#eeeeee', fontWeight: '900' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '40px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Technical Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
                        style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '15px' }}
                        placeholder="Internal yield observations..."
                    />
                </div>

                <div style={{ display: 'flex', gap: '20px', marginTop: '50px' }}>
                    <button type="submit" className="primary" style={{ flex: 2, padding: '20px', borderRadius: '0', backgroundColor: '#000', color: '#fff', fontSize: '14px', fontWeight: '900', border: 'none', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }} disabled={loading}>
                        {loading ? 'SYNCING DATA...' : `💾 ${initialData ? 'UPDATE' : 'COMPLETE'} HARVEST RECORD`}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1, padding: '20px', borderRadius: '0', backgroundColor: '#fff', color: '#000', border: '2px solid #000', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}>
                        DISCARD
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HarvestForm;
