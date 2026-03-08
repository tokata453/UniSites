import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/api';
import { Badge, SearchBar, Select, ActionBtn, DeleteBtn, Table, Pagination, PageHeader, Card, FilterBar } from './AdminShared';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'international', label: 'International' },
];
const PUB_OPTIONS  = [{ value: '', label: 'All Status' }, { value: 'true', label: 'Published' }, { value: 'false', label: 'Unpublished' }];
const TYPE_COLORS  = { public: '#3b82f6', private: '#10b981', international: '#8b5cf6' };

function ToggleSwitch({ checked, onChange, color = '#6366f1' }) {
  return (
    <div onClick={onChange} style={{ width: 36, height: 20, borderRadius: 10, background: checked ? color : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: checked ? 18 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </div>
  );
}

export default function AdminUniversities() {
  const [unis,    setUnis]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [type,    setType]    = useState('');
  const [pub,     setPub]     = useState('');
  const [toast,   setToast]   = useState('');
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getUniversities({ page, limit: 12, search: search || undefined, type: type || undefined, published: pub || undefined })
      .then(r => { setUnis(r.data.universities); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, type, pub]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, type, pub]);

  const toggle = async (uni, field) => {
    try {
      await adminApi.updateUniversity(uni.id, { [field]: !uni[field] });
      showToast(`${field.replace('is_', '').replace('_', ' ')} updated`);
      load();
    } catch { showToast('Update failed'); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await adminApi.deleteUniversity(confirm.id);
      setConfirm(null); showToast('University deleted'); load();
    } catch { setConfirm(null); showToast('Delete failed'); }
  };

  const cols = [
    { key: 'name', label: 'University', render: u => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {u.logo_url
          ? <img src={u.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} onError={e => e.target.style.display='none'} />
          : <div style={{ width: 32, height: 32, borderRadius: 8, background: `${TYPE_COLORS[u.university_type] || '#6366f1'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🏛️</div>
        }
        <div>
          <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{u.name}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{u.province}</div>
        </div>
      </div>
    )},
    { key: 'type', label: 'Type', render: u => (
      <Badge label={u.university_type || 'N/A'} color={TYPE_COLORS[u.university_type] || '#6366f1'} />
    )},
    { key: 'owner', label: 'Owner', render: u => (
      <span style={{ fontSize: 12, color: '#64748b' }}>{u.Owner?.name || '—'}</span>
    )},
    { key: 'published', label: 'Published', render: u => (
      <ToggleSwitch checked={u.is_published} onChange={() => toggle(u, 'is_published')} color="#22c55e" />
    )},
    { key: 'verified', label: 'Verified', render: u => (
      <ToggleSwitch checked={u.is_verified} onChange={() => toggle(u, 'is_verified')} color="#6366f1" />
    )},
    { key: 'featured', label: 'Featured', render: u => (
      <ToggleSwitch checked={u.is_featured} onChange={() => toggle(u, 'is_featured')} color="#f59e0b" />
    )},
    { key: 'actions', label: 'Actions', render: u => (
      <DeleteBtn onClick={() => setConfirm({ id: u.id, name: u.name })} />
    )},
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <PageHeader title="Universities" subtitle="Publish, verify, feature, and manage universities" count={total} />

      <Card>
        <FilterBar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name..." />
          <Select value={type} onChange={setType} options={TYPE_OPTIONS} />
          <Select value={pub} onChange={setPub} options={PUB_OPTIONS} />
        </FilterBar>
        <Table columns={cols} rows={unis} loading={loading} emptyMsg="No universities found" />
        <div style={{ padding: '8px 16px 14px' }}>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      </Card>

      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f1623', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 28, maxWidth: 360, width: '90%' }}>
            <p style={{ fontSize: 14, color: '#e2e8f0', margin: '0 0 20px', lineHeight: 1.6 }}>Delete <strong>"{confirm.name}"</strong>? All associated data will be removed.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirm(null)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e2433', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 18px', color: '#e2e8f0', fontSize: 13, zIndex: 99 }}>{toast}</div>
      )}
    </div>
  );
}
