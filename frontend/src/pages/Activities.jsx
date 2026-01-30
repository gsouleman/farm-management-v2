import React, { useState, useEffect } from 'react';
import useFarmStore from '../store/farmStore';
import useActivityStore from '../store/activityStore';
import useCropStore from '../store/cropStore';
import useInfrastructureStore from '../store/infrastructureStore';
import ActivityForm from '../components/activities/ActivityForm';

const Activities = () => {
    const { currentFarm, fields, fetchFields } = useFarmStore();
    const { activities, fetchActivitiesByFarm, deleteActivity, loading } = useActivityStore();
    const { crops, fetchCropsByFarm } = useCropStore();
    const { infrastructure, fetchInfrastructure } = useInfrastructureStore();
    const [view, setView] = useState('list'); // list, add, edit
    const [editData, setEditData] = useState(null);

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
            } catch (error) {
                alert('Failed to delete activity.');
            }
        }
    };

    if (view === 'add') return <ActivityForm onComplete={() => setView('list')} />;
    if (view === 'edit') return <ActivityForm initialData={editData} onComplete={() => { setEditData(null); setView('list'); }} />;

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', color: '#1a365d' }}>Field Operations Timeline</h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Historical ledger of activities and financial transactions</p>
                </div>
                <button className="primary" onClick={() => setView('add')}>+ Log New Activity</button>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px', fontWeight: '800' }}>
                                <th style={{ padding: '16px' }}>DATE</th>
                                <th style={{ padding: '16px' }}>OPERATION</th>
                                <th style={{ padding: '16px' }}>TRANSACTION</th>
                                <th style={{ padding: '16px' }}>ACTIVITY TYPE</th>
                                <th style={{ padding: '16px' }}>DESCRIPTION</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>AMOUNT (XAF)</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((activity) => {
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

                {activities.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                        <h3>No operations found in historical ledger</h3>
                        <p>Recorded operations will appear here for financial tracking.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Activities;
