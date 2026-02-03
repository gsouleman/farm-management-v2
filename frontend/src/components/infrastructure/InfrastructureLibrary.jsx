import React, { useState, useEffect } from 'react';
import useInfrastructureDefinitionStore from '../../store/infrastructureDefinitionStore';

const AVAILABLE_ICONS = [
    '🏠', '🏭', '🏗️', '🚜', '⚙️', '🌉', '🏫', '🏪', '🏨', '🏦', '🏥', '🏢', '🏛️', '🏰', '🏯', '🛖', '🏚️', '⛪', '🕌', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌇', '🌅', '🌌', '🌉', '🌁', '🚢', '⛴️', '🛳️', '🛥️', '🚤', '⛵', '🗺️', '🧭', '🛖', '🛤️', '🛤️', '🛣️', '🚧', '🏗️'
];

const InfrastructureLibrary = () => {
    const { definitions, fetchDefinitions, loading, toggleStatus, createDefinition, updateDefinition, deleteDefinition } = useInfrastructureDefinitionStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', icon: '🏗️', color: '#2196F3', sub_types: '', category: 'General' });

    // Filter available icons
    const usedIcons = new Set(definitions.map(d => d.icon));
    const selectableIcons = AVAILABLE_ICONS.filter(icon => !usedIcons.has(icon) || (editingItem && icon === editingItem.icon));

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
            ? { ...item, sub_types: item.sub_types ? item.sub_types.join(', ') : '' }
            : { name: '', icon: '🏗️', color: '#2196F3', sub_types: '', category: 'General' }
        );
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const payload = {
            ...formData,
            sub_types: formData.sub_types.split(',').map(v => v.trim()).filter(v => v)
        };

        try {
            if (editingItem) {
                await updateDefinition(editingItem.id, payload);
            } else {
                await createDefinition(payload);
            }
            setIsModalOpen(false);
        } catch (error) {
            alert('Failed to save infrastructure definition');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this infrastructure definition?')) {
            await deleteDefinition(id);
        }
    };

    if (loading && definitions.length === 0) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading library...</div>;

    return (
        <div className="card animate-fade-in" style={{ padding: '0', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#fff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px', fontWeight: '700' }}>
                        Infrastructure Master Library
                    </h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {definitions.length} Specialized Asset Types
                    </div>
                </div>
                <div style={{ position: 'relative', width: '250px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', opacity: 0.5 }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search infrastructure..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 36px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: '#f8f9fa',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 80px 120px', backgroundColor: '#f8f9fa', borderBottom: '1px solid var(--border)', padding: '16px 24px', fontWeight: '700', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div>Active</div>
                <div>Asset Details</div>
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
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--border)',
                        alignItems: 'center',
                        backgroundColor: '#fff'
                    }}>
                        <div>
                            <input
                                type="checkbox"
                                checked={def.is_active}
                                onChange={() => toggleStatus(def.id)}
                                style={{ transform: 'scale(1.2)', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>{def.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{def.category}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: def.color, margin: '0 auto', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 0 0 1px var(--border)' }}></div>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '20px' }}>
                            {def.icon}
                        </div>
                        <div style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleOpenModal(def)} style={{ border: '1px solid var(--border)', background: '#fff', color: 'var(--text-secondary)', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }}>✏️</button>
                            <button onClick={() => handleDelete(def.id)} style={{ border: '1px solid var(--border)', background: '#fff', color: 'var(--error)', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '20px 24px', backgroundColor: '#f8f9fa', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                <button
                    onClick={() => handleOpenModal(null)}
                    style={{ backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '600', border: 'none', fontSize: '13px', padding: '10px 20px', cursor: 'pointer', borderRadius: '8px' }}
                >
                    + Add New Infrastructure Type
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>{editingItem ? 'Edit Infrastructure' : 'Add New Infrastructure'}</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Name</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Category</label>
                            <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Icon</label>
                                <select value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}>
                                    {selectableIcons.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Color</label>
                                <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} style={{ width: '100%', height: '38px', padding: '0', border: '1px solid #ccc', borderRadius: '4px' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Sub-types (comma separated)</label>
                            <textarea value={formData.sub_types} onChange={e => setFormData({ ...formData, sub_types: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', height: '80px' }} placeholder="e.g. Type A, Type B" />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleSave} style={{ padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InfrastructureLibrary;
