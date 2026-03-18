import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { useEffect } from 'react';
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
  const { isAuthenticated, user, logout, isOwner, isOrganization, isAdmin } = useAuth();
  const navigate = useNavigate();
  const unreadNotifications = useInboxStore((s) => s.unreadNotifications);
  const unreadMessages = useInboxStore((s) => s.unreadMessages);
  const refreshSummary = useInboxStore((s) => s.refreshSummary);
  const clearSummary = useInboxStore((s) => s.clearSummary);

  const handleLogout = () => {
    logout();
    clearSummary();
    navigate('/');
  };

  const dashboardPath = isOwner ? '/owner' : isOrganization ? '/organization' : isAdmin ? '/admin' : '/dashboard';
  const inboxPath = `${dashboardPath}/inbox`;
  const unreadInbox = unreadNotifications + unreadMessages;

  useEffect(() => {
    if (isAuthenticated) refreshSummary();
    else clearSummary();
  }, [isAuthenticated, refreshSummary, clearSummary]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 h-16 flex items-center border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="transition-transform duration-150 active:scale-90 hover:opacity-80 inline-block">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: '/universities',  label: 'Universities'  },
              { to: '/majors',        label: 'Majors'        },
              { to: '/opportunities', label: 'Opportunities' },
              { to: '/feed',          label: 'Feed'          },
              { to: '/about',         label: 'About'         },
            ].map(({ to, label }) => (
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
          <div className="flex items-center gap-2">
            {(isAdmin || isOwner || isOrganization) && (
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
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} UniSites. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/universities"  className="hover:text-slate-400 hover:underline duration-150 active:scale-90 transition-all">Universities</Link>
            <Link to="/majors"        className="hover:text-slate-400 hover:underline duration-150 active:scale-90 transition-all">Majors</Link>
            <Link to="/opportunities" className="hover:text-slate-400 hover:underline duration-150 active:scale-90 transition-all">Opportunities</Link>
            <Link to="/feed"          className="hover:text-slate-400 hover:underline duration-150 active:scale-90 transition-all">Feed</Link>
            <Link to="/about"         className="hover:text-slate-400 hover:underline duration-150 active:scale-90 transition-all">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
