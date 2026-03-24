import { useCallback, useEffect, useState } from 'react';
import { organizationApi } from '@/api';
import { useToast } from '@/hooks';

const cardClass = 'bg-white border border-slate-200 rounded-2xl shadow-sm';
const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10 transition-all';
const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5';
const primaryBtn = 'inline-flex items-center justify-center rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryBtn = 'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50';
const dangerBtn = 'inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100';

const emptyFaqForm = {
  question: '',
  answer: '',
  category: '',
  sort_order: 0,
  is_published: true,
};

const emptyContactForm = {
  general_email: '',
  general_phone: '',
  contact_person_name: '',
  contact_person_title: '',
  website_url: '',
  opportunities_url: '',
  whatsapp: '',
  telegram: '',
  facebook_page: '',
  instagram: '',
  linkedin: '',
  office_hours: '',
  address: '',
  map_embed_url: '',
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

function ModalPanel({ open, title, description, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-3 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close panel" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
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

export default function OrganizationFAQ() {
  const { success, error } = useToast();
  const [organization, setOrganization] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [contact, setContact] = useState(emptyContactForm);
  const [faqForm, setFaqForm] = useState(emptyFaqForm);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingFaq, setSavingFaq] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const mine = await organizationApi.getMine();
      const org = mine.data.organization;
      setOrganization(org);

      const [faqRes, contactRes] = await Promise.all([
        organizationApi.getFAQs(org.id).catch(() => ({ data: { faqs: [] } })),
        organizationApi.getContact(org.id).catch(() => ({ data: { contact: null } })),
      ]);
      setFaqs(faqRes.data.faqs || []);
      setContact({ ...emptyContactForm, ...(contactRes.data.contact || {}) });
    } catch {
      setOrganization(null);
      setFaqs([]);
      setContact(emptyContactForm);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetFaqForm = () => {
    setFaqForm(emptyFaqForm);
    setEditingFaqId(null);
    setFaqModalOpen(false);
  };

  const submitFaq = async () => {
    if (!organization?.id) return;
    setSavingFaq(true);
    try {
      const payload = { ...faqForm, sort_order: Number(faqForm.sort_order) || 0 };
      if (editingFaqId) {
        await organizationApi.updateFAQ(organization.id, editingFaqId, payload);
        success('FAQ updated');
      } else {
        await organizationApi.createFAQ(organization.id, payload);
        success('FAQ added');
      }
      resetFaqForm();
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setSavingFaq(false);
    }
  };

  const startCreateFaq = () => {
    setFaqForm(emptyFaqForm);
    setEditingFaqId(null);
    setFaqModalOpen(true);
  };

  const startEditFaq = (faq) => {
    setEditingFaqId(faq.id);
    setFaqForm({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || '',
      sort_order: faq.sort_order || 0,
      is_published: Boolean(faq.is_published),
    });
    setFaqModalOpen(true);
  };

  const deleteFaq = async (id) => {
    if (!organization?.id) return;
    try {
      await organizationApi.deleteFAQ(organization.id, id);
      success('FAQ deleted');
      if (editingFaqId === id) resetFaqForm();
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete FAQ');
    }
  };

  const saveContact = async () => {
    if (!organization?.id) return;
    setSavingContact(true);
    try {
      await organizationApi.upsertContact(organization.id, contact);
      success('Contact details updated');
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update contact');
    } finally {
      setSavingContact(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20 text-sm text-slate-500">Loading FAQs and contact...</div>;
  }

  return (
    <PageSection title="FAQs & Contact" subtitle="Answer common questions and keep public contact details up to date, just like the university dashboard.">
      <div className="mb-5">
        <button type="button" onClick={startCreateFaq} className={primaryBtn}>Create FAQ</button>
      </div>

      <ModalPanel
        open={faqModalOpen}
        onClose={resetFaqForm}
        title={editingFaqId ? 'Edit FAQ' : 'Create FAQ'}
        description="Keep answers short, clear, and useful for applicants."
      >
        <div className="space-y-4">
          <Field label="Question"><input className={inputClass} value={faqForm.question} onChange={(e) => setFaqForm((prev) => ({ ...prev, question: e.target.value }))} /></Field>
          <Field label="Answer"><textarea className={`${inputClass} resize-y`} rows={5} value={faqForm.answer} onChange={(e) => setFaqForm((prev) => ({ ...prev, answer: e.target.value }))} /></Field>
          <Field label="Category"><input className={inputClass} value={faqForm.category} onChange={(e) => setFaqForm((prev) => ({ ...prev, category: e.target.value }))} /></Field>
          <Field label="Sort Order"><input className={inputClass} type="number" value={faqForm.sort_order} onChange={(e) => setFaqForm((prev) => ({ ...prev, sort_order: e.target.value }))} /></Field>
          <ToggleField label="Publish immediately" checked={faqForm.is_published} onChange={(value) => setFaqForm((prev) => ({ ...prev, is_published: value }))} />
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={submitFaq} disabled={savingFaq || !faqForm.question.trim() || !faqForm.answer.trim()} className={primaryBtn}>{savingFaq ? 'Saving...' : editingFaqId ? 'Update FAQ' : 'Add FAQ'}</button>
            <button type="button" onClick={resetFaqForm} className={secondaryBtn}>Cancel</button>
          </div>
        </div>
      </ModalPanel>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Contact Details" action={<button type="button" onClick={saveContact} disabled={savingContact} className={primaryBtn}>{savingContact ? 'Saving...' : 'Save Contact'}</button>}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="General Email"><input className={inputClass} value={contact.general_email} onChange={(e) => setContact((prev) => ({ ...prev, general_email: e.target.value }))} /></Field>
            <Field label="General Phone"><input className={inputClass} value={contact.general_phone} onChange={(e) => setContact((prev) => ({ ...prev, general_phone: e.target.value }))} /></Field>
            <Field label="Contact Person"><input className={inputClass} value={contact.contact_person_name} onChange={(e) => setContact((prev) => ({ ...prev, contact_person_name: e.target.value }))} /></Field>
            <Field label="Contact Title"><input className={inputClass} value={contact.contact_person_title} onChange={(e) => setContact((prev) => ({ ...prev, contact_person_title: e.target.value }))} /></Field>
            <Field label="Website"><input className={inputClass} value={contact.website_url} onChange={(e) => setContact((prev) => ({ ...prev, website_url: e.target.value }))} /></Field>
            <Field label="Opportunity Link"><input className={inputClass} value={contact.opportunities_url} onChange={(e) => setContact((prev) => ({ ...prev, opportunities_url: e.target.value }))} /></Field>
            <Field label="WhatsApp"><input className={inputClass} value={contact.whatsapp} onChange={(e) => setContact((prev) => ({ ...prev, whatsapp: e.target.value }))} /></Field>
            <Field label="Telegram"><input className={inputClass} value={contact.telegram} onChange={(e) => setContact((prev) => ({ ...prev, telegram: e.target.value }))} /></Field>
            <Field label="Facebook"><input className={inputClass} value={contact.facebook_page} onChange={(e) => setContact((prev) => ({ ...prev, facebook_page: e.target.value }))} /></Field>
            <Field label="Instagram"><input className={inputClass} value={contact.instagram} onChange={(e) => setContact((prev) => ({ ...prev, instagram: e.target.value }))} /></Field>
            <Field label="LinkedIn"><input className={inputClass} value={contact.linkedin} onChange={(e) => setContact((prev) => ({ ...prev, linkedin: e.target.value }))} /></Field>
            <Field label="Office Hours"><input className={inputClass} value={contact.office_hours} onChange={(e) => setContact((prev) => ({ ...prev, office_hours: e.target.value }))} /></Field>
            <div className="md:col-span-2">
              <Field label="Address"><textarea className={`${inputClass} resize-y`} rows={3} value={contact.address} onChange={(e) => setContact((prev) => ({ ...prev, address: e.target.value }))} /></Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Map Embed URL"><textarea className={`${inputClass} resize-y`} rows={3} value={contact.map_embed_url} onChange={(e) => setContact((prev) => ({ ...prev, map_embed_url: e.target.value }))} /></Field>
            </div>
          </div>
        </Panel>

        <Panel title="FAQ Editor" description="Use the create button above to add a new FAQ, or edit an existing one from the list." />
      </div>

      <Panel title="Published FAQs" description={`${faqs.length} FAQ item(s) for this organization.`}>
        {faqs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            No FAQs yet.
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold leading-8 text-slate-800">Q{index + 1}. {faq.question}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {faq.category ? <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1B3A6B]">{faq.category}</span> : null}
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${faq.is_published ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                        {faq.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:shrink-0">
                    <button type="button" onClick={() => startEditFaq(faq)} className={secondaryBtn}>Edit</button>
                    <button type="button" onClick={() => deleteFaq(faq.id)} className={dangerBtn}>Delete</button>
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
