import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Settings as SettingsIcon, 
  LogOut,
  Building
} from 'lucide-react';

export const Sidebar = ({ activePage, setActivePage }) => {
  const { tenant, user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'settings', label: 'Organization Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="glass-panel" style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      borderRadius: '0 20px 20px 0',
      borderLeft: 'none',
      borderTop: 'none',
      borderBottom: 'none',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1.5rem',
      zIndex: 100
    }}>
      {/* Brand Logo & Tenant Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px var(--primary-glow)'
        }}>
          <Building size={20} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>SaaS Core</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase' }}>
            {tenant?.name || 'Loading...'}
          </span>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                width: '100%',
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(217, 70, 239, 0.05))' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.95rem',
                textAlign: 'left',
                cursor: 'pointer',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => {
                if(!isActive) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if(!isActive) {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={18} color={isActive ? 'var(--primary)' : 'currentColor'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {user?.name}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
