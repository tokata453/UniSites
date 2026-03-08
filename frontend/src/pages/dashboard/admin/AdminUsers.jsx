import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/api';
import { Badge, SearchBar, Select, ActionBtn, DeleteBtn, Table, Pagination, PageHeader, Card, FilterBar } from './AdminShared';

const ROLE_COLORS  = { admin: '#f59e0b', owner: '#10b981', student: '#6366f1' };
const ROLE_OPTIONS = [{ value: '', label: 'All Roles' }, { value: 'admin', label: 'Admin' }, { value: 'owner', label: 'Owner' }, { value: 'student', label: 'Student' }];

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0f1623', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 28, maxWidth: 360, width: '90%' }}>
        <p style={{ fontSize: 14, color: '#e2e8f0', margin: '0 0 20px', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('');
  const [confirm, setConfirm] = useState(null); // { id, name }
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

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [search, role]);

  const handleToggleStatus = async (user) => {
    try {
      await adminApi.updateUser(user.id, { is_active: !user.is_active });
      showToast(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      load();
    } catch { showToast('Failed to update user'); }
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
    { key: 'name',     label: 'User', render: u => (
      <div>
        <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{u.name}</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{u.email}</div>
      </div>
    )},
    { key: 'role',     label: 'Role', render: u => (
      <select value={u.Role?.name || ''} onChange={e => handleChangeRole(u, e.target.value)}
        style={{ background: 'transparent', border: 'none', color: ROLE_COLORS[u.Role?.name] || '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer', outline: 'none', fontFamily: "'DM Sans',sans-serif" }}>
        {['admin','owner','student'].map(r => <option key={r} value={r} style={{ background: '#1e2433' }}>{r}</option>)}
      </select>
    )},
    { key: 'status',   label: 'Status', render: u => (
      <Badge label={u.is_active ? 'Active' : 'Inactive'} color={u.is_active ? '#22c55e' : '#64748b'} />
    )},
    { key: 'provider', label: 'Auth', render: u => (
      <Badge label={u.provider || 'local'} color={u.provider === 'google' ? '#ea4335' : u.provider === 'facebook' ? '#1877f2' : '#6366f1'} />
    )},
    { key: 'joined',   label: 'Joined', render: u => (
      <span style={{ fontSize: 12, color: '#64748b' }}>{new Date(u.created_at).toLocaleDateString()}</span>
    )},
    { key: 'actions',  label: 'Actions', render: u => (
      <div style={{ display: 'flex', gap: 6 }}>
        <ActionBtn onClick={() => handleToggleStatus(u)} color={u.is_active ? '#f59e0b' : '#22c55e'}>
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

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e2433', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 18px', color: '#e2e8f0', fontSize: 13, zIndex: 99, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
