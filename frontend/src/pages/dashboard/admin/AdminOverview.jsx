import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api';

const IC = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const STAT_CARDS = [
  { key: 'users',         label: 'Total Users',    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75', color: '#1B3A6B', bg: '#eff6ff',  border: '#bfdbfe' },
  { key: 'universities',  label: 'Universities',   icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',                                                                   color: '#15803d', bg: '#f0fdf4',  border: '#bbf7d0' },
  { key: 'opportunities', label: 'Opportunities',  icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',                               color: '#F47B20', bg: '#fff7ed',  border: '#fed7aa' },
  { key: 'threads',       label: 'Forum Threads',  icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',                                                                    color: '#7c3aed', bg: '#faf5ff',  border: '#e9d5ff' },
];

const PENDING_CARDS = [
  { key: 'pendingUnis',    label: 'Pending Universities', link: '/admin/universities?published=false', color: '#d97706', bg: '#fefce8', border: '#fef08a' },
  { key: 'pendingOrganizations', label: 'Pending Organizations', link: '/admin/users?role=organization', color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
];

const QUICK_LINKS = [
  { to: '/admin/users',         label: 'Manage Users',        icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z', color: '#1B3A6B' },
  { to: '/admin/universities',  label: 'Manage Universities',  icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',                            color: '#15803d' },
  { to: '/admin/majors',        label: 'Manage Majors',       icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 17A2.5 2.5 0 0 0 4 14.5V5a2 2 0 0 1 2-2h14v13.5 M6.5 17H20', color: '#4AAEE0' },
  { to: '/admin/opportunities', label: 'Manage Opportunities', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', color: '#F47B20' },
  { to: '/admin/forum',         label: 'Moderate Forum',       icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',                color: '#7c3aed' },
];

export default function AdminOverview() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(r => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const S = (key) => loading ? '—' : (stats?.[key] ?? 0);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', fontFamily: "'Syne',sans-serif" }}>Admin Dashboard</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Platform overview and quick actions</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {STAT_CARDS.map(card => (
          <div key={card.key} style={{ padding: '20px 18px', borderRadius: 14, background: card.bg, border: `1px solid ${card.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: `1px solid ${card.border}` }}>
              <IC d={card.icon} size={16} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: card.color, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{S(card.key)}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* User breakdown + pending */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>

        {/* User breakdown */}
        <div style={{ padding: '20px', borderRadius: 14, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>User Breakdown</h3>
          {[
            { label: 'Students',          key: 'students', color: '#1B3A6B' },
            { label: 'University Owners', key: 'owners',   color: '#15803d' },
            { label: 'Organizations',     key: 'organizations', color: '#0f766e' },
            { label: 'Admins',            key: 'admins',   color: '#F47B20' },
          ].map(row => {
            const val   = stats?.[row.key] ?? 0;
            const total = stats?.users ?? 1;
            const pct   = Math.round((val / total) * 100);
            return (
              <div key={row.key} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{loading ? '—' : val}</span>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: '#f1f5f9' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: row.color, width: loading ? '0%' : `${pct}%`, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Needs attention */}
        <div style={{ padding: '20px', borderRadius: 14, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>Needs Attention</h3>
          {PENDING_CARDS.map(p => (
            <Link key={p.key} to={p.link} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: p.bg, border: `1px solid ${p.border}`, marginBottom: 10, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{p.label}</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: p.color, fontFamily: "'Syne',sans-serif" }}>{S(p.key)}</span>
            </Link>
          ))}
          <Link
            to="/admin/opportunities?published=false"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Pending Opportunities</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#1B3A6B', fontFamily: "'Syne',sans-serif" }}>{S('pendingOpps')}</span>
          </Link>
        </div>
      </div>

      {/* Quick navigation */}
      <div style={{ padding: '20px', borderRadius: 14, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 14px' }}>Quick Navigation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
          {QUICK_LINKS.map(link => (
            <Link key={link.to} to={link.to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.15s', color: '#64748b' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${link.color}0d`; e.currentTarget.style.borderColor = `${link.color}40`; e.currentTarget.style.color = link.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <IC d={link.icon} size={20} />
              <span style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
