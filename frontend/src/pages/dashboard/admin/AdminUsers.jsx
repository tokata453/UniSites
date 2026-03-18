import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '@/api';
import { Badge, SearchBar, Select, ActionBtn, DeleteBtn, Table, Pagination, PageHeader, Card, FilterBar, ConfirmModal, Toast } from './AdminShared';

const ROLE_COLORS  = { admin: '#d97706', owner: '#15803d', organization: '#0f766e', student: '#1B3A6B' };
const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
  { value: 'organization', label: 'Organization' },
  { value: 'student', label: 'Student' },
];

function UserEditModal({ user, onClose, onSaved, showToast }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.Role?.name || 'student',
    is_active: Boolean(user.is_active),
    is_approved: Boolean(user.is_approved),
    bio: user.bio || '',
    website_url: user.website_url || '',
    contact_phone: user.contact_phone || '',
  });

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateUser(user.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        is_active: form.is_active,
        is_approved: form.is_approved,
        bio: form.bio.trim() || null,
        website_url: form.website_url.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
      });
      showToast('User updated');
      onSaved();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Syne',sans-serif" }}>Edit User</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Update role, status, and profile details.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 6, borderRadius: 8, fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'grid', gap: 14 }}>
          <Field label="Name"><Input value={form.name} onChange={set('name')} placeholder="Full name" /></Field>
          <Field label="Email"><Input value={form.email} onChange={set('email')} placeholder="email@example.com" type="email" /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Role">
              <Select value={form.role} onChange={set('role')} options={ROLE_OPTIONS.filter((option) => option.value)} style={{ width: '100%' }} />
            </Field>
            {form.role === 'organization' ? (
              <Field label="Approval">
                <Select
                  value={form.is_approved ? 'approved' : 'pending'}
                  onChange={(value) => set('is_approved')(value === 'approved')}
                  options={[
                    { value: 'approved', label: 'Approved' },
                    { value: 'pending', label: 'Pending Approval' },
                  ]}
                  style={{ width: '100%' }}
                />
              </Field>
            ) : (
              <div />
            )}
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <label style={checkboxStyle}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active')(e.target.checked)} />
              <span>Active account</span>
            </label>
          </div>
          <Field label="Website"><Input value={form.website_url} onChange={set('website_url')} placeholder="https://example.com" /></Field>
          <Field label="Contact Phone"><Input value={form.contact_phone} onChange={set('contact_phone')} placeholder="+855 ..." /></Field>
          <Field label="Bio"><Textarea value={form.bio} onChange={set('bio')} placeholder="Short admin notes or profile bio" rows={4} /></Field>
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

export default function AdminUsers() {
  const [searchParams] = useSearchParams();
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState(() => searchParams.get('search') || '');
  const [role,    setRole]    = useState(() => searchParams.get('role') || '');
  const [confirm, setConfirm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toast,   setToast]   = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getUsers({ page, limit: 15, search: search || undefined, role: role || undefined })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, role]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, role]);
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setRole(searchParams.get('role') || '');
    setPage(1);
  }, [searchParams]);

  const handleToggleStatus = async (user) => {
    try {
      await adminApi.updateUser(user.id, { is_active: !user.is_active });
      showToast(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      load();
    } catch { showToast('Failed to update user'); }
  };

  const handleApproveOrganization = async (user) => {
    try {
      await adminApi.updateUser(user.id, { is_approved: true });
      showToast('Organization approved');
      load();
    } catch { showToast('Failed to approve organization'); }
  };

  const handleChangeRole = async (user, newRole) => {
    if (newRole === user.Role?.name) return;
    try {
      await adminApi.updateUser(user.id, { role: newRole });
      showToast('Role updated');
      load();
    } catch { showToast('Failed to update role'); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await adminApi.deleteUser(confirm.id);
      setConfirm(null);
      showToast('User deleted');
      load();
    } catch { setConfirm(null); showToast('Failed to delete user'); }
  };

  const cols = [
    { key: 'name', label: 'User', render: u => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1B3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {u.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{u.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{u.email}</div>
        </div>
      </div>
    )},
    { key: 'role', label: 'Role', render: u => (
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <select value={u.Role?.name || ''} onChange={e => handleChangeRole(u, e.target.value)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            background: `${ROLE_COLORS[u.Role?.name] || '#64748b'}10`,
            border: `1px solid ${ROLE_COLORS[u.Role?.name] || '#64748b'}30`,
            borderRadius: 8,
            padding: '4px 24px 4px 8px',
            color: ROLE_COLORS[u.Role?.name] || '#64748b',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
            fontFamily: "'DM Sans',sans-serif",
            textTransform: 'capitalize',
          }}>
          {['admin','owner','organization','student'].map(r => { const rv = String(r); return <option key={rv} value={rv}>{rv}</option>; })}
        </select>
        <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: ROLE_COLORS[u.Role?.name] || '#64748b', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 10, lineHeight: 1 }}>▼</span>
        </div>
      </div>
    )},
    { key: 'status', label: 'Status', render: u => (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Badge label={u.is_active ? 'Active' : 'Inactive'} color={u.is_active ? '#15803d' : '#94a3b8'} />
        {u.Role?.name === 'organization' && (
          <Badge label={u.is_approved ? 'Approved' : 'Pending Approval'} color={u.is_approved ? '#0f766e' : '#d97706'} />
        )}
      </div>
    )},
    { key: 'provider', label: 'Auth', render: u => (
      <Badge label={u.provider || 'local'} color={u.provider === 'google' ? '#ea4335' : u.provider === 'facebook' ? '#1877f2' : '#475569'} />
    )},
    { key: 'joined', label: 'Joined', render: u => (
      <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(u.createdAt).toLocaleDateString()}</span>
    )},
    { key: 'actions', label: 'Actions', render: u => (
      <div style={{ display: 'flex', gap: 6 }}>
        <ActionBtn onClick={() => setEditing(u)} color="#1B3A6B">
          Edit
        </ActionBtn>
        {u.Role?.name === 'organization' && !u.is_approved && (
          <ActionBtn onClick={() => handleApproveOrganization(u)} color="#0f766e">
            Approve
          </ActionBtn>
        )}
        <ActionBtn onClick={() => handleToggleStatus(u)} color={u.is_active ? '#d97706' : '#15803d'}>
          {u.is_active ? 'Deactivate' : 'Activate'}
        </ActionBtn>
        <DeleteBtn onClick={() => setConfirm({ id: u.id, name: u.name })} />
      </div>
    )},
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <PageHeader title="Users" subtitle="Manage all registered users" count={total} />

      <Card>
        <FilterBar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." />
          <Select value={role} onChange={setRole} options={ROLE_OPTIONS} />
        </FilterBar>
        <Table columns={cols} rows={users} loading={loading} emptyMsg="No users found" />
        <div style={{ padding: '8px 16px 14px' }}>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      </Card>

      {confirm && (
        <ConfirmModal
          message={`Delete user <strong>"${confirm.name}"</strong>? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
      {editing && <UserEditModal user={editing} onClose={() => setEditing(null)} onSaved={load} showToast={showToast} />}
      <Toast message={toast} />
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

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />;
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputStyle, resize: 'vertical' }} />;
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
