import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Globe, ShieldAlert } from 'lucide-react';

export const Header = ({ activePage }) => {
  const { tenant } = useAuth();

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'System Overview';
      case 'team':
        return 'Team Management';
      case 'settings':
        return 'Organization Settings';
      default:
        return 'Dashboard';
    }
  };

  const getBadgeClass = () => {
    switch (tenant?.subscriptionTier) {
      case 'Enterprise':
        return 'badge-success';
      case 'Pro':
        return 'badge-primary';
      default:
        return 'badge-warning';
    }
  };

  return (
    <header className="glass-panel" style={{
      padding: '1.25rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: 'none',
      borderRadius: '16px'
    }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
          {getPageTitle()}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Managing resources and tenants in real-time
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Domain status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '0.5rem 1rem',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <Globe size={14} color="var(--primary)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {tenant?.slug}.saascore.com
          </span>
        </div>

        {/* Subscription Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${getBadgeClass()}`} style={{ letterSpacing: '0.5px' }}>
            {tenant?.subscriptionTier || 'Free'} Tier
          </span>
        </div>
      </div>
    </header>
  );
};
