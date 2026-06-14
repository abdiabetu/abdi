import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Save, RefreshCw, CreditCard } from 'lucide-react';

export const Settings = () => {
  const { token, user, tenant, refreshTenant, apiBase } = useAuth();
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tier, setTier] = useState('Free');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTenantDetails = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(`${apiBase}/tenants/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to load tenant configurations');
      }
      const data = await response.json();
      setName(data.name);
      setSlug(data.slug);
      setTier(data.subscriptionTier);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTenantDetails();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name || !slug) {
      setErrorMsg('Please enter an organization name and workspace slug');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/tenants/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          slug,
          subscriptionTier: tier
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      setSuccessMsg('Organization configurations updated successfully');
      await refreshTenant(); // Refresh the token contexts
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isOwner = user?.role === 'Owner';
  const isAdminOrOwner = user?.role === 'Owner' || user?.role === 'Admin';

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '55vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 1rem auto', animation: 'spin 1.5s linear infinite' }} />
          <p>Syncing organization details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Workspace Configuration</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Update tenant branding, profiles, and billing subscription tiers</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        {/* Profile Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--primary)" />
            Profile settings
          </h3>

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--success)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Organization Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={!isAdminOrOwner}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Workspace Domain Slug</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ''))}
                  disabled={!isAdminOrOwner}
                  style={{ flex: 1, borderRadius: '10px 0 0 10px' }}
                />
                <span style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  borderLeft: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '0 10px 10px 0',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem'
                }}>
                  .saascore.com
                </span>
              </div>
            </div>

            {isAdminOrOwner ? (
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitting}
                style={{ width: '100%' }}
              >
                <Save size={16} />
                {submitting ? 'Saving changes...' : 'Save Configurations'}
              </button>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textAlign: 'center'
              }}>
                Only workspace admins/owners can modify these details.
              </div>
            )}
          </form>
        </div>

        {/* Subscription / Plan */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={18} color="var(--accent)" />
            Subscription Plan
          </h3>

          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(217, 70, 239, 0.05))',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem'
          }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 600 }}>
              Current Tier
            </span>
            <h4 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0' }}>
              {tenant?.subscriptionTier || 'Free'}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {tenant?.subscriptionTier === 'Enterprise' ? 'Infinite active seats & raw API query capacity.' :
               tenant?.subscriptionTier === 'Pro' ? 'Up to 25 seats & 100k daily API operations.' :
               'Up to 5 seats & 5k daily API operations.'}
            </p>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label>Upgrade Workspace</label>
            <select
              className="form-select"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              disabled={!isOwner}
              style={{ width: '100%' }}
            >
              <option value="Free">Free Plan ($0/mo)</option>
              <option value="Pro">Pro Plan ($49/mo)</option>
              <option value="Enterprise">Enterprise Plan ($299/mo)</option>
            </select>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {!isOwner ? 'Only organization owners can modify subscription billing.' : 'Upgrades apply immediately.'}
            </span>
          </div>

          {isOwner && (
            <button 
              onClick={handleSubmit} 
              className="btn btn-secondary"
              disabled={submitting || tier === tenant?.subscriptionTier}
              style={{ width: '100%', marginTop: 'auto' }}
            >
              Change Billing Tier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default Settings;
