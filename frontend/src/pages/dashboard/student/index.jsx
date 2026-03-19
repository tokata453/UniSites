import { useState, useEffect } from 'react';
import { Bookmark, Building2, FileText, GraduationCap, MapPin, Newspaper, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authApi } from '@/api';
import { Card, Badge, Spinner, Empty, Button } from '@/components/common';
import { useAuth } from '@/hooks';
import { avatarUrl, coverUrl, logoUrl, formatDate, formatCurrency } from '@/utils';

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
          { label: 'Saved Universities', value: savedCount, icon: Bookmark, bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-[#1B3A6B]' },
          { label: 'Feed Activity',      value: 0,          icon: Newspaper, bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700' },
          { label: 'Applications',       value: 0,          icon: FileText, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
        ].map((s) => (
          <div key={s.label} className={`p-5 rounded-xl ${s.bg} border ${s.border}`}>
            <div className="mb-2"><s.icon size={24} /></div>
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
          <Link to="/feed">
            <button className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all">
              Open Feed
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

  const unsave = async (item) => {
    await authApi.toggleSavedItem({ item_type: item.item_type, item_id: item.item_id });
    setItems((p) => p.filter((i) => i.id !== item.id));
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const visibleItems = items.filter((item) => item.item_type !== 'thread');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Saved Items</h2>
      {visibleItems.length === 0 ? (
        <Empty title="Nothing saved yet" description="Save universities and opportunities to find them later.">
          <Link to="/universities">
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1B3A6B] text-white hover:bg-[#15305a] transition-all">
              Browse Universities
            </button>
          </Link>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {item.item_type === 'university' && item.University && (
                <>
                  <Link to={`/universities/${item.University.slug}`} className="block group">
                    <div className="h-36 bg-slate-100 overflow-hidden">
                      {item.University.cover_url ? (
                        <img src={coverUrl(item.University.cover_url) || item.University.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500"><Building2 size={52} /></div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          {item.University.logo_url
                            ? <img src={logoUrl(item.University.logo_url)} alt="" className="w-full h-full object-cover" />
                            : <GraduationCap size={18} className="text-slate-500" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-[#1B3A6B] transition-colors">{item.University.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 inline-flex items-center gap-1"><MapPin size={12} /> {item.University.province || 'Location not set'}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                        <span className="inline-flex items-center gap-1"><Star size={12} className="text-amber-500 fill-amber-500" /> {item.University.rating_avg ? Number(item.University.rating_avg).toFixed(1) : '—'}</span>
                        <span>{item.University.tuition_min ? `${formatCurrency(item.University.tuition_min)}/yr` : 'Tuition N/A'}</span>
                        <span>{item.University.program_count || 0} programs</span>
                      </div>
                    </div>
                  </Link>
                  <div className="px-4 pb-4 flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#1B3A6B] border border-blue-200">
                      University
                    </span>
                    <button onClick={() => unsave(item)}
                      className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
                      Remove
                    </button>
                  </div>
                </>
              )}

              {item.item_type === 'opportunity' && item.Opportunity && (
                <>
                  <Link to={`/opportunities/${item.Opportunity.slug}`} className="block group p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                        {item.Opportunity.type}
                      </span>
                      {item.Opportunity.is_featured && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-[#1B3A6B] transition-colors">{item.Opportunity.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.Opportunity.University?.name || 'External opportunity'}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                      <span>{item.Opportunity.deadline ? `Deadline ${formatDate(item.Opportunity.deadline)}` : 'No deadline'}</span>
                      <span>{item.Opportunity.is_fully_funded ? 'Fully funded' : 'Open'}</span>
                    </div>
                  </Link>
                  <div className="px-4 pb-4 flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Opportunity
                    </span>
                    <button onClick={() => unsave(item)}
                      className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
                      Remove
                    </button>
                  </div>
                </>
              )}
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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  const save = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('bio',  form.bio);
      if (avatarFile) fd.append('avatar', avatarFile);
      const res = await authApi.updateProfile(fd);
      setUser(res.data.user);
      setAvatarFile(null);
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
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0 overflow-hidden"
            style={{ background: '#1B3A6B' }}>
            {avatarPreview || user?.avatar_url ? (
              <img
                src={avatarPreview || avatarUrl(user?.avatar_url) || user?.avatar_url}
                alt={user?.name || 'User avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
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
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">Upload a square photo for the best result.</p>
          </div>
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
