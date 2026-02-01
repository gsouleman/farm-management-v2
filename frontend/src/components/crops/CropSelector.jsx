import React, { useState, useEffect } from 'react';
import useCropStore from '../../store/cropStore';
import useFarmStore from '../../store/farmStore';
import useUIStore from '../../store/uiStore';

const CropSelector = ({ onAdd, onEdit }) => {
    const { currentFarm } = useFarmStore();
    const { crops, fetchCropsByFarm, deleteCrop } = useCropStore();
    const { showNotification, getConfirmation } = useUIStore();

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'crop_type', direction: 'asc' });
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'all'
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (currentFarm?.id) {
            fetchCropsByFarm(currentFarm.id);
        }
    }, [currentFarm?.id]);

    // Derived State
    const filteredCrops = crops.filter(crop => {
        const matchesSearch =
            crop.crop_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            crop.variety?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            crop.status.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesView = viewMode === 'active'
            ? ['planted', 'active', 'growing'].includes(crop.status)
            : true;

        return matchesSearch && matchesView;
    });

    const sortedCrops = [...filteredCrops].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedCrops.length / pageSize);
    const paginatedCrops = sortedCrops.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleDelete = async (id, cropName) => {
        if (window.confirm(`Are you sure you want to delete ${cropName}? This will remove all associated records.`)) {
            try {
                await deleteCrop(id);
                showNotification('Crop deleted successfully', 'success');
            } catch (error) {
                showNotification('Delete failed', 'error');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'planted': return { bg: '#e8f5e9', text: '#2e7d32' };
            case 'growing': return { bg: '#e3f2fd', text: '#1565c0' };
            case 'harvested': return { bg: '#fff3e0', text: '#ef6c00' };
            case 'archived': return { bg: '#f5f5f5', text: '#757575' };
            default: return { bg: '#f5f5f5', text: '#000' };
        }
    };

    return (
        <div className="card animate-fade-in" style={{ padding: '0', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            {/* Header: AgTech Modern Theme */}
            <div style={{ backgroundColor: '#fff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px', fontWeight: '700' }}>
                        List of Cultivation
                    </h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {currentFarm?.name || 'All Farms'} • {sortedCrops.length} Records Found
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setViewMode(prev => prev === 'active' ? 'all' : 'active')}
                        className="outline"
                        style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            padding: '8px 16px',
                            borderRadius: '8px'
                        }}
                    >
                        {viewMode === 'active' ? 'Show All History' : 'Show Active Only'}
                    </button>
                    <button
                        onClick={onAdd}
                        className="primary"
                        style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            padding: '8px 20px',
                            borderRadius: '8px',
                            textTransform: 'none'
                        }}
                    >
                        + Create New Cultivation
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ padding: '16px 24px', backgroundColor: '#f8f9fa', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', opacity: 0.5 }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search by crop, variety, or status..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 36px',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Rows:</label>
                    <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            {/* Professional Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--border)' }}>
                            <SortableHeader label="CROP DETAILS" sortKey="crop_type" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="PLANTED / HARVEST" sortKey="planting_date" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="AREA" sortKey="planted_area" sortConfig={sortConfig} onSort={handleSort} width="100px" />
                            <SortableHeader label="STATUS" sortKey="status" sortConfig={sortConfig} onSort={handleSort} width="120px" />
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCrops.map(crop => {
                            const statusStyle = getStatusColor(crop.status);
                            return (
                                <tr key={crop.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.1s' }} className="hover-row">
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px solid var(--border)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                            }}>
                                                🌱
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{crop.crop_type}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                    {crop.variety || 'Unknown Variety'} • {crop.season || crop.year}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{new Date(crop.planting_date).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            {crop.expected_harvest_date ? `Exp: ${new Date(crop.expected_harvest_date).toLocaleDateString()}` : 'No harvest date'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                                        {crop.planted_area ? `${crop.planted_area} ha` : '—'}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            backgroundColor: statusStyle.bg,
                                            color: statusStyle.text,
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {crop.status || 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <ActionButton
                                                icon="👁️"
                                                label="View"
                                                onClick={() => showNotification('View Details functionality coming soon', 'info', { duration: 2000 })}
                                                color="var(--text-secondary)"
                                            />
                                            <ActionButton
                                                icon="✏️"
                                                label="Edit"
                                                onClick={() => onEdit(crop)}
                                                color="var(--primary)"
                                            />
                                            <ActionButton
                                                icon="🗑️"
                                                label="Delete"
                                                onClick={() => handleDelete(crop.id, crop.crop_type)}
                                                color="var(--error)"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {paginatedCrops.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>🌾</div>
                                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>No crops found</h4>
                                    <p style={{ margin: 0, fontSize: '13px' }}>Try adjusting your search filters or add a new crop.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedCrops.length)} of {sortedCrops.length} entries
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="outline"
                            style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                opacity: currentPage === 1 ? 0.5 : 1,
                                cursor: currentPage === 1 ? 'default' : 'pointer'
                            }}
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                style={{
                                    padding: '6px 12px',
                                    border: '1px solid',
                                    borderColor: currentPage === i + 1 ? 'var(--primary)' : 'var(--border)',
                                    backgroundColor: currentPage === i + 1 ? 'var(--primary)' : '#fff',
                                    color: currentPage === i + 1 ? '#fff' : 'var(--text-secondary)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="outline"
                            style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                opacity: currentPage === totalPages ? 0.5 : 1,
                                cursor: currentPage === totalPages ? 'default' : 'pointer'
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SortableHeader = ({ label, sortKey, sortConfig, onSort, width }) => {
    const isActive = sortConfig.key === sortKey;
    return (
        <th
            onClick={() => onSort(sortKey)}
            style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: '700',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                textTransform: 'uppercase',
                cursor: 'pointer',
                userSelect: 'none',
                width: width || 'auto',
                transition: 'color 0.2s'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {label}
                <span style={{ fontSize: '10px', opacity: isActive ? 1 : 0.3 }}>
                    {isActive ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                </span>
            </div>
        </th>
    );
};

const ActionButton = ({ icon, label, onClick, color }) => {
    const isVar = color.startsWith('var');
    return (
        <button
            onClick={onClick}
            title={label}
            className="icon-btn"
            style={{
                border: `1px solid ${isVar ? 'var(--border)' : color + '30'}`,
                backgroundColor: '#fff',
                color: color,
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = isVar ? 'var(--bg-secondary)' : color + '10';
                e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {icon}
        </button>
    );
};

export default CropSelector;
