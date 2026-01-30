import React, { useEffect, useState } from 'react';
import useFarmStore from '../store/farmStore';
import useUserStore from '../store/userStore';
import useUIStore from '../store/uiStore';

const TeamManagement = () => {
    const { currentFarm } = useFarmStore();
    const { teamMembers, fetchTeamMembers, inviteUser, removeMember, loading } = useUserStore();
    const { showNotification } = useUIStore();
    const [inviteData, setInviteData] = useState({ email: '', role: 'employee' });
    const [showInviteModal, setShowInviteModal] = useState(false);

    useEffect(() => {
        if (currentFarm) {
            fetchTeamMembers(currentFarm.id);
        }
    }, [currentFarm, fetchTeamMembers]);

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await inviteUser(currentFarm.id, inviteData);
            showNotification(`Invitation sent to ${inviteData.email} successfully.`, 'success');
            setInviteData({ email: '', role: 'employee' });
            setShowInviteModal(false);
        } catch (error) {
            showNotification('Failed to send invitation. Please verify the email address.', 'error');
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '24px' }}>
            <div className="flex j-between a-center" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Team & Collaborators</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage farm access for advisors, managers, and staff.</p>
                </div>
                <button className="primary" onClick={() => setShowInviteModal(true)}>+ Invite Member</button>
            </div>

            {showInviteModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', margin: 0 }}>
                        <div className="card-header">
                            <h3 style={{ margin: 0, fontSize: '18px' }}>Send Invitation</h3>
                        </div>
                        <form onSubmit={handleInvite}>
                            <div style={{ marginBottom: '16px' }}>
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                    placeholder="colleague@email.com"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label>Assigned Role</label>
                                <select
                                    value={inviteData.role}
                                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                                >
                                    <option value="manager">Farm Manager</option>
                                    <option value="advisor">Crop Advisor</option>
                                    <option value="employee">Field Employee</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" className="primary" style={{ flex: 1 }}>Send Invite</button>
                                <button type="button" className="outline" style={{ flex: 1 }} onClick={() => setShowInviteModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '16px' }}>Collaborator</th>
                            <th style={{ padding: '16px' }}>Role</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px' }}>Joined At</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamMembers.map(member => (
                            <tr key={member.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: '600' }}>{member.user?.first_name} {member.user?.last_name || member.email}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.email}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold', color: 'var(--secondary)' }}>{member.role}</span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        backgroundColor: member.status === 'accepted' ? '#e6f4ea' : '#fff8e1',
                                        color: member.status === 'accepted' ? '#1e7e34' : '#b78103'
                                    }}>
                                        {member.status?.toUpperCase() || 'PENDING'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{member.joined_at || '—'}</td>
                                <td style={{ padding: '16px' }}>
                                    <button
                                        className="outline"
                                        style={{ fontSize: '11px', color: 'var(--error)', borderColor: '#ffcdd2' }}
                                        onClick={() => { if (confirm('Remove this member?')) removeMember(member.id); }}
                                    >Revoke Access</button>
                                </td>
                            </tr>
                        ))}
                        {teamMembers.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No collaborators yet. Start by inviting your team!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamManagement;
