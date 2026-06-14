import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Cpu, 
  Users, 
  HardDrive, 
  Activity,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

export const Dashboard = () => {
  const { token, apiBase } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [metricsRes, logsRes] = await Promise.all([
        fetch(`${apiBase}/metrics`, { headers }),
        fetch(`${apiBase}/metrics/logs`, { headers })
      ]);

      if (!metricsRes.ok || !logsRes.ok) {
        throw new Error('Failed to retrieve analytics data');
      }

      const metricsData = await metricsRes.json();
      const logsData = await logsRes.json();

      setMetrics(metricsData);
      setLogs(logsData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto', animation: 'spin 1.5s linear infinite' }} />
          <p>Analyzing tenant workspace...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Get current metrics (last entry)
  const currentMetric = metrics.length > 0 ? metrics[metrics.length - 1] : { apiCalls: 0, activeUsers: 0, storageUsed: 0 };
  const totalApiCalls = metrics.reduce((acc, curr) => acc + curr.apiCalls, 0);

  // SVG Chart Dimensions & Computations
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = 35;

  const getChartPoints = () => {
    if (metrics.length === 0) return '';
    const maxVal = Math.max(...metrics.map(m => m.apiCalls), 1000);
    const minVal = Math.min(...metrics.map(m => m.apiCalls), 0);
    const range = maxVal - minVal;

    return metrics.map((m, idx) => {
      const x = padding + (idx / (metrics.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - ((m.apiCalls - minVal) / range) * (chartHeight - padding * 2);
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Workspace Insights</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active monitoring stats for your resources</p>
        </div>
        <button 
          onClick={() => fetchData(true)} 
          className="btn btn-secondary" 
          disabled={refreshing}
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} style={{ animation: refreshing ? 'spin 1.5s linear infinite' : 'none' }} />
          Sync Data
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--danger)',
          padding: '1rem',
          borderRadius: '12px'
        }}>
          Error syncing dashboard stats: {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* KPI 1 */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>API Ingress</span>
            <div style={{ background: 'rgba(139, 92, 246, 0.12)', padding: '0.5rem', borderRadius: '8px' }}>
              <Cpu size={18} color="var(--primary)" />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{currentMetric.apiCalls.toLocaleString()}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
            <ArrowUpRight size={12} />
            +18.4% from yesterday
          </p>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Seats</span>
            <div style={{ background: 'rgba(217, 70, 239, 0.12)', padding: '0.5rem', borderRadius: '8px' }}>
              <Users size={18} color="var(--accent)" />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{currentMetric.activeUsers}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Active connections today
          </p>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Cloud Storage</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '0.5rem', borderRadius: '8px' }}>
              <HardDrive size={18} color="var(--success)" />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{currentMetric.storageUsed} MB</h3>
          <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((currentMetric.storageUsed / 100) * 100, 100)}%`, background: 'var(--success)', height: '100%' }} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>SLA Status</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.12)', padding: '0.5rem', borderRadius: '8px' }}>
              <Activity size={18} color="var(--warning)" />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>99.98%</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.5rem' }}>
            All systems nominal
          </p>
        </div>
      </div>

      {/* Main Charts & History section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem'
      }}>
        {/* SVG Usage Chart */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>API Traffic Volume</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Usage curve over the last 7 intervals</p>
          </div>

          <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: '200px' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
              {/* Gridlines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.05)" />
              <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.05)" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.1)" />

              {/* Data curve line */}
              {metrics.length > 1 && (
                <>
                  <polyline
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={getChartPoints()}
                  />
                  {/* Glowing line shadow */}
                  <polyline
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="10"
                    opacity="0.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={getChartPoints()}
                  />
                </>
              )}

              {/* Data points */}
              {metrics.map((m, idx) => {
                const maxVal = Math.max(...metrics.map(x => x.apiCalls), 1000);
                const minVal = Math.min(...metrics.map(x => x.apiCalls), 0);
                const range = maxVal - minVal;
                const x = padding + (idx / (metrics.length - 1)) * (chartWidth - padding * 2);
                const y = chartHeight - padding - ((m.apiCalls - minVal) / range) * (chartHeight - padding * 2);

                return (
                  <g key={idx} className="chart-node" style={{ cursor: 'pointer' }}>
                    <circle cx={x} cy={y} r="5" fill="var(--bg-dark)" stroke="var(--primary)" strokeWidth="2.5" />
                    <circle cx={x} cy={y} r="8" fill="var(--primary)" opacity="0" style={{ transition: 'var(--transition-smooth)' }} />
                  </g>
                );
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--accent)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '1rem',
            padding: '0 5px'
          }}>
            {metrics.map((m, idx) => {
              const date = new Date(m.recordedAt);
              const dayStr = date.toLocaleDateString(undefined, { weekday: 'short' });
              return <span key={idx}>{dayStr}</span>;
            })}
          </div>
        </div>

        {/* Recent Audit Log */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', maxHeight: '380px' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Activity Log</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recent compliance audit events</p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {logs.map((log) => {
              const timeStr = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
              
              return (
                <div key={log._id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: log.action.includes('Created') || log.action.includes('Invited') ? 'var(--primary)' : 'var(--accent)',
                    marginTop: '6px'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{log.action}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeStr}, {dateStr}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {log.details}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', display: 'inline-block', marginTop: '2px' }}>
                      By {log.userName}
                    </span>
                  </div>
                </div>
              );
            })}
            {logs.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
                No events logged yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
