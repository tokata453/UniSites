import { useCallback, useEffect, useState } from 'react';
import { opportunityApi, uploadApi } from '@/api';
import { Spinner } from '@/components/common';
import { useToast } from '@/hooks';
import { coverUrl, formatDate, optimizeImageFile } from '@/utils';

const cardClass = 'bg-white border border-slate-200 rounded-2xl shadow-sm';
const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all';
const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5';
const primaryBtn = 'inline-flex items-center justify-center rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryBtn = 'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50';
const dangerBtn = 'inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100';

const TYPE_OPTIONS = [
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'internship', label: 'Internship' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'competition', label: 'Competition' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'research', label: 'Research' },
  { value: 'parttime', label: 'Part-time' },
  { value: 'volunteer', label: 'Volunteer' },
];

const MAX_UPLOAD_IMAGE_BYTES = 20 * 1024 * 1024;

const emptyForm = {
  title: '',
  description: '',
  cover_url: '',
  image_urls: [],
  type: 'scholarship',
  deadline: '',
  start_date: '',
  end_date: '',
  eligibility: '',
  field_of_study: '',
  country: '',
  location: '',
  source: 'external',
  source_url: '',
  application_url: '',
  contact_email: '',
  funding_amount: '',
  funding_currency: 'USD',
  is_fully_funded: false,
  is_online: false,
};

