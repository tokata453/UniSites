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

const emptyForm = {
  title: '',
  description: '',
  cover_url: '',
  image_urls: [],
  event_date: '',
  end_date: '',
  location: '',
  type: 'other',
  is_online: false,
  meeting_url: '',
  registration_url: '',
  registration_deadline: '',
  max_participants: '',
  is_published: true,
  is_featured: false,
};

function PageSection({ title, subtitle, children }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
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

export default function OrganizationEvents() {
  const { success, error } = useToast();
  const [organization, setOrganization] = useState(null);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const mine = await organizationApi.getMine();
      const org = mine.data.organization;
      setOrganization(org);
      const eventRes = await organizationApi.getEvents(org.id);
      setEvents(eventRes.data.data || eventRes.data.rows || []);
    } catch {
      setOrganization(null);
      setEvents([]);
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
    setForm(emptyForm);
    setEditingId(null);
    setEventModalOpen(false);
  };

  const startCreateEvent = () => {
    setForm(emptyForm);
    setEditingId(null);
    setEventModalOpen(true);
  };

  const startEditEvent = (item) => {
    setEditingId(item.id);
    setForm({
      ...emptyForm,
      ...item,
      image_urls: Array.isArray(item.image_urls) ? item.image_urls : [],
      event_date: item.event_date ? new Date(item.event_date).toISOString().slice(0, 16) : '',
      end_date: item.end_date ? new Date(item.end_date).toISOString().slice(0, 16) : '',
      registration_deadline: item.registration_deadline ? new Date(item.registration_deadline).toISOString().slice(0, 16) : '',
      max_participants: item.max_participants ?? '',
    });
    setEventModalOpen(true);
  };

  const submit = async () => {
    if (!organization?.id) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        max_participants: form.max_participants ? Number(form.max_participants) : null,
      };
      if (editingId) {
        await organizationApi.updateEvent(organization.id, editingId, payload);
        success('Event updated');
      } else {
        await organizationApi.createEvent(organization.id, payload);
        success('Event created');
      }
      resetForm();
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!organization?.id) return;
    try {
      await organizationApi.deleteEvent(organization.id, id);
      success('Event deleted');
      if (editingId === id) resetForm();
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete event');
    }
  };

  return (
    <PageSection title="Organization Events" subtitle="Manage upcoming sessions, workshops, and public activities like the university dashboard.">
      <div className="mb-5">
        <button type="button" onClick={startCreateEvent} className={primaryBtn}>Create Event</button>
      </div>
      <ModalPanel
        open={eventModalOpen}
        onClose={resetForm}
        title={editingId ? 'Edit Event' : 'Create Event'}
        description="Published events appear on the public organization page."
      >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title"><input className={inputClass} value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} /></Field>
            <Field label="Type"><input className={inputClass} value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))} placeholder="workshop, seminar, competition" /></Field>
            <Field label="Event Date"><input className={inputClass} type="datetime-local" value={form.event_date} onChange={(e) => setForm((prev) => ({ ...prev, event_date: e.target.value }))} /></Field>
            <Field label="End Date"><input className={inputClass} type="datetime-local" value={form.end_date} onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))} /></Field>
            <Field label="Location"><input className={inputClass} value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} /></Field>
            <Field label="Meeting URL"><input className={inputClass} value={form.meeting_url} onChange={(e) => setForm((prev) => ({ ...prev, meeting_url: e.target.value }))} /></Field>
            <Field label="Registration URL"><input className={inputClass} value={form.registration_url} onChange={(e) => setForm((prev) => ({ ...prev, registration_url: e.target.value }))} /></Field>
            <Field label="Registration Deadline"><input className={inputClass} type="datetime-local" value={form.registration_deadline} onChange={(e) => setForm((prev) => ({ ...prev, registration_deadline: e.target.value }))} /></Field>
            <Field label="Max Participants"><input className={inputClass} type="number" value={form.max_participants} onChange={(e) => setForm((prev) => ({ ...prev, max_participants: e.target.value }))} /></Field>
            <div className="md:col-span-2">
              <Field label="Description"><textarea className={`${inputClass} resize-y`} rows={5} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} /></Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Images"><input type="file" accept="image/*" multiple onChange={(e) => uploadImages(Array.from(e.target.files || []))} className="block w-full text-sm text-slate-500" /></Field>
            </div>
          </div>
          {form.image_urls.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
          <div className="mt-4 flex flex-wrap gap-3">
            <ToggleField label="Online event" checked={form.is_online} onChange={(value) => setForm((prev) => ({ ...prev, is_online: value }))} />
            <ToggleField label="Publish immediately" checked={form.is_published} onChange={(value) => setForm((prev) => ({ ...prev, is_published: value }))} />
            <ToggleField label="Feature this event" checked={form.is_featured} onChange={(value) => setForm((prev) => ({ ...prev, is_featured: value }))} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={submit} disabled={saving || uploading || !form.title.trim() || !form.event_date} className={primaryBtn}>{saving ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}</button>
            <button type="button" onClick={resetForm} className={secondaryBtn}>Cancel</button>
          </div>
      </ModalPanel>

      <Panel title="Published Events" description={loading ? 'Loading events...' : `${events.length} event(s) found.`}>
          {events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No events yet.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200">
                  {item.cover_url ? <img src={coverUrl(item.cover_url) || item.cover_url} alt={item.title} className="h-40 w-full object-cover" /> : null}
                  <div className="p-4">
                    <div className="mb-2 flex flex-wrap gap-2">
                      {item.type ? <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1B3A6B] capitalize">{item.type}</span> : null}
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${item.is_published ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.event_date ? formatDate(item.event_date) : 'No date set'}</p>
                    {item.description && <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => startEditEvent(item)} className={secondaryBtn}>Edit</button>
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
