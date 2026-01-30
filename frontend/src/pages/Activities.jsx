import React, { useState, useEffect, useMemo } from 'react';
import useFarmStore from '../store/farmStore';
import useActivityStore from '../store/activityStore';
import useCropStore from '../store/cropStore';
import useUIStore from '../store/uiStore';
import useInfrastructureStore from '../store/infrastructureStore';
import ActivityForm from '../components/activities/ActivityForm';
import BulkActivityModal from '../components/activities/BulkActivityModal';

const Activities = () => {
    const { currentFarm, fields, fetchFields } = useFarmStore();
    const { activities, fetchActivitiesByFarm, deleteActivity, loading } = useActivityStore();
    const { showNotification } = useUIStore();
    const { crops, fetchCropsByFarm } = useCropStore();
    const { infrastructure, fetchInfrastructure } = useInfrastructureStore();
    const [view, setView] = useState('list'); // list, add, edit
    const [editData, setEditData] = useState(null);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    // Filter & Sort State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, income, expense
    const [filterCategory, setFilterCategory] = useState('all'); // all, crop, infra, general
    const [sortConfig, setSortConfig] = useState({ key: 'activity_date', direction: 'desc' });

    useEffect(() => {
        if (currentFarm) {
            fetchActivitiesByFarm(currentFarm.id);
            fetchFields(currentFarm.id);
            fetchCropsByFarm(currentFarm.id);
            fetchInfrastructure(currentFarm.id);
        }
    }, [currentFarm, fetchActivitiesByFarm, fetchFields, fetchCropsByFarm, fetchInfrastructure]);

    const handleEdit = (activity) => {
        setEditData(activity);
        setView('edit');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this activity? This will also update associated costs.')) {
            try {
                await deleteActivity(id);
                showNotification('Activity record deleted successfully.', 'success');
            } catch (error) {
                showNotification('Failed to remove activity record.', 'error');
            }
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const processedActivities = useMemo(() => {
        let items = [...activities];

        // Filtering
        items = items.filter(activity => {
            const isIncome = activity.transaction_type === 'income' || activity.activity_type === 'harvesting';
            const typeMatch = filterType === 'all' ||
                (filterType === 'income' && isIncome) ||
                (filterType === 'expense' && !isIncome);

            const categoryMatch = filterCategory === 'all' ||
                (filterCategory === 'crop' && activity.crop_id) ||
                (filterCategory === 'infra' && activity.infrastructure_id) ||
                (filterCategory === 'general' && !activity.crop_id && !activity.infrastructure_id);

            const searchLower = searchTerm.toLowerCase();
            const descriptionMatch = activity.description?.toLowerCase().includes(searchLower);

            let operationName = 'General Field';
            if (activity.crop_id) {
                const crop = crops.find(c => c.id === activity.crop_id);
                operationName = crop ? crop.crop_type : 'Crop Operation';
            } else if (activity.infrastructure_id) {
                const infra = infrastructure.find(i => i.id === activity.infrastructure_id);
                operationName = infra ? infra.name : 'Infra Operation';
            }
            const operationMatch = operationName.toLowerCase().includes(searchLower);
            const activityTypeMatch = activity.activity_type.replace('_', ' ').toLowerCase().includes(searchLower);

            return typeMatch && categoryMatch && (descriptionMatch || operationMatch || activityTypeMatch);
        });

        // Sorting
        items.sort((a, b) => {
            let aVal, bVal;

            if (sortConfig.key === 'operation') {
                let aName = 'General Field';
                if (a.crop_id) {
                    const crop = crops.find(c => c.id === a.crop_id);
                    aName = crop ? crop.crop_type : 'Crop Operation';
                } else if (a.infrastructure_id) {
                    const infra = infrastructure.find(i => i.id === a.infrastructure_id);
                    aName = infra ? infra.name : 'Infra Operation';
                }

                let bName = 'General Field';
                if (b.crop_id) {
                    const crop = crops.find(c => c.id === b.crop_id);
                    bName = crop ? crop.crop_type : 'Crop Operation';
                } else if (b.infrastructure_id) {
                    const infra = infrastructure.find(i => i.id === b.infrastructure_id);
                    bName = infra ? infra.name : 'Infra Operation';
                }
                aVal = aName;
                bVal = bName;
            } else if (sortConfig.key === 'amount') {
                aVal = parseFloat(a.total_cost || a.labor_cost || 0);
                bVal = parseFloat(b.total_cost || b.labor_cost || 0);
            } else {
                aVal = a[sortConfig.key];
                bVal = b[sortConfig.key];
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return items;
    }, [activities, searchTerm, filterType, filterCategory, sortConfig, crops, infrastructure]);

    if (view === 'add') return <ActivityForm onComplete={() => setView('list')} />;
    if (view === 'edit') return <ActivityForm initialData={editData} onComplete={() => { setEditData(null); setView('list'); }} />;

    const SortIndicator = ({ column }) => {
        if (sortConfig.key !== column) return <span style={{ opacity: 0.3, marginLeft: '5px' }}>↕</span>;
        return <span style={{ marginLeft: '5px', color: '#1a365d' }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', color: '#1a365d' }}>Field Operations Timeline</h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Historical ledger of activities and financial transactions</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="secondary" onClick={() => setIsBulkModalOpen(true)} style={{ backgroundColor: '#000', color: '#fff', border: 'none' }}>Bulk Log Activities</button>
                    <button className="primary" onClick={() => setView('add')}>+ Add New Activity</button>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr',
                gap: '16px',
                marginBottom: '24px',
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search operations, descriptions, types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 15px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px'
                        }}
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                >
                    <option value="all">All Transactions</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expenses Only</option>
                </select>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                >
                    <option value="all">All Categories</option>
                    <option value="crop">Crop Operations</option>
                    <option value="infra">Infrastructure</option>
                    <option value="general">General Field</option>
                </select>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px', fontWeight: '800' }}>
                                <th onClick={() => handleSort('activity_date')} style={{ padding: '16px', cursor: 'pointer', userSelect: 'none' }}>
                                    DATE <SortIndicator column="activity_date" />
                                </th>
                                <th onClick={() => handleSort('operation')} style={{ padding: '16px', cursor: 'pointer', userSelect: 'none' }}>
                                    OPERATION <SortIndicator column="operation" />
                                </th>
                                <th style={{ padding: '16px' }}>TRANSACTION</th>
                                <th onClick={() => handleSort('activity_type')} style={{ padding: '16px', cursor: 'pointer', userSelect: 'none' }}>
                                    ACTIVITY TYPE <SortIndicator column="activity_type" />
                                </th>
                                <th style={{ padding: '16px' }}>DESCRIPTION</th>
                                <th onClick={() => handleSort('amount')} style={{ padding: '16px', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}>
                                    AMOUNT (XAF) <SortIndicator column="amount" />
                                </th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedActivities.map((activity) => {
                                // Determine Operation Name
                                let operationName = 'General Field';
                                if (activity.crop_id) {
                                    const crop = crops.find(c => c.id === activity.crop_id);
                                    operationName = crop ? `🌱 ${crop.crop_type}` : 'Crop Operation';
                                } else if (activity.infrastructure_id) {
                                    const infra = infrastructure.find(i => i.id === activity.infrastructure_id);
                                    operationName = infra ? `🏢 ${infra.name}` : 'Infra Operation';
                                }

                                const isIncome = activity.transaction_type === 'income' || activity.activity_type === 'harvesting';
                                const amount = activity.total_cost || activity.labor_cost || 0;

                                return (
                                    <tr key={activity.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                                            {new Date(activity.activity_date).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: '700', color: '#1a365d' }}>
                                            {operationName}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                backgroundColor: isIncome ? '#dcfce7' : '#fee2e2',
                                                color: isIncome ? '#166534' : '#991b1b',
                                                textTransform: 'uppercase'
                                            }}>
                                                {isIncome ? 'Income' : 'Expense'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ color: '#4a5568', textTransform: 'capitalize' }}>
                                                {activity.activity_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#718096', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {activity.description}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: '800', color: isIncome ? '#166534' : '#2d3748' }}>
                                            {isIncome ? '+' : '-'}{parseFloat(amount).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button className="outline" onClick={() => handleEdit(activity)} style={{ padding: '4px 8px', fontSize: '11px' }}>Edit</button>
                                                <button className="outline" onClick={() => handleDelete(activity.id)} style={{ padding: '4px 8px', fontSize: '11px', color: '#dc3545', borderColor: '#ffccd1' }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {processedActivities.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                        <h3>No matching operations found</h3>
                        <p>Adjust your filters or search terms to see more results.</p>
                    </div>
                )}
            </div>

            <BulkActivityModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
            />
        </div>
    );
};

export default Activities;
