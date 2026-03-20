import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/api';
import { Badge, SearchBar, Select, ActionBtn, DeleteBtn, Table, Pagination, PageHeader, Card, ConfirmModal, Toast } from './AdminShared';

const PUB_OPTIONS = [{ value: '', label: 'All Status' }, { value: 'true', label: 'Published' }, { value: 'false', label: 'Unpublished' }];
const APPROVAL_OPTIONS = [{ value: '', label: 'All Owners' }, { value: 'true', label: 'Approved Owners' }, { value: 'false', label: 'Pending Owners' }];
const BOOL_OPTIONS = [{ value: '', label: 'All' }, { value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }];
const EDIT_PUBLISH_OPTIONS = [{ value: 'true', label: 'Published' }, { value: 'false', label: 'Hidden' }];
const EDIT_VERIFY_OPTIONS = [{ value: 'true', label: 'Verified' }, { value: 'false', label: 'Unverified' }];

const IC = ({ d, size = 16, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const fieldLabelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 8,
};

const fieldInputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  color: '#0f172a',
  fontSize: 13,
  outline: 'none',
  fontFamily: "'DM Sans',sans-serif",
  boxSizing: 'border-box',
};

function EditOrganizationModal({ organization, onClose, onSuccess, showToast }) {
  const [form, setForm] = useState({
    name: organization.name || '',
    slug: organization.slug || '',
    email: organization.email || '',
    website_url: organization.website_url || '',
    contact_phone: organization.contact_phone || '',
    description: organization.description || '',
    logo_url: organization.logo_url || '',
    cover_url: organization.cover_url || '',
    facebook_url: organization.facebook_url || '',
    telegram_url: organization.telegram_url || '',
    instagram_url: organization.instagram_url || '',
    linkedin_url: organization.linkedin_url || '',
    is_published: Boolean(organization.is_published),
    is_verified: Boolean(organization.is_verified),
  });
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateOrganization(organization.id, form);
      showToast('Organization updated');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(15,23,42,0.18)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: 24, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', fontFamily: "'Syne',sans-serif" }}>Edit Organization</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Update the public organization profile and contact details.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#94a3b8', padding: 8, borderRadius: 10, flexShrink: 0 }}
            >
              <IC d="M18 6L6 18M6 6l12 12" size={18} />
            </button>
          </div>

          <div style={{ padding: 24, display: 'grid', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={fieldLabelStyle}>Organization Name</label>
                <input value={form.name} onChange={(e) => setField('name', e.target.value)} style={fieldInputStyle} required />
              </div>
              <div>
                <label style={fieldLabelStyle}>Slug</label>
                <input value={form.slug} onChange={(e) => setField('slug', e.target.value)} style={fieldInputStyle} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={fieldLabelStyle}>Public Email</label>
                <input value={form.email} onChange={(e) => setField('email', e.target.value)} style={fieldInputStyle} type="email" />
              </div>
              <div>
                <label style={fieldLabelStyle}>Phone</label>
                <input value={form.contact_phone} onChange={(e) => setField('contact_phone', e.target.value)} style={fieldInputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={fieldLabelStyle}>Website</label>
                <input value={form.website_url} onChange={(e) => setField('website_url', e.target.value)} style={fieldInputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Logo URL</label>
                <input value={form.logo_url} onChange={(e) => setField('logo_url', e.target.value)} style={fieldInputStyle} />
              </div>
            </div>

            <div>
              <label style={fieldLabelStyle}>Cover URL</label>
              <input value={form.cover_url} onChange={(e) => setField('cover_url', e.target.value)} style={fieldInputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={fieldLabelStyle}>Publish Status</label>
                <Select
                  value={form.is_published ? 'true' : 'false'}
                  onChange={(value) => setField('is_published', value === 'true')}
                  options={EDIT_PUBLISH_OPTIONS}
                  style={{ width: '100%', minWidth: 0 }}
                />
              </div>
              <div>
                <label style={fieldLabelStyle}>Verification Status</label>
                <Select
                  value={form.is_verified ? 'true' : 'false'}
                  onChange={(value) => setField('is_verified', value === 'true')}
                  options={EDIT_VERIFY_OPTIONS}
                  style={{ width: '100%', minWidth: 0 }}
                />
              </div>
            </div>

            <div>
              <label style={fieldLabelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={4}
                style={{ ...fieldInputStyle, resize: 'vertical', minHeight: 110 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              <div>
                <label style={fieldLabelStyle}>Facebook</label>
                <input value={form.facebook_url} onChange={(e) => setField('facebook_url', e.target.value)} style={fieldInputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Telegram</label>
                <input value={form.telegram_url} onChange={(e) => setField('telegram_url', e.target.value)} style={fieldInputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>Instagram</label>
                <input value={form.instagram_url} onChange={(e) => setField('instagram_url', e.target.value)} style={fieldInputStyle} />
              </div>
              <div>
                <label style={fieldLabelStyle}>LinkedIn</label>
                <input value={form.linkedin_url} onChange={(e) => setField('linkedin_url', e.target.value)} style={fieldInputStyle} />
              </div>
            </div>
          </div>

          <div style={{ padding: 24, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: saving ? '#cbd5e1' : '#1B3A6B', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TransferOrganizationOwnerModal({ organization, onClose, onSuccess, showToast }) {
  const [search, setSearch] = useState('');
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminApi.getUsers({ role: 'organization', limit: 8, ...(search.trim() ? { search } : {}) })
      .then((r) => setOwners(r.data.users || []))
      .catch(() => setOwners([]))
      .finally(() => setLoading(false));
  }, [search]);

  const handleTransfer = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminApi.updateOrganization(organization.id, { owner_id: selected.id });
      showToast(`Ownership transferred to ${selected.name}`);
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Transfer failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', fontFamily: "'Syne',sans-serif" }}>Transfer Ownership</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
              Currently owned by <strong style={{ color: '#0f766e' }}>{organization.Owner?.name || 'No owner'}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <IC d="M18 6L6 18M6 6l12 12" size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0fdfa', border: '1px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, overflow: 'hidden', color: '#0f766e', fontWeight: 700 }}>
            {organization.logo_url
              ? <img src={organization.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.style.display='none'} />
              : (organization.name?.[0]?.toUpperCase() || 'O')}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{organization.name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{organization.email || organization.website_url || 'No public contact yet'}</div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Organization Owners
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <IC d="M21 21l-4.35-4.35 M11 19a8 8 0 100-16 8 8 0 000 16z" size={15} />
            </div>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setSelected(null); }}
              placeholder="Type owner name or email..."
              style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#1e293b', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif", boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#0f766e'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </div>

        <div style={{ minHeight: 120, marginBottom: 20 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, color: '#94a3b8', fontSize: 13 }}>
              Loading organization owners...
            </div>
          ) : owners.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, color: '#94a3b8', fontSize: 13 }}>
              {search.trim().length > 0 ? `No organization owners found for "${search}"` : 'No organization users available'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {owners.map((owner) => {
                const isSelected = selected?.id === owner.id;
                const isCurrent = owner.id === organization.owner_id;
                const ownsAnotherOrganization = Boolean(owner.owned_organization_id) && owner.owned_organization_id !== organization.id;
                const isDisabled = isCurrent || ownsAnotherOrganization;

                return (
                  <div
                    key={owner.id}
                    onClick={() => !isDisabled && setSelected(isSelected ? null : owner)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`, background: isSelected ? '#f0fdfa' : isDisabled ? '#f8fafc' : '#fff', cursor: isDisabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: isDisabled ? 0.6 : 1 }}
                    onMouseEnter={e => { if (!isDisabled && !isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!isDisabled && !isSelected) e.currentTarget.style.background = '#fff'; }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: isSelected ? '#0f766e' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: isSelected ? '#fff' : '#64748b', flexShrink: 0, transition: 'all 0.15s', overflow: 'hidden' }}>
                      {owner.avatar_url
                        ? <img src={owner.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => e.target.style.display='none'} />
                        : owner.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#0f766e' : '#0f172a', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {owner.name}
                        {isCurrent && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600 }}>Current</span>}
                        {ownsAnotherOrganization && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 700 }}>Occupied</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{owner.email}</div>
                      {ownsAnotherOrganization && (
                        <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>
                          Current organization: {owner.owned_organization_name}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IC d="M20 6L9 17l-5-5" size={11} stroke="#fff" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selected && (
          <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, marginBottom: 16, fontSize: 12, color: '#15803d', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IC d="M20 6L9 17l-5-5" size={14} stroke="#15803d" />
            Transfer to <strong>{selected.name}</strong> ({selected.email})
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selected || saving}
            style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: selected && !saving ? '#0f766e' : '#e2e8f0', color: selected && !saving ? '#fff' : '#94a3b8', cursor: selected && !saving ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {saving ? 'Transferring...' : 'Transfer Ownership'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [published, setPublished] = useState('');
  const [approved, setApproved] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [toast, setToast] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [transferOrganization, setTransferOrganization] = useState(null);
  const [editOrganization, setEditOrganization] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getOrganizations({
      page,
      limit: 12,
      search: search || undefined,
      published: published || undefined,
      approved: approved || undefined,
    })
      .then((r) => {
        setOrganizations(r.data.organizations || []);
        setTotal(r.data.total || 0);
        setPages(r.data.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, published, approved]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, published, approved]);

  const rows = useMemo(() => organizations.filter((organization) => {
    if (verifiedFilter === 'true' && !organization.is_verified) return false;
    if (verifiedFilter === 'false' && organization.is_verified) return false;
    return true;
  }), [organizations, verifiedFilter]);

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await adminApi.deleteOrganization(confirm.id);
      setConfirm(null);
      showToast('Organization deleted');
      load();
    } catch {
      setConfirm(null);
      showToast('Delete failed');
    }
  };

  const cols = [
    {
      key: 'organization',
      label: 'Organization',
      render: (organization) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#0f766e' }}>
            {organization.logo_url ? (
              <img src={organization.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              organization.name?.[0]?.toUpperCase() || 'O'
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{organization.name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {organization.email || organization.website_url || 'No public contact yet'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (organization) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{organization.Owner?.name || 'Unassigned'}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{organization.Owner?.email || 'No email'}</div>
          </div>
          <button
            onClick={() => setTransferOrganization(organization)}
            title="Transfer ownership"
            style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.borderColor = '#0f766e'; e.currentTarget.style.color = '#0f766e'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <IC d="M16 3h5v5M4 20L20.2 3.8M21 16v5h-5M15 15l5.9 5.9" size={11} />
          </button>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (organization) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <Badge label={organization.is_published ? 'Published' : 'Hidden'} color={organization.is_published ? '#15803d' : '#64748b'} />
          <Badge label={organization.is_verified ? 'Verified' : 'Unverified'} color={organization.is_verified ? '#0f766e' : '#94a3b8'} />
          <Badge label={organization.Owner?.is_approved ? 'Owner Approved' : 'Owner Pending'} color={organization.Owner?.is_approved ? '#1B3A6B' : '#d97706'} />
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (organization) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <ActionBtn onClick={() => setEditOrganization(organization)} title="Edit organization">Edit</ActionBtn>
          <DeleteBtn onClick={() => setConfirm(organization)} />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Organizations" subtitle="Manage organization profiles, owner status, and visibility." count={total} />

      <Card>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search organizations or owners..." />
          <Select value={published} onChange={setPublished} options={PUB_OPTIONS} />
          <Select value={approved} onChange={setApproved} options={APPROVAL_OPTIONS} />
          <Select value={verifiedFilter} onChange={setVerifiedFilter} options={[{ value: '', label: 'All Verification' }, ...BOOL_OPTIONS.slice(1).map((o) => ({ ...o, label: o.value === 'true' ? 'Verified' : 'Unverified' }))]} />
        </div>
        <Table columns={cols} rows={rows} loading={loading} emptyMsg="No organizations found" />
      </Card>

      <Pagination page={page} pages={pages} onChange={setPage} />

      {confirm && (
        <ConfirmModal
          message={`Delete <strong>${confirm.name}</strong>? This action cannot be undone.`}
          onCancel={() => setConfirm(null)}
          onConfirm={handleDelete}
        />
      )}

      {transferOrganization && (
        <TransferOrganizationOwnerModal
          organization={transferOrganization}
          onClose={() => setTransferOrganization(null)}
          onSuccess={load}
          showToast={showToast}
        />
      )}

      {editOrganization && (
        <EditOrganizationModal
          organization={editOrganization}
          onClose={() => setEditOrganization(null)}
          onSuccess={load}
          showToast={showToast}
        />
      )}

      <Toast message={toast} />
    </>
  );
}
