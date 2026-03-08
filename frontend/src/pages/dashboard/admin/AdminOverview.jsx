import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api';

const IC = ({ d, size = 18, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const STAT_CARDS = [
  { key: 'users',        label: 'Total Users',        icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75', color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)'  },
  { key: 'universities', label: 'Universities',        icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',                                                                  color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
  { key: 'opportunities',label: 'Opportunities',       icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',                              color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
  { key: 'threads',      label: 'Forum Threads',       icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',                                                                    color: '#ec4899', bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.2)'  },
];

const PENDING_CARDS = [
  { key: 'pendingUnis',    label: 'Pending Universities', link: '/admin/universities?published=false', color: '#f59e0b' },
  { key: 'pendingReviews', label: 'Pending Reviews',      link: '/admin/reviews?approved=false',       color: '#ef4444' },
];

const QUICK_LINKS = [
  { to: '/admin/users',         label: 'Manage Users',         icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z' },
  { to: '/admin/universities',  label: 'Manage Universities',   icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { to: '/admin/opportunities', label: 'Manage Opportunities',  icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { to: '/admin/reviews',       label: 'Moderate Reviews',      icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { to: '/admin/forum',         label: 'Moderate Forum',        icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
];

export default function AdminOverview() {
  const [stats, setStats]   = useState(null);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px', fontFamily: "'Syne',sans-serif" }}>Admin Dashboard</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Platform overview and quick actions</p>
      </div>

      {/* Main stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {STAT_CARDS.map(card => (
          <div key={card.key} style={{ padding: '20px 18px', borderRadius: 14, background: card.bg, border: `1px solid ${card.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${card.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                <IC d={card.icon} size={16} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{S(card.key)}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* User breakdown + pending row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {/* User breakdown */}
        <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px' }}>User Breakdown</h3>
          {[
            { label: 'Students', key: 'students', color: '#6366f1' },
            { label: 'University Owners', key: 'owners', color: '#10b981' },
            { label: 'Admins', key: 'admins', color: '#f59e0b' },
          ].map(row => {
            const val = stats?.[row.key] ?? 0;
            const total = stats?.users ?? 1;
            const pct = Math.round((val / total) * 100);
            return (
              <div key={row.key} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{loading ? '—' : val}</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.07)' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: row.color, width: loading ? '0%' : `${pct}%`, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending actions */}
        <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px' }}>Needs Attention</h3>
          {PENDING_CARDS.map(p => (
            <Link key={p.key} to={p.link} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: `${p.color}10`, border: `1px solid ${p.color}25`, marginBottom: 10, transition: 'background 0.2s' }}>
              <span style={{ fontSize: 13, color: '#cbd5e1' }}>{p.label}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: p.color, fontFamily: "'Syne',sans-serif" }}>{S(p.key)}</span>
            </Link>
          ))}
          <div style={{ marginTop: 4, padding: '12px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Featured Opportunities</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#818cf8', fontFamily: "'Syne',sans-serif" }}>{S('featuredOpps')}</div>
          </div>
        </div>
      </div>

      {/* Quick navigation */}
      <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', margin: '0 0 14px' }}>Quick Navigation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
          {QUICK_LINKS.map(link => (
            <Link key={link.to} to={link.to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.2s', color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = '#a5b4fc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94a3b8'; }}>
              <IC d={link.icon} size={20} />
              <span style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
