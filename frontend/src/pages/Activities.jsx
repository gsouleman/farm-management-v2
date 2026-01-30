import React, { useState, useEffect, useMemo } from 'react';
import useFarmStore from '../store/farmStore';
import useActivityStore from '../store/activityStore';
import useCropStore from '../store/cropStore';
import useUIStore from '../store/uiStore';
import useInfrastructureStore from '../store/infrastructureStore';
import ActivityForm from '../components/activities/ActivityForm';
import BulkActivityModal from '../components/activities/BulkActivityModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF({
                orientation: 'landscape', // Landscape is better for ledger columns
                unit: 'mm',
                format: 'a4'
            });

            const brandRed = [187, 25, 25];
            const brandBlack = [0, 0, 0];
            const ledgerGray = [241, 245, 249];

            // Add Header Banner (Landscape width is 297mm)
            doc.setFillColor(...brandRed);
            doc.rect(0, 0, 297, 40, 'F');
            doc.setFillColor(...brandBlack);
            doc.rect(0, 0, 4, 40, 'F');

            // Header Text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('ACTIVITY & TRANSACTION JOURNAL', 15, 22);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('FINANCIAL TRANSACTION JOURNAL | OPERATIONAL RECORD', 15, 30);

            // Farm Info
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            const dateStr = new Date().toLocaleDateString();
            doc.text(`STATION / UNIT: ${currentFarm?.name?.toUpperCase()}`, 220, 18);
            doc.text(`LEDGER DATE: ${dateStr}`, 220, 24);
            doc.text(`STATUS: CERTIFIED FINANCIAL RECORD`, 220, 30);

            // Prepared Data for Ledger
            const tableRows = processedActivities.map(activity => {
                let opName = 'General Field';
                if (activity.crop_id) {
                    const crop = crops.find(c => c.id === activity.crop_id);
                    opName = crop ? crop.crop_type : 'Crop Op';
                } else if (activity.infrastructure_id) {
                    const infra = infrastructure.find(i => i.id === activity.infrastructure_id);
                    opName = infra ? infra.name : 'Infra Op';
                }

                const isInc = activity.transaction_type === 'income' || activity.activity_type === 'harvesting';
                const amtVal = parseFloat(activity.total_cost || activity.labor_cost || 0);
                const amtFormatted = amtVal.toLocaleString();

                return [
                    new Date(activity.activity_date).toLocaleDateString(),
                    opName.toUpperCase(),
                    activity.activity_type.replace('_', ' ').toUpperCase(),
                    activity.description || 'No description',
                    !isInc ? `${amtFormatted}` : '', // Debit (Expense)
                    isInc ? `${amtFormatted}` : ''   // Credit (Income)
                ];
            });

            // Calculate Totals
            const totalDebit = processedActivities.reduce((acc, act) => {
                const isInc = act.transaction_type === 'income' || act.activity_type === 'harvesting';
                return acc + (!isInc ? parseFloat(act.total_cost || act.labor_cost || 0) : 0);
            }, 0);

            const totalCredit = processedActivities.reduce((acc, act) => {
                const isInc = act.transaction_type === 'income' || act.activity_type === 'harvesting';
                return acc + (isInc ? parseFloat(act.total_cost || act.labor_cost || 0) : 0);
            }, 0);

            // Add Table
            autoTable(doc, {
                startY: 50,
                head: [['DATE', 'REF / OPERATION', 'ACCOUNT / TYPE', 'DESCRIPTION', 'DEBIT (EXPENSE)', 'CREDIT (INCOME)']],
                body: [...tableRows, [
                    '', '', '', 'TOTALS (XAF)', totalDebit.toLocaleString(), totalCredit.toLocaleString()
                ]],
                theme: 'striped',
                headStyles: {
                    fillColor: brandBlack,
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: 'bold',
                    cellPadding: 5
                },
                bodyStyles: {
                    fontSize: 8,
                    textColor: [40, 40, 40],
                    cellPadding: 4,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1
                },
                columnStyles: {
                    4: { halign: 'right', fontStyle: 'bold' },
                    5: { halign: 'right', fontStyle: 'bold' }
                },
                alternateRowStyles: {
                    fillColor: ledgerGray
                },
                margin: { top: 50, left: 15, right: 15 },
                didParseCell: (data) => {
                    // Highlight totals row
                    if (data.row.index === tableRows.length) {
                        data.cell.styles.fillColor = brandRed;
                        data.cell.styles.textColor = [255, 255, 255];
                        data.cell.styles.fontStyle = 'bold';
                    }
                },
                didDrawPage: (data) => {
                    // Footer
                    const str = 'Page ' + doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text(str, 275, 200);
                    doc.text('© ACTIVITY & TRANSACTION JOURNAL - PRODUCED BY GLOBAL INTELLIGENCE SYSTEM', 15, 200);
                }
            });

            doc.save(`ActivityJournal_${currentFarm?.name}_${new Date().toISOString().split('T')[0]}.pdf`);
            showNotification('Journal Exported Successfully.', 'success');
        } catch (error) {
            console.error('Ledger Error:', error);
            showNotification('Failed to generate journal report.', 'error');
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
                    <h1 style={{ margin: 0, fontSize: '28px', color: '#1a365d' }}>Activity & Transaction Journal</h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Operational logs and financial transactions registry</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="outline no-print"
                        onClick={handleExportPDF}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <span>📥</span> Export PDF
                    </button>
                    <button className="secondary" onClick={() => setIsBulkModalOpen(true)} style={{ backgroundColor: '#000', color: '#fff', border: 'none' }}>Bulk Log Activities</button>
                    <button className="primary" onClick={() => setView('add')}>+ Log Transaction/Activity</button>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white !important; }
                        .card { box-shadow: none !important; border: 1px solid #eee !important; }
                        .animate-fade-in { animation: none !important; }
                        table { width: 100% !important; border-collapse: collapse !important; }
                        th, td { border: 1px solid #eee !important; padding: 12px !important; }
                        header, nav, .filter-bar { display: none !important; }
                    }
                `}
            </style>

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
                                    REF / OPERATION <SortIndicator column="operation" />
                                </th>
                                <th onClick={() => handleSort('activity_type')} style={{ padding: '16px', cursor: 'pointer', userSelect: 'none' }}>
                                    ACCOUNT / TYPE <SortIndicator column="activity_type" />
                                </th>
                                <th style={{ padding: '16px' }}>DESCRIPTION</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>DEBIT</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>CREDIT</th>
                                <th style={{ padding: '16px', textAlign: 'center' }} className="no-print">ACTION</th>
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
                                            {operationName.toUpperCase()}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ color: '#4a5568', textTransform: 'uppercase', fontSize: '12px' }}>
                                                {activity.activity_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#718096', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {activity.description}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: '800', color: '#991b1b' }}>
                                            {!isIncome ? parseFloat(amount).toLocaleString() : ''}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: '800', color: '#166534' }}>
                                            {isIncome ? parseFloat(amount).toLocaleString() : ''}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }} className="no-print">
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
