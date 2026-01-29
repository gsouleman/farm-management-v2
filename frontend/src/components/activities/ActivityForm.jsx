import useInventoryStore from '../../store/inventoryStore';
import useFarmStore from '../../store/farmStore';

const ActivityForm = ({ fieldId, cropId, onComplete }) => {
    const { createActivity } = useActivityStore();
    const { inputs: inventory, fetchInputs } = useInventoryStore();
    const { currentFarm } = useFarmStore();

    const [formData, setFormData] = useState({
        activity_type: 'planting',
        activity_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        duration_hours: '',
        area_covered: '',
        description: '',
        weather_conditions: '',
        temperature: '',
        equipment_used: '',
        labor_cost: '',
        notes: '',
        input_id: '',
        quantity_used: '',
        application_rate: ''
    });
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (currentFarm) {
            fetchInputs(currentFarm.id);
        }
    }, [currentFarm, fetchInputs]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData };

            // Structure inputs array if an item is selected
            if (formData.input_id && formData.quantity_used) {
                const selectedInput = inventory.find(i => i.id === formData.input_id);
                payload.inputs = [{
                    input_id: formData.input_id,
                    quantity_used: formData.quantity_used,
                    unit: selectedInput ? selectedInput.unit : '',
                    application_rate: formData.application_rate
                }];
            } else {
                payload.inputs = [];
            }

            await createActivity(cropId, {
                ...payload,
                field_id: fieldId
            });
            if (onComplete) onComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div className="card-header">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Log Field Operation</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label>Activity Type</label>
                        <select
                            value={formData.activity_type}
                            onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                            required
                        >
                            <option value="planting">Planting</option>
                            <option value="fertilizing">Fertilizing</option>
                            <option value="spraying">Spraying / Protection</option>
                            <option value="irrigation">Irrigation</option>
                            <option value="tillage">Tillage / Cultivation</option>
                            <option value="harvesting">Harvesting</option>
                            <option value="scouting">Scouting / Inspection</option>
                            <option value="pruning">Pruning</option>
                            <option value="thinning">Thinning</option>
                            <option value="mowing">Mowing</option>
                            <option value="mulching">Mulching</option>
                            <option value="soil_sampling">Soil Sampling</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                    <div>
                        <label>Operation Date</label>
                        <input
                            type="date"
                            value={formData.activity_date}
                            onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Area Covered (ha)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.area_covered}
                            onChange={(e) => setFormData({ ...formData, area_covered: e.target.value })}
                        />
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#fcfdfc', marginBottom: '16px', padding: '16px' }}>
                    <h4 style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>TIMING & COST</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: '11px' }}>Start Time</label>
                            <input
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>End Time</label>
                            <input
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>Duration (h)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.duration_hours}
                                onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>Labor Cost (XAF)</label>
                            <input
                                type="number"
                                value={formData.labor_cost}
                                onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#f8f9fa', marginBottom: '20px', padding: '16px' }}>
                    <h4 style={{ fontSize: '12px', color: '#555', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>ENVIRONMENT & ASSETS</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px' }}>
                        <div>
                            <label style={{ fontSize: '11px' }}>Weather Condition</label>
                            <input
                                type="text"
                                placeholder="Sunny, Wind 5km/h"
                                value={formData.weather_conditions}
                                onChange={(e) => setFormData({ ...formData, weather_conditions: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>Temp (°C)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.temperature}
                                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px' }}>Machinery / Equipment</label>
                            <input
                                type="text"
                                placeholder="Tractor Model, Sprayer ID"
                                value={formData.equipment_used}
                                onChange={(e) => setFormData({ ...formData, equipment_used: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#fff8f0', marginBottom: '20px', padding: '16px', border: '1px solid #ffd8a8' }}>
                    <h4 style={{ fontSize: '12px', color: '#e67e22', marginBottom: '12px', borderBottom: '1px solid #ffe8cc', paddingBottom: '6px' }}>APPLICATION OF INPUTS (INVENTORY USAGE)</h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Select an item from your inventory to record its usage in this operation.</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                        <select
                            value={formData.input_id}
                            onChange={(e) => setFormData({ ...formData, input_id: e.target.value })}
                        >
                            <option value="">-- No Inventory Item --</option>
                            {inventory.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({item.brand}) - Stock: {item.quantity_in_stock} {item.unit}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Qty Used"
                            value={formData.quantity_used}
                            onChange={(e) => setFormData({ ...formData, quantity_used: e.target.value })}
                            style={{ fontSize: '12px' }}
                        />
                        <input
                            type="text"
                            placeholder="Rate (kg/ha)"
                            value={formData.application_rate}
                            onChange={(e) => setFormData({ ...formData, application_rate: e.target.value })}
                            style={{ fontSize: '12px' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Technical Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailed log of what was performed..."
                        rows="3"
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Log Operation'}
                    </button>
                    <button type="button" onClick={onComplete} className="outline" style={{ flex: 1 }}>Discard</button>
                </div>
            </form>
        </div>
    );
};

export default ActivityForm;
