import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/api';
import { Card, Badge, Spinner, Empty, Button } from '@/components/common';
import { useAuth } from '@/hooks';

// ── StudentOverview ───────────────────────────────────────────────────────────
export function StudentOverview() {
  const { user } = useAuth();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    authApi.getSavedItems()
      .then((res) => setSavedCount(res.data.items?.length || 0))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Your personalized dashboard</h2>
        <p className="text-slate-500 text-sm mt-0.5">Here's a quick overview of your activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Saved Universities', value: savedCount, icon: '🔖', bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-[#1B3A6B]' },
          { label: 'Forum Posts',        value: 0,          icon: '💬', bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700' },
          { label: 'Applications',       value: 0,          icon: '📝', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
        ].map((s) => (
          <div key={s.label} className={`p-5 rounded-xl ${s.bg} border ${s.border}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.text}`}>{s.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Quick Links</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/universities">
            <button className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all">
              Browse Universities
            </button>
          </Link>
          <Link to="/majors">
            <button className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all">
              Explore Majors
            </button>
          </Link>
          <Link to="/opportunities">
            <button className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all">
              Find Opportunities
            </button>
          </Link>
          <Link to="/forum">
            <button className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all">
              Visit Forum
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── StudentSaved ──────────────────────────────────────────────────────────────
export function StudentSaved() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getSavedItems()
      .then((res) => setItems(res.data.items || []))
      .finally(() => setLoading(false));
  }, []);

  const unsave = async (id) => {
    await authApi.toggleSavedItem({ item_id: id });
    setItems((p) => p.filter((i) => i.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Saved Items</h2>
      {items.length === 0 ? (
        <Empty title="Nothing saved yet" description="Save universities and opportunities to find them later.">
          <Link to="/universities">
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1B3A6B] text-white hover:bg-[#15305a] transition-all">
              Browse Universities
            </button>
          </Link>
        </Empty>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {item.University?.name || item.Opportunity?.title}
                </p>
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#1B3A6B] border border-blue-200">
                  {item.item_type}
                </span>
              </div>
              <button onClick={() => unsave(item.id)}
                className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── StudentProfile ────────────────────────────────────────────────────────────
export function StudentProfile() {
  const { user, setUser } = useAuth();
  const [form,    setForm]    = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const save = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('bio',  form.bio);
      const res = await authApi.updateProfile(fd);
      setUser(res.data.user);
      setMessage('Profile updated!');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-bold text-slate-800">My Profile</h2>

      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-5">
        {/* Avatar + info */}
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: '#1B3A6B' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#1B3A6B] border border-blue-200">
              {user?.Role?.name}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 transition-all resize-none"
            />
          </div>

          <button
            onClick={save}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: '#1B3A6B' }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = '#15305a')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1B3A6B')}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>

          {message && (
            <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
              ✅ {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}