function Section({ title, subtitle, action, children }) {
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

function Field({ label, children, hint }) {
  return (
    <label className="block">
      {label && <span className={labelClass}>{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function ImageUploadField({ values = [], onUpload, uploading, onRemove }) {
  return (
    <Field label="Images" hint="Recommended for feed cards and opportunity detail pages.">
      <div className="space-y-3">
        {values.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {values.map((value, index) => (
              <div key={`${value}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img src={coverUrl(value) || value} alt={`Upload ${index + 1}`} className="h-36 w-full object-cover" />
                <div className="absolute left-3 top-3 rounded-full bg-slate-900/70 px-2 py-1 text-[11px] font-semibold text-white">
                  {index === 0 ? 'Main' : `Image ${index + 1}`}
                </div>
                <button type="button" onClick={() => onRemove?.(index)} className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-red-600 shadow-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
            No images uploaded yet
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <label className={secondaryBtn}>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onUpload?.(Array.from(e.target.files || []), e)}
              disabled={uploading}
            />
            {uploading ? 'Uploading...' : values.length ? 'Add More Images' : 'Upload Images'}
          </label>
        </div>
      </div>
    </Field>
  );
}

function OpportunityImageCarousel({ item, imageIndex, onPrev, onNext }) {
  const images = Array.isArray(item.image_urls) && item.image_urls.length
    ? item.image_urls
    : item.cover_url
    ? [item.cover_url]
    : [];

  if (!images.length) return null;

  const currentIndex = Math.min(imageIndex ?? 0, images.length - 1);
  const currentImage = images[currentIndex];

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex h-56 items-center justify-center bg-slate-50 p-2 md:h-72">
        <img src={coverUrl(currentImage) || currentImage} alt={item.title} className="h-full w-full object-contain" />
      </div>
      {images.length > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2">
          <button type="button" onClick={onPrev} className={secondaryBtn}>
            Prev
          </button>
          <span className="text-xs font-medium text-slate-500">
            {currentIndex + 1} / {images.length}
          </span>
          <button type="button" onClick={onNext} className={secondaryBtn}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100"
    >
      <span className={`relative h-5 w-9 rounded-full transition-all ${checked ? 'bg-[#0f766e]' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-4.5' : 'left-0.5'}`} />
      </span>
      {label}
    </button>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className={`${cardClass} p-10 text-center`}>
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export default function OrganizationOpportunities() {
  const { success, error } = useToast();
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [imageIndexes, setImageIndexes] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadOpportunities = useCallback(async () => {
    setItemsLoading(true);
    try {
      const res = await opportunityApi.getMine();
      setItems(res.data.opportunities || []);
    } catch {
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      ...emptyForm,
      ...item,
      image_urls: Array.isArray(item.image_urls) && item.image_urls.length
        ? item.image_urls
        : item.cover_url
        ? [item.cover_url]
        : [],
      field_of_study: Array.isArray(item.field_of_study) ? item.field_of_study.join(', ') : '',
      deadline: item.deadline || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (files) => {
    if (!files?.length) return;
    setUploadingCover(true);
    const urls = [];
    const failures = [];
    try {
      const preparedFiles = await Promise.all(files.map((file) => optimizeImageFile(file)));
      const validFiles = preparedFiles.filter((file) => file.size <= MAX_UPLOAD_IMAGE_BYTES);
      const oversizedFiles = preparedFiles.filter((file) => file.size > MAX_UPLOAD_IMAGE_BYTES);
      if (oversizedFiles.length > 0) {
        error(`${oversizedFiles.length} image${oversizedFiles.length > 1 ? 's are' : ' is'} over 20MB even after compression and was skipped`);
      }
      if (!validFiles.length) return;

      for (const file of validFiles) {
        const body = new FormData();
        body.append('image', file);
        try {
          const res = await uploadApi.image(body);
          if (res.data.url) urls.push(res.data.url);
        } catch (err) {
          failures.push(err.response?.data?.message || file.name || 'Upload failed');
        }
      }
      if (urls.length > 0) {
        setForm((prev) => {
          const image_urls = [...(prev.image_urls || []), ...urls];
          return { ...prev, image_urls, cover_url: image_urls[0] || '' };
        });
        success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
      }
      if (failures.length > 0) {
        error(`${failures.length} image${failures.length > 1 ? 's were' : ' was'} skipped`);
      }
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        image_urls: Array.isArray(form.image_urls) ? form.image_urls : [],
        cover_url: Array.isArray(form.image_urls) && form.image_urls.length ? form.image_urls[0] : form.cover_url || null,
        field_of_study: form.field_of_study
          ? form.field_of_study.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
        deadline: form.deadline || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };

      if (editingId) {
        await opportunityApi.update(editingId, payload);
        success('Opportunity updated');
      } else {
        await opportunityApi.create(payload);
        success('Opportunity submitted for review');
      }

      resetForm();
      loadOpportunities();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save opportunity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await opportunityApi.remove(id);
      success('Opportunity deleted');
      if (editingId === id) resetForm();
      loadOpportunities();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete opportunity');
    }
  };

  const cycleItemImage = (item, direction) => {
    const images = Array.isArray(item.image_urls) && item.image_urls.length
      ? item.image_urls
      : item.cover_url
      ? [item.cover_url]
      : [];
    if (images.length <= 1) return;

    setImageIndexes((prev) => {
      const current = prev[item.id] ?? 0;
      const next = (current + direction + images.length) % images.length;
      return { ...prev, [item.id]: next };
    });
  };

  return (
    <Section
      title="Organization Opportunities"
      subtitle="Create and manage official scholarships, internships, programs, and events from your organization."
      action={editingId ? <button type="button" onClick={resetForm} className={secondaryBtn}>Cancel Editing</button> : null}
    >
      <div className="grid gap-5 xl:grid-cols-[1.05fr_1.2fr]">
        <Panel
          title={editingId ? 'Edit Opportunity' : 'Create Opportunity'}
          description="Organization-created opportunities are reviewed before public publication."
          action={<button type="button" onClick={handleSave} disabled={saving} className={primaryBtn}>{saving ? 'Saving...' : editingId ? 'Update Opportunity' : 'Create Opportunity'}</button>}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Title">
                <input className={inputClass} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Scholarship, internship, or program title" />
              </Field>
            </div>
            <Field label="Type">
              <select className={inputClass} value={form.type} onChange={(e) => setField('type', e.target.value)}>
                {TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Country">
              <input className={inputClass} value={form.country} onChange={(e) => setField('country', e.target.value)} placeholder="Cambodia" />
            </Field>
            <Field label="Location">
              <input className={inputClass} value={form.location} onChange={(e) => setField('location', e.target.value)} placeholder="Phnom Penh or Online" />
            </Field>
            <Field label="Contact Email">
              <input className={inputClass} value={form.contact_email} onChange={(e) => setField('contact_email', e.target.value)} placeholder="opportunities@org.org" />
            </Field>
            <Field label="Deadline"><input type="date" className={inputClass} value={form.deadline} onChange={(e) => setField('deadline', e.target.value)} /></Field>
            <Field label="Start Date"><input type="date" className={inputClass} value={form.start_date} onChange={(e) => setField('start_date', e.target.value)} /></Field>
            <Field label="End Date"><input type="date" className={inputClass} value={form.end_date} onChange={(e) => setField('end_date', e.target.value)} /></Field>
            <Field label="Funding Amount"><input className={inputClass} value={form.funding_amount} onChange={(e) => setField('funding_amount', e.target.value)} placeholder="Up to 5,000" /></Field>
            <Field label="Funding Currency"><input className={inputClass} value={form.funding_currency} onChange={(e) => setField('funding_currency', e.target.value)} placeholder="USD" /></Field>
            <div className="md:col-span-2">
              <Field label="Field of Study" hint="Separate multiple fields with commas.">
                <input className={inputClass} value={form.field_of_study} onChange={(e) => setField('field_of_study', e.target.value)} placeholder="Public Health, Education, Engineering" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Eligibility"><textarea rows={4} className={`${inputClass} resize-y`} value={form.eligibility} onChange={(e) => setField('eligibility', e.target.value)} placeholder="Who can apply and what they need to qualify" /></Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Description"><textarea rows={6} className={`${inputClass} resize-y`} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Describe the opportunity, benefits, and application details" /></Field>
            </div>
            <div className="md:col-span-2">
              <ImageUploadField
                values={form.image_urls}
                uploading={uploadingCover}
                onUpload={(files, event) => {
                  handleImageUpload(files);
                  if (event?.target) event.target.value = '';
                }}
                onRemove={(index) => setForm((prev) => {
                  const image_urls = (prev.image_urls || []).filter((_, itemIndex) => itemIndex !== index);
                  return { ...prev, image_urls, cover_url: image_urls[0] || '' };
                })}
              />
            </div>
            <Field label="Application URL"><input className={inputClass} value={form.application_url} onChange={(e) => setField('application_url', e.target.value)} placeholder="https://..." /></Field>
            <Field label="Source URL"><input className={inputClass} value={form.source_url} onChange={(e) => setField('source_url', e.target.value)} placeholder="Optional source link" /></Field>
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <ToggleField label="Fully funded" checked={!!form.is_fully_funded} onChange={(value) => setField('is_fully_funded', value)} />
              <ToggleField label="Online opportunity" checked={!!form.is_online} onChange={(value) => setField('is_online', value)} />
            </div>
          </div>
        </Panel>

        <Panel title="Your Opportunities" description={`${items.length} opportunity listing(s) created by your account.`}>
          {itemsLoading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : items.length === 0 ? (
            <EmptyState title="No opportunities yet" description="Create your first official opportunity from the form on the left." />
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <OpportunityImageCarousel
                    item={item}
                    imageIndex={imageIndexes[item.id] ?? 0}
                    onPrev={() => cycleItemImage(item, -1)}
                    onNext={() => cycleItemImage(item, 1)}
                  />
                  <p className="text-2xl font-bold leading-tight text-slate-800">{item.title}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${item.is_published ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {item.is_published ? 'Published' : 'Pending review'}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                      {item.type}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                    {item.deadline && <span>Deadline: {formatDate(item.deadline)}</span>}
                    {item.country && <span>Country: {item.country}</span>}
                    <span>Applicants: {item.applicant_count || 0}</span>
                    <span>Views: {item.views_count || 0}</span>
                  </div>
                  {item.description && <p className="mt-3 max-w-4xl text-base leading-8 text-slate-600 line-clamp-3">{item.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEdit(item)} className={secondaryBtn}>Edit</button>
                    <button type="button" onClick={() => handleDelete(item.id)} className={dangerBtn}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </Section>
  );
}
