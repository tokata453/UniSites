import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authApi, universityApi } from '@/api';
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
        <h2 className="text-xl font-bold text-white">Welcome back, {user?.name} 👋</h2>
        <p className="text-slate-400 text-sm mt-0.5">Here's a quick overview of your activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Saved Universities', value: savedCount, icon: '🔖', color: 'from-indigo-500/10 border-indigo-500/20' },
          { label: 'Forum Posts',        value: 0,          icon: '💬', color: 'from-emerald-500/10 border-emerald-500/20' },
          { label: 'Applications',       value: 0,          icon: '📝', color: 'from-amber-500/10 border-amber-500/20' },
        ].map((s) => (
          <div key={s.label} className={`p-5 rounded-xl bg-gradient-to-br ${s.color} border`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Quick Links</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/universities"><Button variant="secondary">Browse Universities</Button></Link>
          <Link to="/opportunities"><Button variant="secondary">Find Scholarships</Button></Link>
          <Link to="/forum"><Button variant="secondary">Visit Forum</Button></Link>
        </div>
      </Card>
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
      <h2 className="text-xl font-bold text-white">Saved Items</h2>
      {items.length === 0 ? (
        <Empty title="Nothing saved yet" description="Save universities and opportunities to find them later.">
          <Link to="/universities"><Button>Browse Universities</Button></Link>
        </Empty>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">{item.University?.name || item.Opportunity?.title}</p>
                <Badge color="blue" className="mt-1">{item.item_type}</Badge>
              </div>
              <button onClick={() => unsave(item.id)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
            </Card>
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
      <h2 className="text-xl font-bold text-white">My Profile</h2>

      <Card className="p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold text-white">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <Badge color="blue" className="mt-1">{user?.Role?.name}</Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({...p, name: e.target.value}))}
              className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm((p) => ({...p, bio: e.target.value}))}
              rows={3} className="input-base resize-none" placeholder="Tell us about yourself..." />
          </div>
          <Button onClick={save} loading={loading}>Save Changes</Button>
          {message && <p className="text-sm text-emerald-400">{message}</p>}
        </div>
      </Card>
    </div>
  );
}
