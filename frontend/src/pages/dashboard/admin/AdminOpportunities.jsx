import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminApi } from '@/api';
import { Badge, SearchBar, Select, DeleteBtn, Table, Pagination, PageHeader, Card, ConfirmModal, Toast, ActionBtn } from './AdminShared';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'scholarship', label: 'Scholarship' }, { value: 'internship', label: 'Internship' },
  { value: 'exchange', label: 'Exchange' },        { value: 'competition', label: 'Competition' },
  { value: 'workshop', label: 'Workshop' },        { value: 'research', label: 'Research' },
  { value: 'parttime', label: 'Part-time' },       { value: 'volunteer', label: 'Volunteer' },
];
const PUB_OPTIONS = [{ value: '', label: 'All Status' }, { value: 'true', label: 'Published' }, { value: 'false', label: 'Unpublished' }];
const FEATURED_OPTIONS = [{ value: '', label: 'All' }, { value: 'true', label: 'Featured' }, { value: 'false', label: 'Not featured' }];
const DEADLINE_OPTIONS = [{ value: '', label: 'All deadlines' }, { value: 'active', label: 'Active' }, { value: 'expired', label: 'Expired' }, { value: 'none', label: 'No deadline' }];
const TYPE_COLORS = {
  scholarship: '#d97706', internship: '#15803d', exchange: '#1B3A6B',
  competition: '#be185d', workshop: '#7c3aed',   research: '#1d4ed8',
  parttime: '#0f766e',    volunteer: '#4d7c0f',
};

