import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Building, Globe, ArrowRight } from 'lucide-react';

export const Register = ({ onNavigateToLogin }) => {
  const { register, error: authError } = useAuth();
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate slug from name
  const handleTenantNameChange = (val) => {
    setTenantName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setTenantSlug(generatedSlug);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!tenantName || !tenantSlug || !name || !email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (tenantSlug.length < 3) {
      setLocalError('Tenant slug must be at least 3 characters');
      return;
    }

    setSubmitting(true);
    const success = await register(tenantName, tenantSlug, name, email, password);
    setSubmitting(false);

    if (!success) {
      // AuthContext sets error state which we display via authError
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #130f2b 0%, #06050e 100%)',
      padding: '2rem 1.5rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '3rem 2.5rem',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px var(--primary-glow)',
            marginBottom: '1rem'
          }}>
            <Building size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Create Workspace
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Set up your organization and admin account
          </p>
        </div>

        {/* Errors */}
        {(localError || authError) && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            lineHeight: '1.4'
          }}>
            {localError || authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label htmlFor="tenantName">Company / Organization</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} color="rgba(255,255,255,0.4)" style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }} />
                <input
                  id="tenantName"
                  type="text"
                  className="form-input"
                  placeholder="Acme Corp"
                  value={tenantName}
                  onChange={(e) => handleTenantNameChange(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label htmlFor="tenantSlug">Workspace Slug</label>
              <div style={{ position: 'relative' }}>
                <Globe size={16} color="rgba(255,255,255,0.4)" style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }} />
                <input
                  id="tenantSlug"
                  type="text"
                  className="form-input"
                  placeholder="acme"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ''))}
                  style={{ width: '100%', paddingLeft: '2.75rem' }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                URL: {tenantSlug || 'your-slug'}.saascore.com
              </span>
            </div>
          </div>

          <div style={{
            height: '1px',
            background: 'rgba(255,255,255,0.08)',
            margin: '1.25rem 0'
          }} />

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="rgba(255,255,255,0.4)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="rgba(255,255,255,0.4)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="rgba(255,255,255,0.4)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', padding: '0.85rem' }}
          >
            {submitting ? 'Creating Workspace...' : 'Register Workspace'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Login link */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: 'var(--text-muted)'
        }}>
          Already have a workspace?{' '}
          <button
            onClick={onNavigateToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
export default Register;
