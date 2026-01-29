import React, { useState } from 'react';
import useHarvestStore from '../../store/harvestStore';

const HarvestForm = ({ cropId, onComplete }) => {
    const { createHarvest } = useHarvestStore();
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
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
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
        <div className="card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Record Crop Harvest</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <label>Harvest Date</label>
                        <input
                            type="date"
                            value={formData.harvest_date}
                            onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Area Harvested (ha)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.area_harvested}
                            onBlur={calculateYield}
                            onChange={(e) => setFormData({ ...formData, area_harvested: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Total Quantity</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onBlur={() => { calculateYield(); calculateRevenue(); }}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                required
                            />
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                style={{ width: '80px' }}
                            >
                                <option value="kg">kg</option>
                                <option value="tonnes">t</option>
                                <option value="bushels">bu</option>
                                <option value="liters">L</option>
                                <option value="gallons">gal</option>
                                <option value="bins">bins</option>
                                <option value="crates">crates</option>
                                <option value="units">units (count)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#fcfdfc', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>QUALITY & ANALYTICS</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '11px' }}>Yield Rate (Unit/ha)</label>
                            <input
                                type="number"
                                value={formData.yield_per_area}
                                readOnly
                                style={{ backgroundColor: '#f0f2f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>Quality Grade</label>
                            <select
                                value={formData.quality_grade}
                                onChange={(e) => setFormData({ ...formData, quality_grade: e.target.value })}
                            >
                                <option value="A">Grade A (Premium)</option>
                                <option value="B">Grade B (Standard)</option>
                                <option value="C">Grade C (Industrial)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>Moisture (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.moisture_content}
                                onChange={(e) => setFormData({ ...formData, moisture_content: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '12px', color: '#555', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>DISTRIBUTION & REVENUE</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ fontSize: '11px' }}>Storage Location</label>
                            <input
                                type="text"
                                placeholder="Siloh 2, Warehouse B"
                                value={formData.storage_location}
                                onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>Destination</label>
                            <select
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            >
                                <option value="stored">Standard Storage</option>
                                <option value="sold">Direct Sale</option>
                                <option value="processed">On-farm Processing</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '11px' }}>Price per Unit (XAF)</label>
                            <input
                                type="number"
                                value={formData.price_per_unit}
                                onBlur={calculateRevenue}
                                onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>Total Revenue (XAF)</label>
                            <input
                                type="number"
                                value={formData.total_revenue}
                                readOnly
                                style={{ backgroundColor: '#eeeeee' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label>Harvest Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                        {loading ? 'Finalizing...' : 'Complete Harvest Record'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Discard</button>
                </div>
            </form>
        </div>
    );
};

export default HarvestForm;
