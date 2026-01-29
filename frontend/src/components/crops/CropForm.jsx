import React, { useState } from 'react';
import useCropStore from '../../store/cropStore';

const CropForm = ({ fieldId, onComplete }) => {
    const { createCrop } = useCropStore();
    const [formData, setFormData] = useState({
        crop_type: '',
        variety: '',
        planting_date: new Date().toISOString().split('T')[0],
        expected_harvest_date: '',
        planted_area: '',
        planting_rate: '',
        row_spacing: '',
        season: '',
        year: new Date().getFullYear(),
        estimated_cost: '',
        status: 'planted',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createCrop(fieldId, formData);
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Establish New Cultivation Record</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label>Crop Type</label>
                        <select
                            value={formData.crop_type}
                            onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                            required
                        >
                            <option value="">-- Select Crop --</option>
                            <optgroup label="Cereals & Grains">
                                <option value="corn">Corn / Maize</option>
                                <option value="wheat">Wheat</option>
                                <option value="rice">Rice</option>
                                <option value="barley">Barley</option>
                                <option value="sorghum">Sorghum</option>
                                <option value="millet">Millet</option>
                                <option value="oats">Oats</option>
                                <option value="rye">Rye</option>
                            </optgroup>
                            <optgroup label="Oilseeds">
                                <option value="soybeans">Soybeans</option>
                                <option value="sunflower">Sunflower</option>
                                <option value="canola">Canola / Rapeseed</option>
                                <option value="peanut">Peanut / Groundnut</option>
                                <option value="flax">Flax</option>
                            </optgroup>
                            <optgroup label="Vegetables">
                                <option value="tomato">Tomato</option>
                                <option value="potato">Potato</option>
                                <option value="onion">Onion</option>
                                <option value="cabbage">Cabbage</option>
                                <option value="carrot">Carrot</option>
                                <option value="lettuce">Lettuce</option>
                                <option value="pepper">Pepper (Bell/Chili)</option>
                                <option value="garlic">Garlic</option>
                            </optgroup>
                            <optgroup label="Fruits & Berries">
                                <option value="apple">Apple</option>
                                <option value="grape">Grape / Vineyard</option>
                                <option value="citrus">Citrus (Orange/Lemon)</option>
                                <option value="banana">Banana</option>
                                <option value="mango">Mango</option>
                                <option value="strawberry">Strawberry</option>
                                <option value="pineapple">Pineapple</option>
                            </optgroup>
                            <optgroup label="Legumes & Pulses">
                                <option value="beans">Beans (Dry/Green)</option>
                                <option value="lentils">Lentils</option>
                                <option value="chickpeas">Chickpeas</option>
                                <option value="peas">Peas</option>
                            </optgroup>
                            <optgroup label="Industrial & Fiber">
                                <option value="cotton">Cotton</option>
                                <option value="sugar_cane">Sugar Cane</option>
                                <option value="sugar_beet">Sugar Beet</option>
                                <option value="hemp">Hemp</option>
                                <option value="tobacco">Tobacco</option>
                                <option value="cocoa">Cocoa / Cacao</option>
                                <option value="coffee">Coffee</option>
                            </optgroup>
                            <optgroup label="Forage & Cover">
                                <option value="alfalfa">Alfalfa</option>
                                <option value="clover">Clover</option>
                                <option value="ryegrass">Ryegrass</option>
                            </optgroup>
                            <option value="other">Other / Custom</option>
                        </select>
                    </div>
                    <div>
                        <label>Variety / Hybrid</label>
                        <input
                            type="text"
                            placeholder="e.g. Pioneer P1197"
                            value={formData.variety}
                            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Crop Year</label>
                        <input
                            type="number"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label>Season</label>
                        <input
                            type="text"
                            placeholder="e.g. Spring 2026"
                            value={formData.season}
                            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Planting Date</label>
                        <input
                            type="date"
                            value={formData.planting_date}
                            onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Exp. Harvest Date</label>
                        <input
                            type="date"
                            value={formData.expected_harvest_date}
                            onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#fcfdfc', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>PLANTING SPECIFICATIONS</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div>
                            <label>Planted Area (ha/ac)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.planted_area}
                                onChange={(e) => setFormData({ ...formData, planted_area: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Rate (seeds/area)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.planting_rate}
                                onChange={(e) => setFormData({ ...formData, planting_rate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Spacing (cm/in)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.row_spacing}
                                onChange={(e) => setFormData({ ...formData, row_spacing: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label>Current Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="planted">Recently Planted</option>
                        <option value="growing">Actively Growing</option>
                        <option value="harvested">Harvested / Completed</option>
                    </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label>Budgeted Production Cost (Estimated XAF)</label>
                    <input
                        type="number"
                        placeholder="e.g. 500000"
                        value={formData.estimated_cost}
                        onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label>Internal Monitoring Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Details about seed quality, depth, or moisture at planting..."
                        rows="3"
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                        {loading ? 'Recording...' : 'Save Cultivation Record'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Discard</button>
                </div>
            </form>
        </div>
    );
};

export default CropForm;
