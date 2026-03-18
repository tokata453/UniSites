import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/api';
import { Badge, SearchBar, Select, ActionBtn, DeleteBtn, Table, Pagination, PageHeader, Card, FilterBar, ConfirmModal, Toast, ToggleSwitch, IC } from './AdminShared';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'international', label: 'International' },
];
const PUB_OPTIONS = [{ value: '', label: 'All Status' }, { value: 'true', label: 'Published' }, { value: 'false', label: 'Unpublished' }];
const TYPE_COLORS = { public: '#1d4ed8', private: '#15803d', international: '#7c3aed' };
const TYPE_BG     = { public: '#eff6ff',  private: '#f0fdf4',  international: '#faf5ff' };

const PROVINCES = ['Phnom Penh','Siem Reap','Battambang','Kampong Cham','Kandal','Kampot','Sihanoukville','Other'];
const UNIVERSITY_TYPE_OPTIONS = [
  { value: '', label: 'Select type...' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'international', label: 'International' },
];
const PROVINCE_OPTIONS = [
  { value: '', label: 'Select province...' },
  ...PROVINCES.map((province) => ({ value: province, label: province })),
];

const Field = ({ label, required, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text' }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: '100%', padding: '9px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, color: '#1e293b', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box', transition: 'border-color 0.15s' }}
    onFocus={e => e.target.style.borderColor = '#1B3A6B'}
    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ width: '100%', padding: '9px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, color: '#1e293b', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box', resize: 'vertical', transition: 'border-color 0.15s' }}
    onFocus={e => e.target.style.borderColor = '#1B3A6B'}
    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
  />
);

const CheckboxField = ({ label, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
    <div onClick={onChange}
      style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked ? '#1B3A6B' : '#cbd5e1'}`, background: checked ? '#1B3A6B' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}>
      {checked && <IC d="M20 6L9 17l-5-5" size={11} stroke="#fff" />}
    </div>
    <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{label}</span>
  </label>
);

// ── University Modal ──────────────────────────────────────────────────────────
function UniversityModal({ mode = 'create', university = null, onClose, onSuccess, showToast }) {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [ownerSearch,  setOwnerSearch]  = useState('');
  const [ownerResults, setOwnerResults] = useState([]);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [form, setForm] = useState({
    name: university?.name || '',
    university_type: university?.type || university?.university_type || '',
    province: university?.province || '',
    description: university?.description || '',
    website_url: university?.website_url || '',
    email: university?.email || '',
    phone: university?.phone || '',
    facebook_url: university?.facebook_url || '',
    tuition_min: university?.tuition_min || '',
    tuition_max: university?.tuition_max || '',
    founded_year: university?.founded_year || '',
    student_count: university?.student_count || '',
    scholarship_available: Boolean(university?.scholarship_available),
    dormitory_available: Boolean(university?.dormitory_available),
    international_students: Boolean(university?.international_students),
    owner_id: university?.owner_id || university?.Owner?.id || '',
    owner_name: university?.Owner?.name || '',
  });

  const set = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

  useEffect(() => {
    if (ownerSearch.trim().length < 1) { setOwnerResults([]); return; }
    setOwnerLoading(true);
    adminApi.getUsers({ search: ownerSearch, role: 'owner', limit: 5 })
      .then(r => setOwnerResults(r.data.users || []))
      .catch(() => setOwnerResults([]))
      .finally(() => setOwnerLoading(false));
  }, [ownerSearch]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name = 'Name is required';
    if (!form.university_type)     e.university_type = 'Type is required';
    if (!form.province)            e.province = 'Province is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        type: form.university_type || null,
        university_type: form.university_type || null,
        tuition_min:   form.tuition_min   ? Number(form.tuition_min)   : null,
        tuition_max:   form.tuition_max   ? Number(form.tuition_max)   : null,
        founded_year:  form.founded_year  ? Number(form.founded_year)  : null,
        student_count: form.student_count ? Number(form.student_count) : null,
        owner_id:      form.owner_id      || null,
      };

      if (mode === 'edit' && university?.id) {
        await adminApi.updateUniversity(university.id, payload);
        showToast(`"${form.name}" updated successfully`);
      } else {
        await adminApi.createUniversity(payload);
        showToast(`"${form.name}" created successfully`);
      }
      onSuccess();
      onClose();
    } catch (e) {
      showToast(e.response?.data?.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} university`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Syne',sans-serif" }}>{mode === 'edit' ? 'Edit University' : 'Create University'}</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>{mode === 'edit' ? 'Update university details and ownership' : 'Add a new university to the platform'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 6, borderRadius: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <IC d="M18 6L6 18M6 6l12 12" size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Basic info */}
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#1B3A6B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>Basic Information</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Field label="University Name" required>
                  <Input value={form.name} onChange={set('name')} placeholder="e.g. Royal University of Phnom Penh" />
                  {errors.name && <p style={{ fontSize: 11, color: '#ef4444', margin: '3px 0 0' }}>{errors.name}</p>}
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Type" required>
                    <Select value={form.university_type} onChange={set('university_type')} options={UNIVERSITY_TYPE_OPTIONS} style={{ width: '100%' }} />
                    {errors.university_type && <p style={{ fontSize: 11, color: '#ef4444', margin: '3px 0 0' }}>{errors.university_type}</p>}
                  </Field>
                  <Field label="Province" required>
                    <Select value={form.province} onChange={set('province')} options={PROVINCE_OPTIONS} style={{ width: '100%' }} />
                    {errors.province && <p style={{ fontSize: 11, color: '#ef4444', margin: '3px 0 0' }}>{errors.province}</p>}
                  </Field>
                </div>
                <Field label="Description">
                  <Textarea value={form.description} onChange={set('description')} placeholder="Brief description of the university..." rows={3} />
                </Field>
              </div>
            </div>

            {/* Contact */}
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#1B3A6B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>Contact & Links</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Website URL"><Input value={form.website_url} onChange={set('website_url')} placeholder="https://www.university.edu.kh" /></Field>
                <Field label="Email"><Input value={form.email} onChange={set('email')} placeholder="info@university.edu.kh" type="email" /></Field>
                <Field label="Phone"><Input value={form.phone} onChange={set('phone')} placeholder="+855 23 000 000" /></Field>
                <Field label="Facebook URL"><Input value={form.facebook_url} onChange={set('facebook_url')} placeholder="https://facebook.com/university" /></Field>
              </div>
            </div>

            {/* Stats */}
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#1B3A6B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Tuition Min (USD)"><Input value={form.tuition_min} onChange={set('tuition_min')} placeholder="e.g. 500" type="number" /></Field>
                <Field label="Tuition Max (USD)"><Input value={form.tuition_max} onChange={set('tuition_max')} placeholder="e.g. 2000" type="number" /></Field>
                <Field label="Founded Year"><Input value={form.founded_year} onChange={set('founded_year')} placeholder="e.g. 1960" type="number" /></Field>
                <Field label="Student Count"><Input value={form.student_count} onChange={set('student_count')} placeholder="e.g. 5000" type="number" /></Field>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
                <CheckboxField label="Has Scholarship"    checked={form.scholarship_available}  onChange={() => set('scholarship_available')(!form.scholarship_available)} />
                <CheckboxField label="Has Dormitory"      checked={form.dormitory_available}     onChange={() => set('dormitory_available')(!form.dormitory_available)} />
                <CheckboxField label="Intl. Students"     checked={form.international_students}  onChange={() => set('international_students')(!form.international_students)} />
              </div>
            </div>

            {/* Owner assignment */}
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#1B3A6B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>Assign Owner <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span></p>
              {form.owner_id ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1B3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                      {form.owner_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1B3A6B' }}>{form.owner_name}</div>
                      <div style={{ fontSize: 11, color: '#3b82f6' }}>Owner assigned</div>
                    </div>
                  </div>
                  <button onClick={() => setForm(p => ({ ...p, owner_id: '', owner_name: '' }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18, lineHeight: 1 }}>×</button>
                </div>
              ) : (
                <>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                      <IC d="M21 21l-4.35-4.35 M11 19a8 8 0 100-16 8 8 0 000 16z" size={14} />
                    </div>
                    <input value={ownerSearch} onChange={e => setOwnerSearch(e.target.value)} placeholder="Search by owner name or email..."
                      style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 9, color: '#1e293b', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#1B3A6B'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  {ownerLoading && <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0', textAlign: 'center' }}>Searching...</p>}
                  {ownerResults.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {ownerResults.map(o => (
                        <div key={o.id} onClick={() => { setForm(p => ({ ...p, owner_id: o.id, owner_name: o.name })); setOwnerSearch(''); setOwnerResults([]); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', transition: 'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1B3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {o.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{o.name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{o.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{mode === 'edit' ? 'Changes apply immediately after saving' : 'University will be created as unpublished'}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving}
              style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: saving ? '#e2e8f0' : '#1B3A6B', color: saving ? '#94a3b8' : '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#15305a'; }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#1B3A6B'; }}>
              {saving ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : '+ Create University')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Transfer Ownership Modal ──────────────────────────────────────────────────
function TransferOwnerModal({ university, onClose, onSuccess, showToast }) {
  const [search,    setSearch]    = useState('');
  const [owners,    setOwners]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [saving,    setSaving]    = useState(false);

  // Search owner-role users
  useEffect(() => {
    if (search.trim().length < 1) { setOwners([]); return; }
    setLoading(true);
    adminApi.getUsers({ search, role: 'owner', limit: 8 })
      .then(r => setOwners(r.data.users || []))
      .catch(() => setOwners([]))
      .finally(() => setLoading(false));
  }, [search]);

  const handleTransfer = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminApi.updateUniversity(university.id, { owner_id: selected.id });
      showToast(`Ownership transferred to ${selected.name}`);
      onSuccess();
      onClose();
    } catch {
      showToast('Transfer failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', fontFamily: "'Syne',sans-serif" }}>Transfer Ownership</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
              Currently owned by <strong style={{ color: '#1B3A6B' }}>{university.Owner?.name || 'No owner'}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <IC d="M18 6L6 18M6 6l12 12" size={18} />
          </button>
        </div>

        {/* University info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: TYPE_BG[university.type] || '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
            {university.logo_url
              ? <img src={university.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.style.display='none'} />
              : '🏛️'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{university.name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{university.province}</div>
          </div>
        </div>

        {/* Search owners */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Search University Owner
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <IC d="M21 21l-4.35-4.35 M11 19a8 8 0 100-16 8 8 0 000 16z" size={15} />
            </div>
            <input
              value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }}
              placeholder="Type owner name or email..."
              style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#1e293b', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#1B3A6B'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>

        {/* Owner results */}
        <div style={{ minHeight: 120, marginBottom: 20 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, color: '#94a3b8', fontSize: 13 }}>
              Searching...
            </div>
          ) : search.trim().length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 80, color: '#94a3b8', gap: 6 }}>
              <IC d="M21 21l-4.35-4.35 M11 19a8 8 0 100-16 8 8 0 000 16z" size={22} />
              <span style={{ fontSize: 12 }}>Search for an owner-role user</span>
            </div>
          ) : owners.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, color: '#94a3b8', fontSize: 13 }}>
              No owners found for "{search}"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {owners.map(owner => {
                const isSelected = selected?.id === owner.id;
                const isCurrent  = owner.id === university.owner_id;
                return (
                  <div key={owner.id} onClick={() => !isCurrent && setSelected(isSelected ? null : owner)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1px solid ${isSelected ? '#1B3A6B' : '#e2e8f0'}`, background: isSelected ? '#eff6ff' : isCurrent ? '#f8fafc' : '#fff', cursor: isCurrent ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: isCurrent ? 0.6 : 1 }}
                    onMouseEnter={e => { if (!isCurrent && !isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!isCurrent && !isSelected) e.currentTarget.style.background = '#fff'; }}>
                    {/* Avatar */}
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: isSelected ? '#1B3A6B' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: isSelected ? '#fff' : '#64748b', flexShrink: 0, transition: 'all 0.15s' }}>
                      {owner.avatar_url
                        ? <img src={owner.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => e.target.style.display='none'} />
                        : owner.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#1B3A6B' : '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {owner.name}
                        {isCurrent && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600 }}>Current</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{owner.email}</div>
                    </div>
                    {isSelected && (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#1B3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IC d="M20 6L9 17l-5-5" size={11} stroke="#fff" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected summary */}
        {selected && (
          <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, marginBottom: 16, fontSize: 12, color: '#15803d', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IC d="M20 6L9 17l-5-5" size={14} stroke="#15803d" />
            Transfer to <strong>{selected.name}</strong> ({selected.email})
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={handleTransfer} disabled={!selected || saving}
            style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: selected && !saving ? '#1B3A6B' : '#e2e8f0', color: selected && !saving ? '#fff' : '#94a3b8', cursor: selected && !saving ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
            {saving && <IC d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" size={13} />}
            {saving ? 'Transferring...' : '🔄 Transfer Ownership'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AdminUniversities ─────────────────────────────────────────────────────────
export default function AdminUniversities() {
  const [unis,       setUnis]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [pages,      setPages]      = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [type,       setType]       = useState('');
  const [pub,        setPub]        = useState('');
  const [toast,      setToast]      = useState('');
  const [confirm,    setConfirm]    = useState(null);
  const [transferUni, setTransferUni] = useState(null);
  const [editingUni,  setEditingUni]  = useState(null);
  const [showCreate,  setShowCreate]  = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getUniversities({ page, limit: 12, search: search || undefined, type: type || undefined, published: pub || undefined })
      .then(r => { setUnis(r.data.universities); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [page, search, type, pub]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, type, pub]);

  const toggle = async (uni, field) => {
    try { await adminApi.updateUniversity(uni.id, { [field]: !uni[field] }); showToast('Updated'); load(); }
    catch { showToast('Update failed'); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try { await adminApi.deleteUniversity(confirm.id); setConfirm(null); showToast('University deleted'); load(); }
    catch { setConfirm(null); showToast('Delete failed'); }
  };

  const cols = [
    { key: 'name', label: 'University', render: u => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {u.logo_url
          ? <img src={u.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} onError={e => e.target.style.display='none'} />
          : <div style={{ width: 32, height: 32, borderRadius: 8, background: TYPE_BG[u.university_type] || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: '1px solid #e2e8f0' }}>🏛️</div>
        }
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{u.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{u.province}</div>
        </div>
      </div>
    )},
    { key: 'type',  label: 'Type',  render: u => <Badge label={u.type || 'N/A'} color={TYPE_COLORS[u.type] || '#1B3A6B'} /> },
    { key: 'owner', label: 'Owner', render: u => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: u.Owner ? '#334155' : '#94a3b8', fontWeight: u.Owner ? 500 : 400 }}>
          {u.Owner?.name || 'No owner'}
        </span>
        <button onClick={() => setTransferUni(u)}
          title="Transfer ownership"
          style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#1B3A6B'; e.currentTarget.style.color = '#1B3A6B'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8'; }}>
          <IC d="M16 3h5v5M4 20L20.2 3.8M21 16v5h-5M15 15l5.9 5.9" size={11} />
        </button>
      </div>
    )},
    { key: 'published', label: 'Published', render: u => <ToggleSwitch checked={u.is_published} onChange={() => toggle(u, 'is_published')} color="#15803d" /> },
    { key: 'verified',  label: 'Verified',  render: u => <ToggleSwitch checked={u.is_verified}  onChange={() => toggle(u, 'is_verified')}  color="#1B3A6B" /> },
    { key: 'featured',  label: 'Featured',  render: u => <ToggleSwitch checked={u.is_featured}  onChange={() => toggle(u, 'is_featured')}  color="#d97706" /> },
    { key: 'actions',   label: 'Actions',   render: u => (
      <div style={{ display: 'flex', gap: 6 }}>
        <ActionBtn onClick={() => setEditingUni(u)} color="#1B3A6B">Edit</ActionBtn>
        <DeleteBtn onClick={() => setConfirm({ id: u.id, name: u.name })} />
      </div>
    ) },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <PageHeader title="Universities" subtitle="Publish, verify, feature, and manage universities" count={total} />
        <button onClick={() => setShowCreate(true)}
          style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: '#1B3A6B', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(27,58,107,0.25)', whiteSpace: 'nowrap', marginTop: 2 }}
          onMouseEnter={e => e.currentTarget.style.background = '#15305a'}
          onMouseLeave={e => e.currentTarget.style.background = '#1B3A6B'}>
          <IC d="M12 5v14M5 12h14" size={14} stroke="#fff" /> New University
        </button>
      </div>
      <Card>
        <FilterBar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name..." />
          <Select value={type} onChange={setType} options={TYPE_OPTIONS} />
          <Select value={pub}  onChange={setPub}  options={PUB_OPTIONS} />
        </FilterBar>
        <Table columns={cols} rows={unis} loading={loading} emptyMsg="No universities found" />
        <div style={{ padding: '8px 16px 14px' }}><Pagination page={page} pages={pages} onChange={setPage} /></div>
      </Card>

      {confirm && (
        <ConfirmModal
          message={`Delete <strong>"${confirm.name}"</strong>? All associated data will be removed.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      {transferUni && (
        <TransferOwnerModal
          university={transferUni}
          onClose={() => setTransferUni(null)}
          onSuccess={load}
          showToast={showToast}
        />
      )}

      {showCreate && (
        <UniversityModal
          onClose={() => setShowCreate(false)}
          onSuccess={load}
          showToast={showToast}
        />
      )}

      {editingUni && (
        <UniversityModal
          mode="edit"
          university={editingUni}
          onClose={() => setEditingUni(null)}
          onSuccess={load}
          showToast={showToast}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
