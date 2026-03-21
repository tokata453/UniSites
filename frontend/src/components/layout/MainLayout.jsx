import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { useInboxStore } from '@/store/inboxStore';
import logo from '@/assets/logo/UniSites-Lanscape.png';

const InboxIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12.08V19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h12.93" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

export default function MainLayout() {
  const { isAuthenticated, user, logout, isUniversityOwner, isOrganizationOwner, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadNotifications = useInboxStore((s) => s.unreadNotifications);
  const unreadMessages = useInboxStore((s) => s.unreadMessages);
  const refreshSummary = useInboxStore((s) => s.refreshSummary);
  const clearSummary = useInboxStore((s) => s.clearSummary);

  const handleLogout = () => {
    logout();
    clearSummary();
    navigate('/');
  };

  const dashboardPath = isUniversityOwner ? '/owner' : isOrganizationOwner ? '/organization' : isAdmin ? '/admin' : '/dashboard';
  const inboxPath = `${dashboardPath}/inbox?context=personal`;
  const unreadInbox = unreadNotifications + unreadMessages;
  const navLinks = [
    { to: '/universities',  label: 'Universities'  },
    { to: '/majors',        label: 'Majors'        },
    { to: '/opportunities', label: 'Opportunities' },
    { to: '/feed',          label: 'Feed'          },
    { to: '/about',         label: 'About'         },
  ];

  useEffect(() => {
    if (isAuthenticated) refreshSummary();
    else clearSummary();
  }, [isAuthenticated, refreshSummary, clearSummary]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 h-16 flex items-center border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 shadow-sm sm:px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="transition-transform duration-150 active:scale-90 hover:opacity-80 inline-block">
            <img src={logo} alt="Logo" className="h-10 w-auto sm:h-12" />
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-orange-600 font-semibold underline'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`
                }>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {(isAdmin || isUniversityOwner || isOrganizationOwner) && (
              <Link to={dashboardPath}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 duration-150 active:scale-90 hover:bg-slate-100 transition-all">
                Dashboard
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link
                  to={inboxPath}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800"
                  title="Inbox"
                >
                  <InboxIcon />
                  {unreadInbox > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                      {unreadInbox > 99 ? '99+' : unreadInbox}
                    </span>
                  )}
                </Link>
                <Link to='/dashboard'>
                  <div className="relative size-9 rounded-full overflow-hidden bg-blue-800 flex items-center justify-center text-xs font-bold text-white shrink-0 transition-transform duration-150 active:scale-90 hover:opacity-80">
                    <span className={`flex h-full w-full items-center justify-center ${user?.avatar_url ? 'absolute opacity-0 pointer-events-none' : ''}`}>
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                    {user?.avatar_url && (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
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
                </Link>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 duration-150 active:scale-90 hover:opacity-80 transition-all">
                  Log in
                </Link>
                <Link to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-700 hover:bg-blue-900 text-white duration-150 active:scale-90 hover:opacity-80 transition-all">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Fallback */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && (
              <>
                <Link
                  to={inboxPath}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                  aria-label="Inbox"
                >
                  <InboxIcon />
                  {unreadInbox > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-0.5 text-[10px] font-semibold text-white">
                      {unreadInbox > 99 ? '99+' : unreadInbox}
                    </span>
                  )}
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50"
              aria-label="Toggle navigation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileMenuOpen ? (
                  <>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </>
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/5 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          />
          <div className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 shadow-xl md:hidden">
            <div className="mx-auto max-w-7xl space-y-4">
              <nav className="grid gap-2">
                {navLinks.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>

              <div className="grid gap-2">
                {(isAdmin || isUniversityOwner || isOrganizationOwner) && (
                  <Link
                    to={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                )}

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-xl border border-red-200 bg-transparent px-4 py-3 text-left text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50">
                      Log in
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-blue-800">
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Page content ── */}
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 mt-16 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 text-center md:text-left">
          <span>© {new Date().getFullYear()} UniSites. All rights reserved.</span>
          <div className="flex flex-wrap justify-center gap-4 md:justify-end md:gap-6">
            {navLinks.map(({to, label}) => (
              <Link to={to} className="hover:text-slate-400 hover:underline duration-150 active:scale-90 transition-all">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
