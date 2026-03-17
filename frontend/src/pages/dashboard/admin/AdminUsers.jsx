import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '@/api';
import { Badge, SearchBar, Select, ActionBtn, DeleteBtn, Table, Pagination, PageHeader, Card, FilterBar } from './AdminShared';

const ROLE_COLORS  = { admin: '#d97706', owner: '#15803d', organization: '#0f766e', student: '#1B3A6B' };
const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
  { value: 'organization', label: 'Organization' },
  { value: 'student', label: 'Student' },
];

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, maxWidth: 360, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <p style={{ fontSize: 14, color: '#334155', margin: '0 0 20px', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 18px', color: '#334155', fontSize: 13, zIndex: 99, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#22c55e' }}>✓</span> {message}
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
          message={`Delete user "${confirm.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}
