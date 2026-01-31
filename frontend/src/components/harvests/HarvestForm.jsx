import React, { useState } from 'react';
import useHarvestStore from '../../store/harvestStore';
import useUIStore from '../../store/uiStore';

const HarvestForm = ({ cropId, onComplete }) => {
    const { createHarvest } = useHarvestStore();
    const { showNotification } = useUIStore();
    const [formData, setFormData] = useState({
        harvest_date: new Date().toISOString().split('T')[0],
        area_harvested: '',
        quantity: '',
        unit: 'kg',
        yield_per_area: '',
        quality_grade: 'A',
        moisture_content: '',
        storage_location: '',
        destination: 'stored',
        price_per_unit: '',
        total_revenue: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createHarvest(cropId, formData);
            showNotification('Harvest record archived successfully.', 'success');
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
            const serverMsg = error.response?.data?.message || 'Archiving failure';
            showNotification(`HARVEST LOG FAILURE\n------------------\n${serverMsg}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const calculateYield = () => {
        if (formData.quantity && formData.area_harvested) {
            const y = (parseFloat(formData.quantity) / parseFloat(formData.area_harvested)).toFixed(2);
            setFormData({ ...formData, yield_per_area: y });
        }
    };

    const calculateRevenue = () => {
        if (formData.quantity && formData.price_per_unit) {
            const r = (parseFloat(formData.quantity) * parseFloat(formData.price_per_unit)).toFixed(2);
            setFormData({ ...formData, total_revenue: r });
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '950px', margin: '0 auto', padding: '0', backgroundColor: '#fff', border: '1px solid #000', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            {/* CNN Style Header Banner */}
            <div style={{ backgroundColor: '#bb1919', padding: '24px 40px', color: 'white', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '0', left: '0', height: '100%', width: '4px', backgroundColor: '#000' }}></div>
                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase' }}>
                    <span style={{ backgroundColor: '#fff', color: '#bb1919', padding: '2px 8px', marginRight: '10px' }}>LOG</span>
                    Harvest Operation
                </h1>
                <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <span>CROP ID: {cropId}</span>
                    <span style={{ opacity: 0.6 }}>|</span>
                    <span>TYPE: YIELD LOGGING</span>
                </div>
            </div>

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
                                type="number"
                                step="0.01"
                                value={formData.area_harvested}
                                onBlur={calculateYield}
                                onChange={(e) => setFormData({ ...formData, area_harvested: e.target.value })}
                                required
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Total Quantity</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.quantity}
                                    onBlur={() => { calculateYield(); calculateRevenue(); }}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
                                type="number"
                                value={formData.yield_per_area}
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
                                type="number"
                                value={formData.price_per_unit}
                                onBlur={calculateRevenue}
                                onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                                style={{ width: '100%', borderRadius: '0', border: '2px solid #ddd', padding: '12px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#555', marginBottom: '8px', display: 'block' }}>Total Revenue (XAF)</label>
                            <input
                                type="number"
                                value={formData.total_revenue}
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
                        {loading ? 'ARCHIVING DATA...' : '💾 COMPLETE HARVEST RECORD'}
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
