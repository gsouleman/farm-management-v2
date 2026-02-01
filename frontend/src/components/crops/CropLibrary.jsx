import React, { useState, useEffect } from 'react';
import useCropDefinitionStore from '../../store/cropDefinitionStore';

// Comprehensive list of agricultural emojis
const AVAILABLE_ICONS = [
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🫒', '🥑',
    '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🌾', '🌿', '🍀', '🍬', '🍫',
    '🍯', '🥛', '🍵', '☕', '🥜', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓',
    '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫',
    '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨',
    '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵',
    '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢'
];

const CropLibrary = () => {
    const { definitions, fetchDefinitions, loading, toggleStatus, createDefinition, updateDefinition, deleteDefinition } = useCropDefinitionStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', icon: '🌱', color: '#4caf50', varieties: '' });

    // Filter available icons: explicitly allow the current form's icon if editing
    const usedIcons = new Set(definitions.map(d => d.icon));
    const selectableIcons = AVAILABLE_ICONS.filter(icon => !usedIcons.has(icon) || (editingItem && icon === editingItem.icon));

    // Ensure current icon is in the list (e.g. if it's a custom one not in our preset list)
    if (formData.icon && !selectableIcons.includes(formData.icon)) {
        selectableIcons.unshift(formData.icon);
    }

    useEffect(() => {
        fetchDefinitions();
    }, []);

    const filteredDefinitions = definitions.filter(def =>
        def.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        setFormData(item
            ? { ...item, varieties: item.varieties ? item.varieties.join(', ') : '' }
            : { name: '', icon: '🌱', color: '#4caf50', varieties: '' }
        );
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const payload = {
            ...formData,
            category: 'Custom',
            varieties: formData.varieties.split(',').map(v => v.trim()).filter(v => v)
        };

        try {
            if (editingItem) {
                await updateDefinition(editingItem.id, payload);
            } else {
                await createDefinition(payload);
            }
            setIsModalOpen(false);
        } catch (error) {
            alert('Failed to save crop definition');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this crop definition?')) {
            await deleteDefinition(id);
        }
    };

    if (loading && definitions.length === 0) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading library...</div>;

    return (
        <div className="card animate-fade-in" style={{ padding: '0', border: '1px solid #000', borderRadius: '0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Header: AgriXP Red Theme */}
            <div style={{ backgroundColor: '#bb1919', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        CREATE NEW CROPS
                    </h3>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
                        Master Library • {definitions.length} Available Crops
                    </div>
                </div>
                <div style={{ position: 'relative', width: '250px' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search library..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px 10px 6px 30px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            background: 'rgba(0,0,0,0.2)',
                            color: '#fff',
                            fontSize: '12px',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 80px 120px', backgroundColor: '#fff', borderBottom: '2px solid #000', padding: '14px 20px', fontWeight: '900', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                <div>Active</div>
                <div>Crop Details</div>
                <div style={{ textAlign: 'center' }}>Color</div>
                <div style={{ textAlign: 'center' }}>Icon</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
            </div>

            {/* List */}
            <div style={{ maxHeight: '600px', overflowY: 'auto', backgroundColor: '#fff' }}>
                {filteredDefinitions.map(def => (
                    <div key={def.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr 100px 80px 120px',
                        padding: '12px 20px',
                        borderBottom: '1px solid #eaeaea',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        transition: 'background-color 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                        <div>
                            <input
                                type="checkbox"
                                checked={def.is_active}
                                onChange={() => toggleStatus(def.id)}
                                style={{ transform: 'scale(1.2)', cursor: 'pointer', accentColor: '#bb1919' }}
                            />
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', color: '#2d3748', fontSize: '14px' }}>{def.name}</div>
                            <div style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>{def.category}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '24px', height: '24px', backgroundColor: def.color, margin: '0 auto', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '20px' }}>
                            {def.icon}
                        </div>
                        <div style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => handleOpenModal(def)}
                                title="Edit"
                                style={{
                                    border: '1px solid #2b6cb030', background: '#2b6cb010', color: '#2b6cb0',
                                    width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                ✏️
                            </button>
                            <button
                                onClick={() => handleDelete(def.id)}
                                title="Delete"
                                style={{
                                    border: '1px solid #c5303030', background: '#c5303010', color: '#c53030',
                                    width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', backgroundColor: '#f9f9f9', borderTop: '1px solid #e0e0e0', textAlign: 'right' }}>
                <button
                    onClick={() => handleOpenModal(null)}
                    style={{
                        backgroundColor: '#fff',
                        color: '#bb1919',
                        fontWeight: '800',
                        border: 'none',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>+</span> Add New Crop to Library
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0, color: '#bb1919' }}>{editingItem ? 'Edit Crop' : 'Add New Crop'}</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Crop Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Icon (Emoji)</label>
                                <select
                                    value={formData.icon}
                                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}
                                >
                                    {selectableIcons.map(icon => (
                                        <option key={icon} value={icon}>{icon}</option>
                                    ))}
                                    <option value="🌱">🌱 (Default)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Color</label>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    style={{ width: '100%', height: '38px', padding: '0', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Varieties (comma separated)</label>
                            <textarea
                                value={formData.varieties}
                                onChange={e => setFormData({ ...formData, varieties: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', height: '80px' }}
                                placeholder="e.g. Variety A, Variety B"
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleSave} style={{ padding: '8px 16px', background: '#bb1919', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CropLibrary;
