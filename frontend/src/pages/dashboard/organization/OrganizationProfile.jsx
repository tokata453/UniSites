import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, CalendarDays, Globe2, Image as ImageIcon, Layers3, Mail, Phone, Sparkles } from 'lucide-react';
import { opportunityApi, organizationApi } from '@/api';
import { useAuth } from '@/hooks';
import { formatDate, logoUrl } from '@/utils';

const cardClass = 'bg-white border border-slate-200 rounded-2xl shadow-sm';
const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all';
const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5';
const primaryBtn = 'inline-flex items-center justify-center rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryBtn = 'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50';

function PageSection({ title, subtitle, action, children }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Panel({ title, description, children, action }) {
  return (
    <section className={`${cardClass} p-5`}>
      {(title || action) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function OverviewStat({ label, value, tone = 'slate' }) {
  const tones = {
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    blue: 'bg-blue-50 border-blue-200 text-[#1B3A6B]',
    green: 'bg-green-50 border-green-200 text-green-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
  };
  return (
    <div className={`rounded-2xl border p-5 ${tones[tone] || tones.slate}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm">{label}</p>
    </div>
  );
}

function StatusPill({ tone = 'slate', children }) {
  const tones = {
    green: 'border-green-200 bg-green-50 text-green-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    teal: 'border-teal-200 bg-teal-50 text-teal-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-600',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>{children}</span>;
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      {label && <span className={labelClass}>{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export default function OrganizationProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    description: '',
    website_url: '',
    contact_phone: '',
    email: '',
    facebook_url: '',
    telegram_url: '',
    instagram_url: '',
    linkedin_url: '',
  });
  const [organization, setOrganization] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [orgRes, oppRes] = await Promise.all([
        organizationApi.getMine(),
        opportunityApi.getMine().catch(() => ({ data: { opportunities: [] } })),
      ]);
      const next = orgRes.data.organization;
      setOrganization(next);
      setOpportunities(oppRes.data.opportunities || []);
      setForm({
        name: next?.name || '',
        description: next?.description || '',
        website_url: next?.website_url || '',
        contact_phone: next?.contact_phone || '',
        email: next?.email || user?.email || '',
        facebook_url: next?.facebook_url || '',
        telegram_url: next?.telegram_url || '',
        instagram_url: next?.instagram_url || '',
        linkedin_url: next?.linkedin_url || '',
      });
    } catch {
      setOrganization(null);
      setOpportunities([]);
      setForm((prev) => ({ ...prev, email: user?.email || '' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.email]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview('');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  const summary = useMemo(() => ({
    opportunities: opportunities.length,
    gallery: organization?.Gallery?.length || 0,
    faqs: organization?.FAQs?.length || 0,
    socialLinks: [form.facebook_url, form.telegram_url, form.instagram_url, form.linkedin_url].filter(Boolean).length,
  }), [form.facebook_url, form.instagram_url, form.linkedin_url, form.telegram_url, opportunities.length, organization]);

  const profileCompletion = useMemo(() => {
    const importantFields = [
      form.name,
      form.description,
      form.website_url,
      form.contact_phone,
      form.email,
      form.facebook_url || form.telegram_url || form.instagram_url || form.linkedin_url,
      logoPreview || organization?.logo_url,
    ];
    const complete = importantFields.filter(Boolean).length;
    return Math.round((complete / importantFields.length) * 100);
  }, [form, logoPreview, organization?.logo_url]);

  const actionItems = useMemo(() => [
    { label: 'Add your logo', done: Boolean(logoPreview || organization?.logo_url), to: '/organization' },
    { label: 'Write a strong organization description', done: Boolean(form.description), to: '/organization' },
    { label: 'Add direct contact details', done: Boolean(form.email && form.contact_phone), to: '/organization' },
    { label: 'Link your website or social presence', done: Boolean(form.website_url || summary.socialLinks), to: '/organization' },
    { label: 'Publish at least one opportunity', done: summary.opportunities > 0, to: '/organization/opportunities' },
  ], [form.description, form.email, form.contact_phone, form.website_url, logoPreview, organization?.logo_url, summary.opportunities, summary.socialLinks]);

  const performanceNotes = [
    summary.opportunities > 0
      ? `You currently have ${summary.opportunities} published opportunit${summary.opportunities === 1 ? 'y' : 'ies'} connected to your organization profile.`
      : 'No opportunities are published yet, so your public page is acting mainly as a profile and contact page.',
    summary.gallery > 0
      ? `Your public profile includes ${summary.gallery} gallery item${summary.gallery === 1 ? '' : 's'}, which helps the page feel more complete.`
      : 'There are no gallery visuals yet, so the public page relies mostly on text and contact details.',
    user?.is_approved
      ? 'Your account is approved, so students can interact with your organization through the full dashboard flow.'
      : 'Your account is still pending admin approval, so full organization actions remain limited for now.',
  ];

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('website_url', form.website_url);
      fd.append('contact_phone', form.contact_phone);
      fd.append('email', form.email);
      fd.append('facebook_url', form.facebook_url);
      fd.append('telegram_url', form.telegram_url);
      fd.append('instagram_url', form.instagram_url);
      fd.append('linkedin_url', form.linkedin_url);
      if (logoFile) fd.append('logo', logoFile);
      await organizationApi.updateMine(fd);
      setLogoFile(null);
      setMessage('Organization profile updated');
      setTimeout(() => setMessage(''), 3000);
      await loadDashboard();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20 text-sm text-slate-500">Loading organization dashboard...</div>;
  }

  return (
    <PageSection
      title="Organization Overview"
      subtitle="Track the health of your public organization page and keep the essentials up to date."
      action={organization?.slug ? <Link to={`/organizations/${organization.slug}`} className={secondaryBtn} target="_blank" rel="noreferrer">View Public Page</Link> : null}
    >
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <OverviewStat label="Profile Completion" value={`${profileCompletion}%`} tone="teal" />
        <OverviewStat label="Opportunities" value={summary.opportunities} tone="blue" />
        <OverviewStat label="Gallery Items" value={summary.gallery} tone="green" />
        <OverviewStat label="FAQs Ready" value={summary.faqs} tone="slate" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Organization Snapshot" description="A quick read on profile quality, publication status, and trust signals.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-lg font-bold text-slate-500">
                  {logoPreview || organization?.logo_url ? (
                    <img src={logoPreview || logoUrl(organization?.logo_url) || organization?.logo_url} alt={organization?.name || 'Organization'} className="h-full w-full object-cover" />
                  ) : (
                    (organization?.name || user?.name || 'O').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{organization?.name || user?.name || 'Organization'}</p>
                  <p className="mt-1 text-sm text-slate-500">{organization?.email || user?.email || 'No public email set'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill tone={organization?.is_published ? 'green' : 'amber'}>{organization?.is_published ? 'Published' : 'Draft'}</StatusPill>
                    <StatusPill tone={organization?.is_verified ? 'teal' : 'slate'}>{organization?.is_verified ? 'Verified' : 'Unverified'}</StatusPill>
                    <StatusPill tone={user?.is_approved ? 'green' : 'amber'}>{user?.is_approved ? 'Approved account' : 'Pending approval'}</StatusPill>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Public Presence</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Website: <span className="font-semibold text-slate-800">{form.website_url ? 'Added' : 'Missing'}</span></p>
                <p>Contact phone: <span className="font-semibold text-slate-800">{form.contact_phone || 'Missing'}</span></p>
                <p>Social links: <span className="font-semibold text-slate-800">{summary.socialLinks}</span></p>
                <p>Last updated: <span className="font-semibold text-slate-800">{organization?.updated_at ? formatDate(organization.updated_at) : 'Not yet'}</span></p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ['Opportunities', summary.opportunities, <Sparkles size={16} />],
              ['Gallery', summary.gallery, <ImageIcon size={16} />],
              ['FAQs', summary.faqs, <Layers3 size={16} />],
              ['Social', summary.socialLinks, <BadgeCheck size={16} />],
            ].map(([label, value, icon]) => (
              <div key={label} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-2 text-teal-700">{icon}</div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Performance Notes" description="What the current organization setup is telling you.">
          <div className="space-y-3">
            {performanceNotes.map((note) => (
              <div key={note} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {note}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Tip: complete the profile basics first, then add live opportunities so the page feels active like a university profile.
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Action Checklist" description="The fastest path to a complete organization page.">
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Completion progress</p>
              <p className="text-sm text-slate-500">{actionItems.filter((item) => item.done).length} of {actionItems.length} core tasks completed</p>
            </div>
            <div className="text-2xl font-bold text-slate-800">{Math.round((actionItems.filter((item) => item.done).length / actionItems.length) * 100)}%</div>
          </div>
          <div className="space-y-3">
            {actionItems.map((item) => (
              <Link key={item.label} to={item.to} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${item.done ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.done ? '✓' : '!'}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.done ? 'Done' : 'Open'}</span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Quick Actions" description="Jump into the sections you’ll update most often.">
          <div className="grid gap-3">
            {[
              { to: '/organization', title: 'Update profile', meta: 'Refresh branding, contact details, and public description' },
              { to: '/organization/opportunities', title: 'Manage opportunities', meta: 'Post scholarships, internships, exchanges, and more' },
              { to: '/organization/inbox?context=organization', title: 'Open inbox', meta: 'Reply to conversations from students and partners' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50">
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
            Public page status:{' '}
            <span className="font-semibold">
              {organization?.is_published ? 'Students can view your organization page live' : 'Your organization page is still in draft mode'}
            </span>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <Panel title="Core Information" description="This mirrors the public organization page and should stay clear and current." action={<button type="button" onClick={save} disabled={saving} className={primaryBtn}>{saving ? 'Saving...' : 'Save Changes'}</button>}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Organization Name"><input className={inputClass} value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Organization name" /></Field>
            <Field label="Public Email"><input className={inputClass} type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="hello@organization.org" /></Field>
            <Field label="Website"><input className={inputClass} type="url" value={form.website_url} onChange={(e) => setForm((prev) => ({ ...prev, website_url: e.target.value }))} placeholder="https://organization.org" /></Field>
            <Field label="Phone"><input className={inputClass} value={form.contact_phone} onChange={(e) => setForm((prev) => ({ ...prev, contact_phone: e.target.value }))} placeholder="+855 ..." /></Field>
            <div className="md:col-span-2">
              <Field label="Description"><textarea className={`${inputClass} resize-y`} rows={5} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Tell students what your organization does and what opportunities it provides." /></Field>
            </div>
            <Field label="Facebook URL"><input className={inputClass} value={form.facebook_url} onChange={(e) => setForm((prev) => ({ ...prev, facebook_url: e.target.value }))} placeholder="https://facebook.com/..." /></Field>
            <Field label="Telegram URL"><input className={inputClass} value={form.telegram_url} onChange={(e) => setForm((prev) => ({ ...prev, telegram_url: e.target.value }))} placeholder="https://t.me/..." /></Field>
            <Field label="Instagram URL"><input className={inputClass} value={form.instagram_url} onChange={(e) => setForm((prev) => ({ ...prev, instagram_url: e.target.value }))} placeholder="https://instagram.com/..." /></Field>
            <Field label="LinkedIn URL"><input className={inputClass} value={form.linkedin_url} onChange={(e) => setForm((prev) => ({ ...prev, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/company/..." /></Field>
          </div>
          {message && <p className="mt-4 text-sm font-medium text-green-600">{message}</p>}
        </Panel>

        <div className="space-y-5">
          <Panel title="Branding">
            <div>
              <p className={labelClass}>Organization Logo</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-2xl text-slate-400">
                  {logoPreview || organization?.logo_url ? (
                    <img src={logoPreview || logoUrl(organization?.logo_url) || organization?.logo_url} alt="Organization logo" className="h-full w-full object-cover" />
                  ) : (
                    (organization?.name || user?.name || 'O').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="block w-full max-w-full text-sm text-slate-500" />
                  <p className="text-xs text-slate-400">Upload first, then save profile changes to publish the new logo.</p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Publishing Status">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={organization?.is_published ? 'green' : 'amber'}>{organization?.is_published ? 'Published' : 'Awaiting publication'}</StatusPill>
              <StatusPill tone={organization?.is_verified ? 'teal' : 'slate'}>{organization?.is_verified ? 'Verified' : 'Not verified'}</StatusPill>
              <StatusPill tone={user?.is_approved ? 'green' : 'amber'}>{user?.is_approved ? 'Approved owner' : 'Pending approval'}</StatusPill>
            </div>
            <p className="mt-3 text-sm text-slate-500">Publication and verification are controlled by admin review, but you can keep the page ready here.</p>
          </Panel>

          <Panel title="At a Glance">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <CalendarDays size={16} className="text-teal-700" />
                <span>Joined {user?.created_at ? formatDate(user.created_at) : 'recently'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-teal-700" />
                <span>{form.email || 'No public email set yet'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-teal-700" />
                <span>{form.contact_phone || 'No phone set yet'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe2 size={16} className="text-teal-700" />
                <span>{form.website_url || 'No website linked yet'}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </PageSection>
  );
}
