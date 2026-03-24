import { useCallback, useEffect, useState } from 'react';
import { organizationApi, uploadApi } from '@/api';
import { useToast } from '@/hooks';
import { coverUrl, formatDate, optimizeImageFile } from '@/utils';

const cardClass = 'bg-white border border-slate-200 rounded-2xl shadow-sm';
const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all';
const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5';
const primaryBtn = 'inline-flex items-center justify-center rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryBtn = 'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50';
const dangerBtn = 'inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100';
const MAX_UPLOAD_IMAGE_BYTES = 20 * 1024 * 1024;

const emptyNewsForm = {
  title: '',
  excerpt: '',
  content: '',
  category: '',
  tags: '',
  cover_url: '',
  image_urls: [],
  is_published: true,
  is_pinned: false,
};

function PageSection({ title, subtitle, children, action }) {
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

function Panel({ title, description, children }) {
  return (
    <section className={`${cardClass} p-5`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

function ModalPanel({ open, title, description, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-3 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close panel" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700" aria-label="Close panel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100">
      <span className={`relative h-5 w-9 rounded-full transition-all ${checked ? 'bg-[#0f766e]' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-4.5' : 'left-0.5'}`} />
      </span>
      {label}
    </button>
  );
}

export default function OrganizationNews() {
  const { success, error } = useToast();
  const [organization, setOrganization] = useState(null);
  const [news, setNews] = useState([]);
  const [form, setForm] = useState(emptyNewsForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newsModalOpen, setNewsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const mine = await organizationApi.getMine();
      const org = mine.data.organization;
      setOrganization(org);
      const newsRes = await organizationApi.getNews(org.id);
      setNews(newsRes.data.data || newsRes.data.rows || []);
    } catch {
      setOrganization(null);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const uploadImages = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = [];
      const preparedFiles = await Promise.all(files.map((file) => optimizeImageFile(file)));
      const validFiles = preparedFiles.filter((file) => file.size <= MAX_UPLOAD_IMAGE_BYTES);
      for (const file of validFiles) {
        const body = new FormData();
        body.append('image', file);
        const res = await uploadApi.image(body);
        if (res.data.url) urls.push(res.data.url);
      }
      setForm((prev) => {
        const image_urls = [...(prev.image_urls || []), ...urls];
        return { ...prev, image_urls, cover_url: image_urls[0] || '' };
      });
      if (urls.length) success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyNewsForm);
    setEditingId(null);
    setNewsModalOpen(false);
  };

  const startCreateNews = () => {
    setForm(emptyNewsForm);
    setEditingId(null);
    setNewsModalOpen(true);
  };

  const startEditNews = (item) => {
    setEditingId(item.id);
    setForm({
      ...emptyNewsForm,
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
      image_urls: Array.isArray(item.image_urls) ? item.image_urls : [],
    });
    setNewsModalOpen(true);
  };

  const submit = async () => {
    if (!organization?.id) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };
      if (editingId) {
        await organizationApi.updateNews(organization.id, editingId, payload);
        success('News updated');
      } else {
        await organizationApi.createNews(organization.id, payload);
        success('News created');
      }
      resetForm();
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save news');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!organization?.id) return;
    try {
      await organizationApi.deleteNews(organization.id, id);
      success('News deleted');
      if (editingId === id) resetForm();
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete news');
    }
  };

  return (
    <PageSection title="Organization News" subtitle="Publish updates and announcements just like the university dashboard does." action={<button type="button" onClick={startCreateNews} className={primaryBtn}>Create News</button>}>
      <ModalPanel
        open={newsModalOpen}
        onClose={resetForm}
        title={editingId ? 'Edit News Post' : 'Create News Post'}
        description="Only published posts appear on the public organization page."
      >
          <div className="space-y-4">
            <Field label="Title"><input className={inputClass} value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} /></Field>
            <Field label="Category"><input className={inputClass} value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} /></Field>
            <Field label="Excerpt"><textarea className={`${inputClass} resize-y`} rows={3} value={form.excerpt} onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))} /></Field>
            <Field label="Content"><textarea className={`${inputClass} resize-y`} rows={6} value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} /></Field>
            <Field label="Tags"><input className={inputClass} value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} placeholder="announcement, internship, youth" /></Field>
            <Field label="Images">
              <input type="file" accept="image/*" multiple onChange={(e) => uploadImages(Array.from(e.target.files || []))} className="block w-full text-sm text-slate-500" />
            </Field>
            {form.image_urls.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {form.image_urls.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    <img src={coverUrl(image) || image} alt="" className="h-32 w-full object-cover" />
                    <button type="button" onClick={() => setForm((prev) => {
                      const image_urls = prev.image_urls.filter((_, itemIndex) => itemIndex !== index);
                      return { ...prev, image_urls, cover_url: image_urls[0] || '' };
                    })} className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-xs font-semibold text-red-600">Remove</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <ToggleField label="Publish immediately" checked={form.is_published} onChange={(value) => setForm((prev) => ({ ...prev, is_published: value }))} />
              <ToggleField label="Pin this post" checked={form.is_pinned} onChange={(value) => setForm((prev) => ({ ...prev, is_pinned: value }))} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={submit} disabled={saving || uploading || !form.title.trim() || !form.content.trim()} className={primaryBtn}>{saving ? 'Saving...' : editingId ? 'Update News' : 'Publish News'}</button>
              <button type="button" onClick={resetForm} className={secondaryBtn}>Cancel</button>
            </div>
          </div>
      </ModalPanel>

      <Panel title="Published News" description={loading ? 'Loading news...' : `${news.length} post(s) found.`}>
          {news.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No news posts yet.
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200">
                  {item.cover_url ? <img src={coverUrl(item.cover_url) || item.cover_url} alt={item.title} className="h-40 w-full object-cover" /> : null}
                  <div className="p-4">
                    <div className="mb-2 flex flex-wrap gap-2">
                      {item.category ? <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1B3A6B]">{item.category}</span> : null}
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${item.is_published ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.published_at ? formatDate(item.published_at) : 'Not published yet'}</p>
                    {item.excerpt && <p className="mt-3 text-sm leading-6 text-slate-600">{item.excerpt}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => startEditNews(item)} className={secondaryBtn}>Edit</button>
                      <button type="button" onClick={() => remove(item.id)} className={dangerBtn}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </Panel>
    </PageSection>
  );
}
