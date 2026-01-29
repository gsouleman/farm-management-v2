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

    const cropCategories = {
        "Cereals & Grains": [
            { id: "corn_grain", label: "Corn (Grain)", varieties: ["Pioneer P1197", "DeKalb DKC62-08", "NK N68K", "Croplan 5678", "Channel 211-33"] },
            { id: "corn_silage", label: "Corn (Silage)", varieties: ["Pioneer P0157", "DeKalb DKC55-53", "Preferred Silage Plus"] },
            { id: "wheat_spring", label: "Wheat (Spring)", varieties: ["AAC Brandon", "AAC Viewfield", "AAC Starbuck", "SY Torach"] },
            { id: "wheat_winter", label: "Wheat (Winter)", varieties: ["AAC Wildfire", "AAC Emerson", "SY Sunrise"] },
            { id: "barley", label: "Barley", varieties: ["CDC Copeland", "AAC Synergy", "CDC Austenson", "KWS Fantex"] },
            { id: "oats", label: "Oats", varieties: ["CS Camden", "CDC Arborg", "AAC Douglas"] },
            { id: "sorghum", label: "Sorghum", varieties: ["Pioneer 84G62", "Dekalb DKS28-05", "Check-Mate"] },
            { id: "rice", label: "Rice (Paddy)", varieties: ["IR64", "Basmati 370", "Jasmine 85"] }
        ],
        "Oilseeds": [
            { id: "canola", label: "Canola / Rapeseed", varieties: ["InVigor L233P", "InVigor L340PC", "Nexera 1022 RR", "Pioneer 45H33"] },
            { id: "soybeans", label: "Soybeans", varieties: ["Asgrow AG06X8", "Pioneer P007A32X", "NK S007-Y4", "ProYield 005"] },
            { id: "sunflower", label: "Sunflower", varieties: ["P63ME70", "N4HM354", "Cobalt II"] },
            { id: "flax", label: "Flax / Linseed", varieties: ["CDC Glas", "CDC Bethune"] }
        ],
        "Pulses & Legumes": [
            { id: "peas_yellow", label: "Peas (Yellow)", varieties: ["AAC Carver", "CDC Amarillo", "CDC Spectrum"] },
            { id: "lentils_red", label: "Lentils (Red)", varieties: ["CDC Maxim", "CDC Proclaim"] },
            { id: "chickpeas", label: "Chickpeas (Kabuli)", varieties: ["CDC Leader", "CDC Frontier"] },
            { id: "beans_dry", label: "Beans (Dry/Kidney)", varieties: ["CDC Blackstrap", "AAC Island", "Red Hawk"] },
            { id: "peanuts", label: "Peanuts / Groundnut", varieties: ["Spanish White", "Virginia Jumbo"] }
        ],
        "Roots, Tubers & Bulbs": [
            { id: "potatoes", label: "Potatoes (Table)", varieties: ["Russet Burbank", "Norland", "Yukon Gold", "Ken_nebec"] },
            { id: "potatoes_seed", label: "Potatoes (Seed)", varieties: ["Elite 1", "Elite 2"] },
            { id: "cassava", label: "Cassava / Mani_oc", varieties: ["TME 419", "TMS 30572"] },
            { id: "sweet_potato", label: "Sweet Potato", varieties: ["Beauregard", "Covington"] },
            { id: "onion", label: "Onion", varieties: ["Yellow Spanish", "Red Burgundy"] },
            { id: "garlic", label: "Garlic", varieties: ["Music", "Silverwhite"] }
        ],
        "Fruits & Perennials": [
            { id: "apple", label: "Apple Orchard", varieties: ["Gala", "Honeycrisp", "Fuji"] },
            { id: "grape_wine", label: "Grape (Wine)", varieties: ["Cabernet Sauvignon", "Chardonnay", "Merlot"] },
            { id: "citrus", label: "Citrus (Orange/Lemon)", varieties: ["Valencia", "Eureka"] },
            { id: "banana", label: "Banana / Plantain", varieties: ["Cavendish", "Big Ebanga"] }
        ],
        "Specialty & Industrial": [
            { id: "sugar_beets", label: "Sugar Beets", varieties: ["Betaseed", "Crystal", "Hilleshog"] },
            { id: "sugar_cane", label: "Sugar Cane", varieties: ["CP 89-2143", "L 01-299"] },
            { id: "cotton", label: "Cotton", varieties: ["Deltapine 164 B2XF", "Phytogen 400 W3FE", "Stoneville 4946"] },
            { id: "tobacco", label: "Tobacco", varieties: ["Burley 21", "Virginia Gold"] },
            { id: "hemp", label: "Hemp (Industrial)", varieties: ["Finola", "Katani"] }
        ],
        "Beverages & Spices": [
            { id: "coffee", label: "Coffee (Arabica/Robusta)", varieties: ["SL28", "Catimor", "K7"] },
            { id: "cocoa", label: "Cocoa / Cacao", varieties: ["Forastero", "Criollo", "Trinitario"] },
            { id: "tea", label: "Tea", varieties: ["Assam", "Darjeeling"] },
            { id: "ginger", label: "Ginger", varieties: ["Canton", "Queensland"] },
            { id: "pepper_black", label: "Pepper (Black/White)", varieties: ["Lampong", "Sarawak"] }
        ],
        "Forage & Cover": [
            { id: "alfalfa", label: "Alfalfa", varieties: ["Common Heritage", "AC Bluebird", "Magnum 7"] },
            { id: "clover", label: "Clover (Red/White)", varieties: ["Red Clover", "White Clover"] },
            { id: "timothy", label: "Timothy Grass", varieties: ["Climax", "Richmond"] },
            { id: "cover_mix", label: "Cover Crop Mix", varieties: ["Radish/Rye Mix", "Oat/Pea Mix"] }
        ]
    };

    const currentCropVarieties = Object.values(cropCategories)
        .flat()
        .find(c => c.id === formData.crop_type)?.varieties || [];

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
        <div className="card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div className="card-header" style={{ borderBottomColor: '#edf2f7', padding: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#1a365d' }}>Establish New Cultivation Record</h3>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Crop Type</label>
                        <select
                            value={formData.crop_type}
                            onChange={(e) => setFormData({ ...formData, crop_type: e.target.value, variety: '' })}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        >
                            <option value="">-- Select Crop --</option>
                            {Object.entries(cropCategories).map(([category, items]) => (
                                <optgroup key={category} label={category}>
                                    {items.map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                    ))}
                                </optgroup>
                            ))}
                            <option value="other">Other / Custom</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Variety / Hybrid</label>
                        <input
                            list="variety-presets"
                            type="text"
                            placeholder="Select or enter variety"
                            value={formData.variety}
                            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <datalist id="variety-presets">
                            {currentCropVarieties.map(v => (
                                <option key={v} value={v} />
                            ))}
                        </datalist>
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Crop Year</label>
                        <input
                            type="number"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Season</label>
                        <input
                            type="text"
                            placeholder="e.g. Spring 2026"
                            value={formData.season}
                            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Planting Date</label>
                        <input
                            type="date"
                            value={formData.planting_date}
                            onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Exp. Harvest Date</label>
                        <input
                            type="date"
                            value={formData.expected_harvest_date}
                            onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#f7fafc', marginBottom: '24px', border: '1px solid #edf2f7' }}>
                    <h4 style={{ fontSize: '11px', color: '#2b6cb0', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>PLANTING SPECIFICATIONS</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '12px', color: '#4a5568', marginBottom: '6px', display: 'block' }}>Area (ha/ac)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.planted_area}
                                onChange={(e) => setFormData({ ...formData, planted_area: e.target.value })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: '#4a5568', marginBottom: '6px', display: 'block' }}>Rate (seeds/area)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.planting_rate}
                                onChange={(e) => setFormData({ ...formData, planting_rate: e.target.value })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', color: '#4a5568', marginBottom: '6px', display: 'block' }}>Spacing (cm/in)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.row_spacing}
                                onChange={(e) => setFormData({ ...formData, row_spacing: e.target.value })}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Current Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        >
                            <option value="planted">Recently Planted</option>
                            <option value="growing">Actively Growing</option>
                            <option value="harvested">Harvested / Completed</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Budgeted Cost (XAF)</label>
                        <input
                            type="number"
                            placeholder="e.g. 500000"
                            value={formData.estimated_cost}
                            onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px', display: 'block' }}>Internal Monitoring Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Details about seed quality, depth, or moisture at planting..."
                        rows="3"
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', resize: 'vertical' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="submit" className="primary" style={{ flex: 2, padding: '14px', fontSize: '16px' }} disabled={loading}>
                        {loading ? 'Recording...' : 'Save Cultivation Record'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1, padding: '14px' }}>Discard</button>
                </div>
            </form>
        </div>
    );
};

export default CropForm;
