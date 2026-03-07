import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks';

export default function MainLayout() {
  const { isAuthenticated, user, logout, isOwner, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = isOwner ? '/owner' : '/dashboard';

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 h-16 flex items-center border-b border-white/[0.07] bg-[#0d1117]/90 backdrop-blur-md px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-lg font-bold text-white tracking-tight">
            Uni<span className="text-indigo-400">Sites</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: '/universities', label: 'Universities' },
              { to: '/opportunities', label: 'Opportunities' },
              { to: '/forum',        label: 'Forum'        },
            ].map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'text-white bg-white/[0.06]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'}`
                }>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/[0.06] transition-all">
                  Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  Logout
                </button>
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/[0.06] transition-all">
                  Log in
                </Link>
                <Link to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.07] py-8 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} UniSites. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/universities" className="hover:text-slate-300 transition-colors">Universities</Link>
            <Link to="/opportunities" className="hover:text-slate-300 transition-colors">Opportunities</Link>
            <Link to="/forum" className="hover:text-slate-300 transition-colors">Forum</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
