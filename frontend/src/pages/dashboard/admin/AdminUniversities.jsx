import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/api';
import { Badge, SearchBar, Select, DeleteBtn, Table, Pagination, PageHeader, Card, FilterBar, ConfirmModal, Toast, ToggleSwitch } from './AdminShared';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'international', label: 'International' },
];
const PUB_OPTIONS = [{ value: '', label: 'All Status' }, { value: 'true', label: 'Published' }, { value: 'false', label: 'Unpublished' }];
const TYPE_COLORS = { public: '#1d4ed8', private: '#15803d', international: '#7c3aed' };
const TYPE_BG     = { public: '#eff6ff',  private: '#f0fdf4',  international: '#faf5ff' };

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
      .catch(() => {}).finally(() => setLoading(false));
  }, [page, search, type, pub]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, type, pub]);

  const toggle = async (uni, field) => {
    try {
      await adminApi.updateUniversity(uni.id, { [field]: !uni[field] });
      showToast('Updated'); load();
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
          ? <img src={u.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} onError={e => e.target.style.display='none'} />
          : <div style={{ width: 32, height: 32, borderRadius: 8, background: TYPE_BG[u.university_type] || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: '1px solid #e2e8f0' }}>🏛️</div>
        }
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{u.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{u.province}</div>
        </div>
      </div>
    )},
    { key: 'type',      label: 'Type',      render: u => <Badge label={u.university_type || 'N/A'} color={TYPE_COLORS[u.university_type] || '#1B3A6B'} /> },
    { key: 'owner',     label: 'Owner',     render: u => <span style={{ fontSize: 12, color: '#64748b' }}>{u.Owner?.name || '—'}</span> },
    { key: 'published', label: 'Published', render: u => <ToggleSwitch checked={u.is_published} onChange={() => toggle(u, 'is_published')} color="#15803d" /> },
    { key: 'verified',  label: 'Verified',  render: u => <ToggleSwitch checked={u.is_verified}  onChange={() => toggle(u, 'is_verified')}  color="#1B3A6B" /> },
    { key: 'featured',  label: 'Featured',  render: u => <ToggleSwitch checked={u.is_featured}  onChange={() => toggle(u, 'is_featured')}  color="#d97706" /> },
    { key: 'actions',   label: '',          render: u => <DeleteBtn onClick={() => setConfirm({ id: u.id, name: u.name })} /> },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <PageHeader title="Universities" subtitle="Publish, verify, feature, and manage universities" count={total} />
      <Card>
        <FilterBar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name..." />
          <Select value={type} onChange={setType} options={TYPE_OPTIONS} />
          <Select value={pub}  onChange={setPub}  options={PUB_OPTIONS} />
        </FilterBar>
        <Table columns={cols} rows={unis} loading={loading} emptyMsg="No universities found" />
        <div style={{ padding: '8px 16px 14px' }}><Pagination page={page} pages={pages} onChange={setPage} /></div>
      </Card>
      {confirm && <ConfirmModal message={`Delete <strong>"${confirm.name}"</strong>? All associated data will be removed.`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      <Toast message={toast} />
    </div>
  );
}