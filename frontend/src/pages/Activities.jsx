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
    const { showNotification, getConfirmation } = useUIStore();
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
        if (currentFarm?.id) {
            fetchActivitiesByFarm(currentFarm.id);
            fetchFields(currentFarm.id);
            fetchCropsByFarm(currentFarm.id);
            fetchInfrastructure(currentFarm.id);
        }
        // Store functions are stable, using currentFarm.id as trigger
    }, [currentFarm?.id]);

    const handleEdit = (activity) => {
        setEditData(activity);
        setView('edit');
    };

    const handleDelete = async (id) => {
        const template = getConfirmation('DELETE_ACTIVITY');
        const confirmMsg = template
            ? `${template.title}\n----------------------------------\n${template.body}`
            : 'Are you sure you want to delete this activity? This will also update associated costs.';

        if (window.confirm(confirmMsg)) {
            try {
                const response = await deleteActivity(id);
                const msg = response?.notification?.message || 'Activity record deleted successfully.';
                showNotification(msg, 'success');
            } catch (error) {
                const msg = error.response?.data?.notification?.message || 'Failed to remove activity record.';
                showNotification(msg, 'error');
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
            doc.text('FARM JOURNAL', 15, 22);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('FINANCIAL TRANSACTION JOURNAL | OPERATIONAL RECORD', 15, 30);

            // Farm Info
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            const dateStr = new Date().toLocaleDateString();
            doc.text(`FARM / UNIT: ${currentFarm?.name?.toUpperCase()}`, 220, 18);
            doc.text(`LEDGER DATE: ${dateStr}`, 220, 24);
            doc.text(`STATUS: CERTIFIED FINANCIAL RECORD`, 220, 30);

            // Prepared Data for Ledger
            const tableRows = processedActivities.map(activity => {
                const field = fields.find(f => f.id === activity.field_id);
                let fieldDisplayName = field ? field.name : 'General Field';

                if (activity.crop_id) {
                    const crop = crops.find(c => c.id === activity.crop_id);
                    if (crop) fieldDisplayName += ` > 🌱 ${crop.crop_type}`;
                } else if (activity.infrastructure_id) {
                    const infra = infrastructure.find(i => i.id === activity.infrastructure_id);
                    if (infra) fieldDisplayName += ` > 🏢 ${infra.name}`;
                }

                const isInc = activity.transaction_type === 'income' || activity.activity_type === 'harvesting';
                const amtVal = parseFloat(activity.total_cost || activity.labor_cost || 0);
                const amtFormatted = amtVal.toLocaleString();

                return [
                    new Date(activity.activity_date).toLocaleDateString(),
                    fieldDisplayName.toUpperCase(),
                    activity.activity_type.replace(/infra_/g, '').replace(/_/g, ' ').toUpperCase(),
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
                head: [['DATE', 'FIELD', 'OPERATION CATEGORY', 'DESCRIPTION', 'DEBIT (EXPENSE)', 'CREDIT (INCOME)']],
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
                    doc.text('© FARM JOURNAL - PRODUCED BY GLOBAL INTELLIGENCE SYSTEM', 15, 200);
                }
            });

            doc.save(`FarmJournal_${currentFarm?.name}_${new Date().toISOString().split('T')[0]}.pdf`);
            showNotification('Farm Journal Exported Successfully.', 'success');
        } catch (error) {
            console.error('Ledger Error:', error);
            showNotification('Failed to generate Farm Journal.', 'error');
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

            if (sortConfig.key === 'field') {
                const fieldA = fields.find(f => f.id === a.field_id)?.name || 'General Field';
                const fieldB = fields.find(f => f.id === b.field_id)?.name || 'General Field';
                aVal = fieldA;
                bVal = fieldB;
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
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>Farm Journal</h1>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Operational logs and financial transactions registry
                        <span style={{ marginLeft: '10px', fontSize: '10px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>v1.3.2-FIELD-FORM-REFINE</span>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="outline no-print"
                        onClick={handleExportPDF}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <span>📥</span> Export PDF
                    </button>
                    <button className="secondary" onClick={() => setIsBulkModalOpen(true)}>Bulk Log Activities</button>
                    <button className="primary" onClick={() => setView('add')}>+ Log Journal Entry</button>
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
                gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr 1fr',
                gap: '16px',
                marginBottom: '24px',
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                border: '1px solid var(--border)'
            }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search operations, descriptions, types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                >
                    <option value="all">All Transactions</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expenses Only</option>
                </select>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
                >
                    <option value="all">All Categories</option>
                    <option value="crop">Crop Operations</option>
                    <option value="infra">Infrastructure</option>
                    <option value="general">General Field</option>
                </select>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <th onClick={() => handleSort('activity_date')} style={{ padding: '16px 24px', cursor: 'pointer', userSelect: 'none' }}>
                                    DATE <SortIndicator column="activity_date" />
                                </th>
                                <th onClick={() => handleSort('field')} style={{ padding: '16px 24px', cursor: 'pointer', userSelect: 'none' }}>
                                    FIELD <SortIndicator column="field" />
                                </th>
                                <th onClick={() => handleSort('activity_type')} style={{ padding: '16px 24px', cursor: 'pointer', userSelect: 'none' }}>
                                    OPERATION CATEGORY <SortIndicator column="activity_type" />
                                </th>
                                <th style={{ padding: '16px 24px' }}>DESCRIPTION</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right' }}>DEBIT</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right' }}>CREDIT</th>
                                <th style={{ padding: '16px 24px', textAlign: 'center' }} className="no-print">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedActivities.map((activity) => {
                                // Determine Field/Operation Name
                                const field = fields.find(f => f.id === activity.field_id);
                                let fieldDisplayName = field ? field.name : 'General Field';

                                if (activity.crop_id) {
                                    const crop = crops.find(c => c.id === activity.crop_id);
                                    if (crop) fieldDisplayName += ` > 🌱 ${crop.crop_type}`;
                                } else if (activity.infrastructure_id) {
                                    const infra = infrastructure.find(i => i.id === activity.infrastructure_id);
                                    if (infra) fieldDisplayName += ` > 🏢 ${infra.name}`;
                                }

                                const isIncome = activity.transaction_type === 'income' || activity.activity_type === 'harvesting';
                                const amount = activity.total_cost || activity.labor_cost || 0;

                                return (
                                    <tr key={activity.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontWeight: '500' }}>
                                            {new Date(activity.activity_date).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--primary)' }}>
                                            {fieldDisplayName.toUpperCase()}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '12px', fontWeight: '500' }}>
                                                {activity.activity_type.replace(/infra_/g, '').replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {activity.description}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: 'var(--error)' }}>
                                            {!isIncome ? parseFloat(amount).toLocaleString() : ''}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700', color: 'var(--success)' }}>
                                            {isIncome ? parseFloat(amount).toLocaleString() : ''}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'center' }} className="no-print">
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button className="outline" onClick={() => handleEdit(activity)} style={{ padding: '6px 12px', fontSize: '11px' }}>Edit</button>
                                                <button className="outline" onClick={() => handleDelete(activity.id)} style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--error)', borderColor: 'var(--error)' }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {processedActivities.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>No matching operations found</h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>Adjust your filters or search terms to see more results.</p>
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