const textClamp = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export default function AdminOpportunities() {
  const [opps,    setOpps]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [type,    setType]    = useState('');
  const [pub,     setPub]     = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast,   setToast]   = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  const [deadlineFilter, setDeadlineFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [viewsMin, setViewsMin] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getOpportunities({ page, limit: 12, search: search || undefined, type: type || undefined, published: pub || undefined })
      .then(r => { setOpps(r.data.opportunities); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [page, search, type, pub]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, type, pub]);

  const filteredOpps = useMemo(() => (
    opps.filter((opp) => {
      const orgLabel = opp.University?.name || opp.PostedBy?.name || 'External';
      if (orgSearch && !orgLabel.toLowerCase().includes(orgSearch.toLowerCase())) return false;
      if (featuredFilter === 'true' && !opp.is_featured) return false;
      if (featuredFilter === 'false' && opp.is_featured) return false;
      if (viewsMin && Number(opp.views_count || 0) < Number(viewsMin)) return false;
      if (deadlineFilter === 'none' && opp.deadline) return false;
      if (deadlineFilter === 'active' && (!opp.deadline || new Date(opp.deadline) < new Date())) return false;
      if (deadlineFilter === 'expired' && (!opp.deadline || new Date(opp.deadline) >= new Date())) return false;
      return true;
    })
  ), [opps, orgSearch, featuredFilter, viewsMin, deadlineFilter]);

  const handleDelete = async () => {
    if (!confirm) return;
    try { await adminApi.deleteOpportunity(confirm.id); setConfirm(null); showToast('Deleted'); load(); }
    catch { setConfirm(null); showToast('Failed'); }
  };

  const cols = [
    { key: 'title', label: 'Title', filterRender: () => (
      <SearchBar value={search} onChange={setSearch} placeholder="Search titles..." />
    ), render: o => (
      <div style={{ minWidth: 280, maxWidth: 320 }}>
        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, ...textClamp }} title={o.title}>{o.title}</div>
        <div
          style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, ...textClamp }}
          title={o.University?.name || (o.PostedBy?.Role?.name === 'organization' ? o.PostedBy?.name : o.PostedBy?.name || 'External')}
        >
          {o.University?.name || (o.PostedBy?.Role?.name === 'organization' ? o.PostedBy?.name : o.PostedBy?.name || 'External')}
        </div>
      </div>
    ), width: 320, minWidth: 320 },
    { key: 'type', label: 'Type', filterRender: () => (
      <Select value={type} onChange={setType} options={TYPE_OPTIONS} style={{ width: '100%', minWidth: 140 }} />
    ), render: o => <Badge label={o.type} color={TYPE_COLORS[o.type] || '#1B3A6B'} /> },
    { key: 'deadline', label: 'Deadline', filterRender: () => (
      <Select value={deadlineFilter} onChange={setDeadlineFilter} options={DEADLINE_OPTIONS} style={{ width: '100%', minWidth: 145 }} />
    ), render: o => (
      <span style={{ fontSize: 12, color: o.deadline && new Date(o.deadline) < new Date() ? '#ef4444' : '#64748b' }}>
        {o.deadline ? new Date(o.deadline).toLocaleDateString() : '—'}
      </span>
    )},
    { key: 'status', label: 'Status', filterRender: () => (
      <div style={{ display: 'grid', gap: 8 }}>
        <Select value={pub} onChange={setPub} options={PUB_OPTIONS} style={{ width: '100%', minWidth: 140 }} />
        <Select value={featuredFilter} onChange={setFeaturedFilter} options={FEATURED_OPTIONS} style={{ width: '100%', minWidth: 125 }} />
      </div>
    ), render: o => (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minWidth: 180 }}>
        <Badge label={o.is_published ? 'Published' : 'Hidden'} color={o.is_published ? '#15803d' : '#64748b'} />
        {o.is_featured && <Badge label="Featured" color="#d97706" />}
        {o.is_verified && <Badge label="Verified" color="#1B3A6B" />}
        {o.is_fully_funded && <Badge label="Fully Funded" color="#0f766e" />}
      </div>
    ) },
    { key: 'views', label: 'Views', filterRender: () => (
      <input
        value={viewsMin}
        onChange={(e) => setViewsMin(e.target.value)}
        placeholder="Min"
        type="number"
        style={{ width: '100%', minWidth: 90, padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#1e293b', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }}
      />
    ), render: o => <span style={{ fontSize: 12, color: '#94a3b8' }}>{o.views_count?.toLocaleString() || 0}</span> },
    { key: 'actions',  label: 'Actions',  render: o => (
      <div style={{ display: 'flex', gap: 6 }}>
        <ActionBtn onClick={() => setEditing(o)} color="#1B3A6B">Edit</ActionBtn>
        <DeleteBtn onClick={() => setConfirm({ id: o.id, name: o.title })} />
      </div>
    ) },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <PageHeader title="Opportunities" subtitle="Manage scholarships, internships, and all opportunities" count={total} />
      <Card>
        <div style={{ padding: '16px 16px 0' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search all opportunities..." />
        </div>
        <Table columns={cols} rows={filteredOpps} loading={loading} emptyMsg="No opportunities found" />
        <div style={{ padding: '8px 16px 14px' }}><Pagination page={page} pages={pages} onChange={setPage} /></div>
      </Card>
      {confirm && <ConfirmModal message={`Delete <strong>"${confirm.name}"</strong>?`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      {editing && <OpportunityEditModal opportunity={editing} onClose={() => setEditing(null)} onSaved={load} showToast={showToast} />}
      <Toast message={toast} />
    </div>
  );
}

function OpportunityEditModal({ opportunity, onClose, onSaved, showToast }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: opportunity.title || '',
    type: opportunity.type || 'scholarship',
    description: opportunity.description || '',
    deadline: opportunity.deadline || '',
    funding_amount: opportunity.funding_amount || '',
    contact_email: opportunity.contact_email || '',
    application_url: opportunity.application_url || '',
    source_url: opportunity.source_url || '',
    is_featured: Boolean(opportunity.is_featured),
    is_verified: Boolean(opportunity.is_verified),
    is_published: Boolean(opportunity.is_published),
    is_fully_funded: Boolean(opportunity.is_fully_funded),
  });

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast('Opportunity title is required');
      return;
    }
    setSaving(true);
    try {
      await adminApi.updateOpportunity(opportunity.id, {
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim(),
        deadline: form.deadline || null,
        funding_amount: form.funding_amount.trim() || null,
        contact_email: form.contact_email.trim() || null,
        application_url: form.application_url.trim() || null,
        source_url: form.source_url.trim() || null,
        is_featured: form.is_featured,
        is_verified: form.is_verified,
        is_published: form.is_published,
        is_fully_funded: form.is_fully_funded,
      });
      showToast('Opportunity updated');
      onSaved();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update opportunity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Syne',sans-serif" }}>Edit Opportunity</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Update the opportunity listing and publication settings.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 6, borderRadius: 8, fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'grid', gap: 14 }}>
          <Field label="Title"><Input value={form.title} onChange={set('title')} placeholder="Opportunity title" /></Field>
          <Field label="Type"><Select value={form.type} onChange={set('type')} options={TYPE_OPTIONS.filter((option) => option.value)} style={{ width: '100%' }} /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={set('description')} placeholder="Opportunity description" rows={5} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Deadline"><Input value={form.deadline} onChange={set('deadline')} type="date" /></Field>
            <Field label="Funding"><Input value={form.funding_amount} onChange={set('funding_amount')} placeholder="e.g. $1,000 stipend" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Contact Email"><Input value={form.contact_email} onChange={set('contact_email')} placeholder="contact@example.com" type="email" /></Field>
            <Field label="Application URL"><Input value={form.application_url} onChange={set('application_url')} placeholder="https://..." /></Field>
          </div>
          <Field label="Source URL"><Input value={form.source_url} onChange={set('source_url')} placeholder="https://..." /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            <label style={checkboxStyle}><input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published')(e.target.checked)} /><span>Published</span></label>
            <label style={checkboxStyle}><input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured')(e.target.checked)} /><span>Featured</span></label>
            <label style={checkboxStyle}><input type="checkbox" checked={form.is_verified} onChange={(e) => set('is_verified')(e.target.checked)} /><span>Verified</span></label>
            <label style={checkboxStyle}><input type="checkbox" checked={form.is_fully_funded} onChange={(e) => set('is_fully_funded')(e.target.checked)} /><span>Fully funded</span></label>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onClose} style={secondaryBtnStyle}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ ...primaryBtnStyle, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const fieldLabelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
};

function Field({ label, children }) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 9,
  color: '#1e293b',
  fontSize: 13,
  outline: 'none',
  fontFamily: "'DM Sans',sans-serif",
  boxSizing: 'border-box',
};

function Input({ value, onChange, placeholder, type = 'text' }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />;
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputStyle, resize: 'vertical' }} />;
}

const checkboxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13,
  color: '#475569',
  fontWeight: 500,
};

const secondaryBtnStyle = {
  padding: '9px 18px',
  borderRadius: 9,
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  color: '#64748b',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
};

const primaryBtnStyle = {
  padding: '9px 20px',
  borderRadius: 9,
  border: 'none',
  background: '#1B3A6B',
  color: '#fff',
  fontSize: 13,
  fontWeight: 700,
};
