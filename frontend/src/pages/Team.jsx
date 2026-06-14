import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Trash2, ShieldAlert, Check, X, RefreshCw } from 'lucide-react';

export const Team = () => {
  const { token, user: currentUser, apiBase } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states for invitation
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteError, setInviteError] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to retrieve organization members');
      }
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMembers();
    }
  }, [token]);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteError('');

    if (!inviteName || !inviteEmail || !invitePassword || !inviteRole) {
      setInviteError('Please fill in all fields');
      return;
    }

    setInviting(true);
    try {
      const response = await fetch(`${apiBase}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          password: invitePassword,
          role: inviteRole
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invitation failed');
      }

      // Close modal & reset fields
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
      setInvitePassword('');
      setInviteRole('Member');
      
      // Refresh list
      fetchMembers();
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;

    try {
      const response = await fetch(`${apiBase}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Delete operation failed');
      }

      fetchMembers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const isAuthorizedToEdit = currentUser.role === 'Owner' || currentUser.role === 'Admin';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Team Directory</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage user settings and invitation statuses</p>
        </div>
        {isAuthorizedToEdit && (
          <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
            <UserPlus size={16} />
            Invite Member
          </button>
        )}
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--danger)',
          padding: '1rem',
          borderRadius: '12px'
        }}>
          Error syncing directory: {error}
        </div>
      )}

      {/* Team table */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 1rem auto', animation: 'spin 1.5s linear infinite' }} />
            <p>Syncing directory records...</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Workspace Role</th>
                <th>Account Status</th>
                {isAuthorizedToEdit && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id}>
                  <td style={{ fontWeight: 600 }}>{member.name} {member._id === currentUser.id && '(You)'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{member.email}</td>
                  <td>
                    <span className={`badge ${
                      member.role === 'Owner' ? 'badge-success' : member.role === 'Admin' ? 'badge-primary' : 'badge-warning'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-success" style={{
                      background: member.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                      color: member.status === 'Active' ? 'var(--success)' : 'var(--text-muted)'
                    }}>
                      {member.status}
                    </span>
                  </td>
                  {isAuthorizedToEdit && (
                    <td style={{ textAlign: 'right' }}>
                      {member._id !== currentUser.id && member.role !== 'Owner' && (
                        <button
                          onClick={() => handleDeleteMember(member._id)}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.6rem', borderRadius: '6px' }}
                          title="Remove user"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={isAuthorizedToEdit ? 5 : 4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No organization members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Modal dialog */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: '100%',
            maxWidth: '450px',
            padding: '2.5rem',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Invite Team Member</h3>
              <button 
                onClick={() => setShowInviteModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {inviteError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--danger)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                {inviteError}
              </div>
            )}

            <form onSubmit={handleInviteSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Jane Smith"
                  value={inviteName} 
                  onChange={(e) => setInviteName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="jane@company.com"
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Temporary Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={invitePassword} 
                  onChange={(e) => setInvitePassword(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label>Workspace Role</label>
                <select 
                  className="form-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Member">Member (Read/Write resources)</option>
                  <option value="Admin">Admin (Manage users & configuration)</option>
                  {currentUser.role === 'Owner' && <option value="Owner">Owner (Full authority)</option>}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowInviteModal(false)} 
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={inviting}
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  {inviting ? 'Sending Invite...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Team;
