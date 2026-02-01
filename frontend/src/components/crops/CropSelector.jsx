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
        <div className="card animate-fade-in" style={{ padding: '0', border: '1px solid #000', borderRadius: '0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {/* Header: AgriXP Red Theme */}
            <div style={{ backgroundColor: '#bb1919', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        LIST OF CULTIVATION
                    </h3>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
                        {currentFarm?.name || 'All Farms'} • {sortedCrops.length} Records Found
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setViewMode(prev => prev === 'active' ? 'all' : 'active')}
                        style={{
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                        }}
                    >
                        {viewMode === 'active' ? 'Show All History' : 'Show Active Only'}
                    </button>
                    <button
                        onClick={onAdd}
                        style={{
                            background: '#fff',
                            color: '#bb1919',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '6px 16px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        + CREATE NEW CULTIVATION
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search by crop, variety, or status..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 36px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '13px',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Rows:</label>
                    <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        style={{ padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
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
                        <tr style={{ backgroundColor: '#fff', borderBottom: '2px solid #000' }}>
                            <SortableHeader label="CROP DETAILS" sortKey="crop_type" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="PLANTED / HARVEST" sortKey="planting_date" sortConfig={sortConfig} onSort={handleSort} />
                            <SortableHeader label="AREA" sortKey="planted_area" sortConfig={sortConfig} onSort={handleSort} width="100px" />
                            <SortableHeader label="STATUS" sortKey="status" sortConfig={sortConfig} onSort={handleSort} width="120px" />
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '900', color: '#666', textTransform: 'uppercase' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCrops.map(crop => {
                            const statusStyle = getStatusColor(crop.status);
                            return (
                                <tr key={crop.id} style={{ borderBottom: '1px solid #eaeaea', transition: 'background-color 0.2s' }} className="hover-row">
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%', backgroundColor: statusStyle.bg,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: `1px solid ${statusStyle.bg}`
                                            }}>
                                                🌱
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#2d3748' }}>{crop.crop_type}</div>
                                                <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                                                    {crop.variety || 'Unknown Variety'} • {crop.season || crop.year}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#4a5568' }}>
                                        <div style={{ fontWeight: '600' }}>{new Date(crop.planting_date).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                                            {crop.expected_harvest_date ? `Exp: ${new Date(crop.expected_harvest_date).toLocaleDateString()}` : 'No harvest date'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: '#2b6cb0' }}>
                                        {crop.planted_area ? `${crop.planted_area} ha` : '—'}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            backgroundColor: statusStyle.bg,
                                            color: statusStyle.text,
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {crop.status || 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <ActionButton
                                                icon="👁️"
                                                label="View"
                                                onClick={() => showNotification('View Details functionality coming soon', 'info', { duration: 2000 })}
                                                color="#4a5568"
                                            />
                                            <ActionButton
                                                icon="✏️"
                                                label="Edit"
                                                onClick={() => onEdit(crop)}
                                                color="#2b6cb0"
                                            />
                                            <ActionButton
                                                icon="🗑️"
                                                label="Delete"
                                                onClick={() => handleDelete(crop.id, crop.crop_type)}
                                                color="#c53030"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {paginatedCrops.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '60px 20px', color: '#a0aec0' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.5 }}>🌾</div>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#4a5568' }}>No crops found</h4>
                                    <p style={{ margin: 0, fontSize: '13px' }}>Try adjusting your search filters or add a new crop.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
                <div style={{ padding: '16px 24px', borderTop: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500' }}>
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedCrops.length)} of {sortedCrops.length} entries
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            style={{
                                padding: '6px 12px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: currentPage === 1 ? '#f7fafc' : '#fff',
                                color: currentPage === 1 ? '#cbd5e0' : '#4a5568',
                                borderRadius: '4px',
                                cursor: currentPage === 1 ? 'default' : 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
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
                                    borderColor: currentPage === i + 1 ? '#bb1919' : '#e2e8f0',
                                    backgroundColor: currentPage === i + 1 ? '#bb1919' : '#fff',
                                    color: currentPage === i + 1 ? '#fff' : '#4a5568',
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
                            style={{
                                padding: '6px 12px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: currentPage === totalPages ? '#f7fafc' : '#fff',
                                color: currentPage === totalPages ? '#cbd5e0' : '#4a5568',
                                borderRadius: '4px',
                                cursor: currentPage === totalPages ? 'default' : 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
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
                padding: '14px 20px',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: '900',
                color: isActive ? '#000' : '#666',
                textTransform: 'uppercase',
                cursor: 'pointer',
                userSelect: 'none',
                width: width || 'auto'
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

const ActionButton = ({ icon, label, onClick, color }) => (
    <button
        onClick={onClick}
        title={label}
        style={{
            border: `1px solid ${color}30`,
            backgroundColor: `${color}10`,
            color: color,
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
        }}
        onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = color;
            e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = `${color}10`;
            e.currentTarget.style.color = color;
        }}
    >
        {icon}
    </button>
);

export default CropSelector;
