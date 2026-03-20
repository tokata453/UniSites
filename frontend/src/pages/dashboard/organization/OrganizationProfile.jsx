import { useEffect, useState } from 'react';
import { organizationApi } from '@/api';
import { useAuth } from '@/hooks';
import { avatarUrl } from '@/utils';

export default function OrganizationProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    description: '',
    website_url: '',
    contact_phone: '',
    email: '',
  });
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    organizationApi.getMine()
      .then((res) => {
        const next = res.data.organization;
        setOrganization(next);
        setForm({
          name: next?.name || '',
          description: next?.description || '',
          website_url: next?.website_url || '',
          contact_phone: next?.contact_phone || '',
          email: next?.email || user?.email || '',
        });
      })
      .catch(() => {
        setOrganization(null);
        setForm((prev) => ({
          ...prev,
          email: user?.email || '',
        }));
      });
  }, [user?.email]);

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
      fd.append('description', form.description);
      fd.append('website_url', form.website_url);
      fd.append('contact_phone', form.contact_phone);
      fd.append('email', form.email);
      if (avatarFile) fd.append('logo', avatarFile);
      const res = await organizationApi.updateMine(fd);
      setOrganization(res.data.organization);
      setAvatarFile(null);
      setMessage('Organization profile updated!');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Organization Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Manage the public identity shown when your organization posts official opportunities.</p>
      </div>

      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0 overflow-hidden bg-teal-700">
            {avatarPreview || organization?.logo_url ? (
              <img
                src={avatarPreview || avatarUrl(organization?.logo_url) || organization?.logo_url}
                alt={user?.name || 'Organization avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              organization?.name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'O'
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{organization?.name || user?.name}</p>
            <p className="text-sm text-slate-500">{organization?.email || user?.email}</p>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
              {user?.Role?.name}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Organization Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500"
            />
            <p className="text-xs text-slate-400 mt-1">Upload a square logo or mark for the best result.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Organization Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Organization Info</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Describe your organization, mission, and the kind of opportunities you provide."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Website</label>
            <input
              type="url"
              value={form.website_url}
              onChange={(e) => setForm((prev) => ({ ...prev, website_url: e.target.value }))}
              placeholder="https://your-organization.org"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Public Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="hello@organization.org"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Phone</label>
            <input
              type="text"
              value={form.contact_phone}
              onChange={(e) => setForm((prev) => ({ ...prev, contact_phone: e.target.value }))}
              placeholder="+855 ..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all"
            />
          </div>
          {!user?.is_approved && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Your organization account is pending admin approval. You can still prepare your profile while you wait.
            </div>
          )}

          <button
            onClick={save}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 bg-teal-700 hover:bg-teal-800"
          >
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
