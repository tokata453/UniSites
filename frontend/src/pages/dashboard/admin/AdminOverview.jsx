import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api';

const IC = ({ d, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const STAT_CARDS = [
  { key: 'users', label: 'Total Users', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75', color: '#1B3A6B', bg: '#eff6ff', border: '#bfdbfe' },
  { key: 'universities', label: 'Universities', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  { key: 'organizations', label: 'Organizations', icon: 'M3 21h18 M5 21V7l7-4 7 4v14 M9 12h6 M9 16h6', color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
  { key: 'opportunities', label: 'Opportunities', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', color: '#F47B20', bg: '#fff7ed', border: '#fed7aa' },
  { key: 'reviews', label: 'Reviews', icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11', color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
];

const PENDING_CARDS = [
  { key: 'pendingUnis', label: 'Pending Universities', link: '/admin/universities?published=false', color: '#d97706', bg: '#fefce8', border: '#fef08a' },
  { key: 'pendingOrganizations', label: 'Pending Organizations', link: '/admin/organizations?approved=false', color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
  { key: 'pendingOpps', label: 'Pending Opportunities', link: '/admin/opportunities?published=false', color: '#1B3A6B', bg: '#eff6ff', border: '#bfdbfe' },
];

const QUICK_LINKS = [
  { to: '/admin/users', label: 'Manage Users', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z', color: '#1B3A6B' },
  { to: '/admin/universities', label: 'Manage Universities', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', color: '#15803d' },
  { to: '/admin/organizations', label: 'Manage Organizations', icon: 'M3 21h18 M5 21V7l7-4 7 4v14 M9 12h6 M9 16h6', color: '#0f766e' },
  { to: '/admin/majors', label: 'Manage Majors', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 17A2.5 2.5 0 0 0 4 14.5V5a2 2 0 0 1 2-2h14v13.5 M6.5 17H20', color: '#4AAEE0' },
  { to: '/admin/opportunities', label: 'Manage Opportunities', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', color: '#F47B20' },
  { to: '/admin/feed', label: 'Open Feed', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z M7 10h10 M7 14h7', color: '#7c3aed' },
];

const BREAKDOWN_ROWS = [
  { label: 'Students', key: 'students', color: '#1B3A6B' },
  { label: 'University Owners', key: 'owners', color: '#15803d' },
  { label: 'Organizations', key: 'organizations', color: '#0f766e' },
  { label: 'Admins', key: 'admins', color: '#F47B20' },
];

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then((r) => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const S = (key) => (loading ? '—' : (stats?.[key] ?? 0));

  return (
    <div className="font-['DM_Sans',sans-serif]">
      <div className="mb-6 sm:mb-7">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.65)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-600">Live</span>
        </div>
        <h1 className="font-['Syne',sans-serif] text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">Platform overview and quick actions</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border p-4 shadow-sm sm:p-5"
            style={{ background: card.bg, borderColor: card.border }}
          >
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border bg-white shadow-sm"
              style={{ color: card.color, borderColor: card.border }}
            >
              <IC d={card.icon} size={18} />
            </div>
            <div
              className="font-['Syne',sans-serif] text-3xl font-extrabold leading-none sm:text-4xl"
              style={{ color: card.color }}
            >
              {S(card.key)}
            </div>
            <div className="mt-2 text-sm font-medium leading-snug text-slate-500 sm:text-base">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-5 text-lg font-bold text-slate-800">User Breakdown</h3>
          <div className="space-y-4">
            {BREAKDOWN_ROWS.map((row) => {
              const val = stats?.[row.key] ?? 0;
              const total = stats?.users ?? 1;
              const pct = Math.round((val / total) * 100);
              return (
                <div key={row.key}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-500 sm:text-base">{row.label}</span>
                    <span className="text-sm font-bold text-slate-800 sm:text-base">{loading ? '—' : val}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{ background: row.color, width: loading ? '0%' : `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-5 text-lg font-bold text-slate-800">Needs Attention</h3>
          <div className="space-y-3">
            {PENDING_CARDS.map((p) => (
              <Link
                key={p.key}
                to={p.link}
                className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition-opacity hover:opacity-80"
                style={{ background: p.bg, borderColor: p.border }}
              >
                <span className="text-base font-medium text-slate-600">{p.label}</span>
                <span
                  className="font-['Syne',sans-serif] text-3xl font-extrabold leading-none"
                  style={{ color: p.color }}
                >
                  {S(p.key)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-800">Quick Navigation</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center text-slate-500 transition-all hover:-translate-y-0.5 hover:shadow-md"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${link.color}0d`;
                e.currentTarget.style.borderColor = `${link.color}40`;
                e.currentTarget.style.color = link.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <IC d={link.icon} size={20} />
              <span className="text-xs font-semibold leading-snug sm:text-sm">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
