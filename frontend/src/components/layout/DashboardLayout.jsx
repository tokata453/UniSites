import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { useInboxStore } from '@/store/inboxStore';
import ToastContainer from '@/components/common/ToastContainer';

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const STUDENT_NAV = [
  { to: '/dashboard',         label: 'Overview',             icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',          end: true },
  { to: '/dashboard/saved',   label: 'Saved',                icon: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z' },
  { to: '/dashboard/profile', label: 'Profile',              icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
  { to: '/dashboard/inbox?context=personal',   label: 'Personal Inbox',       icon: 'M22 12.08V19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h12.93 M22 6l-10 7L2 6' },
];

const ADMIN_NAV = [
  { to: '/admin',                label: 'Overview',        icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10', end: true },
  { to: '/admin/users',          label: 'Users',           icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
  { to: '/admin/universities',   label: 'Universities',    icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { to: '/admin/organizations',  label: 'Organizations',   icon: 'M3 21h18 M5 21V7l7-4 7 4v14 M9 12h6 M9 16h6' },
  { to: '/admin/majors',         label: 'Majors',          icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 17A2.5 2.5 0 0 0 4 14.5V5a2 2 0 0 1 2-2h14v13.5 M6.5 17H20' },
  { to: '/admin/opportunities',  label: 'Opportunities',   icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { to: '/admin/feed',           label: 'Feed',            icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z M7 10h10 M7 14h7' },
  { to: '/admin/inbox?context=admin',          label: 'Admin Inbox',     icon: 'M22 12.08V19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h12.93 M22 6l-10 7L2 6' },
];

const OWNER_NAV = [
  { to: '/owner',             label: 'Analytics',            icon: 'M18 20V10 M12 20V4 M6 20v-6',                          end: true },
  { to: '/owner/profile',     label: 'University Profile',   icon: 'M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
  { to: '/owner/gallery',     label: 'Gallery',              icon: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7' },
  { to: '/owner/faculties',   label: 'Faculties & Programs', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
  { to: '/owner/news',        label: 'News & Events',        icon: 'M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2' },
  { to: '/owner/faq',         label: 'FAQs & Contact',       icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { to: '/owner/opportunities', label: 'Opportunities', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { to: '/owner/reviews', label: 'Reviews', icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { to: '/owner/inbox?context=university', label: 'University Inbox', icon: 'M22 12.08V19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h12.93 M22 6l-10 7L2 6' },
];

const ORGANIZATION_NAV = [
  { to: '/organization', label: 'Overview', icon: 'M3 13h8V3H3v10z M13 21h8V11h-8v10z M13 3v6h8V3h-8z M3 21h8v-6H3v6z', end: true },
  { to: '/organization/opportunities', label: 'Opportunities', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { to: '/organization/news', label: 'News', icon: 'M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2' },
  { to: '/organization/events', label: 'Events', icon: 'M8 2v4 M16 2v4 M3 10h18 M5 6h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z' },
  { to: '/organization/faq', label: 'FAQ & Contact', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { to: '/organization/reviews', label: 'Reviews', icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
  { to: '/organization/inbox?context=organization', label: 'Organization Inbox', icon: 'M22 12.08V19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h12.93 M22 6l-10 7L2 6' },
];

// Role accent colors from logo palette
const ROLE_ACCENT = {
  admin:   { color: '#dc2626', bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    activeBg: 'bg-red-50',    activeText: 'text-red-700',    activeBorder: 'border-red-300'    },
  owner:   { color: '#F47B20', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', activeBg: 'bg-orange-50', activeText: 'text-orange-700', activeBorder: 'border-orange-300' },
  organization: { color: '#0f766e', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', activeBg: 'bg-teal-50', activeText: 'text-teal-700', activeBorder: 'border-teal-300' },
  student: { color: '#1B3A6B', bg: 'bg-blue-50',   text: 'text-[#1B3A6B]', border: 'border-blue-200',   activeBg: 'bg-blue-50',   activeText: 'text-[#1B3A6B]',  activeBorder: 'border-blue-300'   },
};

const formatRoleLabel = (value) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const unreadNotifications = useInboxStore((s) => s.unreadNotifications);
  const unreadMessages = useInboxStore((s) => s.unreadMessages);
  const refreshSummary = useInboxStore((s) => s.refreshSummary);
  const clearSummary = useInboxStore((s) => s.clearSummary);
  const navItems = role === 'admin'
    ? ADMIN_NAV
    : role === 'owner'
      ? OWNER_NAV
      : role === 'organization'
        ? (user?.is_approved ? ORGANIZATION_NAV : ORGANIZATION_NAV.filter((item) => item.to === '/organization'))
        : STUDENT_NAV;
  const accent = ROLE_ACCENT[role] || ROLE_ACCENT.student;
  const unreadInbox = unreadNotifications + unreadMessages;
  const inboxPath = role === 'admin' ? '/admin/inbox' : role === 'owner' ? '/owner/inbox' : role === 'organization' ? '/organization/inbox' : '/dashboard/inbox';
  const isInboxRoute = location.pathname === inboxPath;

  useEffect(() => {
    if (isInboxRoute) return;
    refreshSummary();
  }, [isInboxRoute, refreshSummary]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handleLogout = () => { logout(); clearSummary(); navigate('/'); };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 shrink-0 transition-all duration-300 shadow-sm lg:static lg:translate-x-0 ${
        mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
      } ${collapsed ? 'w-16' : 'w-60'}`}>

        {/* Logo */}
        <div className={`h-16 flex items-center gap-3 px-4 border-b border-slate-200 ${collapsed ? 'justify-center' : ''}`}>
          {!collapsed && (
            <div
              className="text-sm font-semibold px-2 py-0.5 capitalize"
              style={{ color: accent.color, textTransform: 'capitalize' }}
            >
              {role === 'student' ? 'Profile' : formatRoleLabel(role)} Dashboard
            </div>
          )}
        </div>

        {/* User badge */}
        {!collapsed && (
          <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
                style={{ background: accent.color }}>
                <span className={`flex h-full w-full items-center justify-center ${user?.avatar_url ? 'absolute opacity-0 pointer-events-none' : ''}`}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
                {user?.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('span');
                      if (fallback) fallback.className = 'flex h-full w-full items-center justify-center';
                    }}
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-700 truncate">{user?.name}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all border
                ${isActive
                  ? `${accent.activeBg} ${accent.activeText} ${accent.activeBorder}`
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-transparent'
                } ${collapsed ? 'justify-center' : ''}`
              }>
              <div className="relative shrink-0">
                <Icon d={item.icon} size={17} />
                {collapsed && item.to === inboxPath && unreadInbox > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                    {unreadInbox > 9 ? '9+' : unreadInbox}
                  </span>
                )}
              </div>
              {!collapsed && (
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span className="truncate">{item.label}</span>
                  {item.to === inboxPath && unreadInbox > 0 && (
                    <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                      {unreadInbox > 99 ? '99+' : unreadInbox}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 border-t border-slate-200 space-y-1">
          <button onClick={() => setCollapsed((p) => !p)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all ${collapsed ? 'justify-center' : ''}`}>
            <Icon d={collapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} size={17} />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all ${collapsed ? 'justify-center' : ''}`}>
            <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" size={17} />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top header */}
        <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 bg-white border-b border-slate-200 shrink-0 shadow-sm min-h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 lg:hidden"
              aria-label="Open sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            </button>
            <div className="hidden lg:block text-sm text-slate-500">
              Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-[#152d54] active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 11.5 12 4l9 7.5" />
                <path d="M5 10.5V20h14v-9.5" />
              </svg>
              <span className="sm:hidden">Back to site</span>
              <span className="hidden sm:inline">Back to site</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <Outlet key={location.pathname} />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
