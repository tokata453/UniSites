import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth, useToast } from '@/hooks';
import ToastContainer from '@/components/common/ToastContainer';

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const STUDENT_NAV = [
  { to: '/dashboard',         label: 'Overview',    icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',          end: true },
  { to: '/dashboard/saved',   label: 'Saved',       icon: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z' },
  { to: '/dashboard/profile', label: 'Profile',     icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
];

const ADMIN_NAV = [
  { to: '/admin',                label: 'Overview',        icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10', end: true },
  { to: '/admin/users',          label: 'Users',           icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
  { to: '/admin/universities',   label: 'Universities',    icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { to: '/admin/opportunities',  label: 'Opportunities',   icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { to: '/admin/reviews',        label: 'Reviews',         icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { to: '/admin/forum',          label: 'Forum',           icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
];

const OWNER_NAV = [
  { to: '/owner',             label: 'Analytics',           icon: 'M18 20V10 M12 20V4 M6 20v-6',                          end: true },
  { to: '/owner/profile',     label: 'University Profile',  icon: 'M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
  { to: '/owner/gallery',     label: 'Gallery',             icon: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7' },
  { to: '/owner/faculties',   label: 'Faculties & Programs',icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
  { to: '/owner/news',        label: 'News & Events',       icon: 'M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2' },
  { to: '/owner/faq',         label: 'FAQs & Contact',      icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
];

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = role === 'admin' ? ADMIN_NAV : role === 'owner' ? OWNER_NAV : STUDENT_NAV;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={`flex flex-col border-r border-white/[0.07] shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        {/* Logo */}
        <div className={`h-16 flex items-center gap-3 px-4 border-b border-white/[0.07] ${collapsed ? 'justify-center' : ''}`}>
          <Link to="/" className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: role === 'admin' ? '#dc2626' : '#6366f1' }}>
            <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" size={16} />
          </Link>
          {!collapsed && (
            <div>
              <div className="text-sm font-semibold text-white">UniSites</div>
              <div className="text-xs text-slate-500 capitalize">{role} Portal</div>
            </div>
          )}
        </div>

        {/* User badge */}
        {!collapsed && (
          <div className="mx-3 mt-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.07]">
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            <div className="text-xs font-medium text-slate-200 truncate mt-0.5">{user?.name}</div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all border
                ${isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border-transparent'
                } ${collapsed ? 'justify-center' : ''}`
              }>
              <Icon d={item.icon} size={17} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 border-t border-white/[0.07] space-y-1">
          <button onClick={() => setCollapsed((p) => !p)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 transition-all ${collapsed ? 'justify-center' : ''}`}>
            <Icon d={collapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} size={17} />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${collapsed ? 'justify-center' : ''}`}>
            <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" size={17} />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.07] shrink-0">
          <span className="text-sm text-slate-400">Welcome back, <span className="text-white font-medium">{user?.name}</span></span>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; }}
              />
            ) : (
              user?.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
