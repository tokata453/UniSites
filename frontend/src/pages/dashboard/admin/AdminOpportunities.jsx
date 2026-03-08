import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/api';
import { Badge, SearchBar, Select, ActionBtn, DeleteBtn, Table, Pagination, PageHeader, Card, FilterBar } from './AdminShared';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'internship', label: 'Internship' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'competition', label: 'Competition' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'research', label: 'Research' },
  { value: 'parttime', label: 'Part-time' },
  { value: 'volunteer', label: 'Volunteer' },
];
const PUB_OPTIONS = [{ value: '', label: 'All Status' }, { value: 'true', label: 'Published' }, { value: 'false', label: 'Unpublished' }];

const TYPE_COLORS = {
  scholarship: '#f59e0b', internship: '#10b981', exchange: '#6366f1',
  competition: '#ec4899', workshop: '#8b5cf6', research: '#3b82f6',
  parttime: '#14b8a6', volunteer: '#84cc16',
};

function ToggleSwitch({ checked, onChange, color = '#6366f1' }) {
  return (
    <div onClick={onChange} style={{ width: 36, height: 20, borderRadius: 10, background: checked ? color : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: checked ? 18 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </div>
  );
}

export default function AdminOpportunities() {
  const [opps,    setOpps]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [type,    setType]    = useState('');
  const [pub,     setPub]     = useState('');
  const [confirm, setConfirm] = useState(null);
  const [toast,   setToast]   = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getOpportunities({ page, limit: 12, search: search || undefined, type: type || undefined, published: pub || undefined })
      .then(r => { setOpps(r.data.opportunities); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, type, pub]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, type, pub]);

  const toggle = async (opp, field) => {
    try {
      await adminApi.updateOpportunity(opp.id, { [field]: !opp[field] });
      showToast('Updated'); load();
    } catch { showToast('Failed'); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await adminApi.deleteOpportunity(confirm.id);
      setConfirm(null); showToast('Deleted'); load();
    } catch { setConfirm(null); showToast('Failed'); }
  };

  const cols = [
    { key: 'title', label: 'Title', render: o => (
      <div>
        <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{o.University?.name || 'External'}</div>
      </div>
    )},
    { key: 'type', label: 'Type', render: o => (
      <Badge label={o.type} color={TYPE_COLORS[o.type] || '#6366f1'} />
    )},
    { key: 'funding', label: 'Funding', render: o => (
      <div>
        <div style={{ fontSize: 12, color: '#e2e8f0' }}>{o.funding_amount || '—'}</div>
        {o.is_fully_funded && <Badge label="Full" color="#22c55e" />}
      </div>
    )},
    { key: 'deadline', label: 'Deadline', render: o => (
      <span style={{ fontSize: 12, color: o.deadline && new Date(o.deadline) < new Date() ? '#ef4444' : '#64748b' }}>
        {o.deadline ? new Date(o.deadline).toLocaleDateString() : '—'}
      </span>
    )},
    { key: 'published', label: 'Published', render: o => (
      <ToggleSwitch checked={o.is_published} onChange={() => toggle(o, 'is_published')} color="#22c55e" />
    )},
    { key: 'featured', label: 'Featured', render: o => (
      <ToggleSwitch checked={o.is_featured} onChange={() => toggle(o, 'is_featured')} color="#f59e0b" />
    )},
    { key: 'views', label: 'Views', render: o => (
      <span style={{ fontSize: 12, color: '#64748b' }}>{o.views_count?.toLocaleString() || 0}</span>
    )},
    { key: 'actions', label: '', render: o => (
      <DeleteBtn onClick={() => setConfirm({ id: o.id, name: o.title })} />
    )},
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <PageHeader title="Opportunities" subtitle="Manage scholarships, internships, and all opportunities" count={total} />

      <Card>
        <FilterBar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by title..." />
          <Select value={type} onChange={setType} options={TYPE_OPTIONS} />
          <Select value={pub} onChange={setPub} options={PUB_OPTIONS} />
        </FilterBar>
        <Table columns={cols} rows={opps} loading={loading} emptyMsg="No opportunities found" />
        <div style={{ padding: '8px 16px 14px' }}>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      </Card>

      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f1623', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 28, maxWidth: 360, width: '90%' }}>
            <p style={{ fontSize: 14, color: '#e2e8f0', margin: '0 0 20px', lineHeight: 1.6 }}>Delete <strong>"{confirm.name}"</strong>?</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirm(null)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e2433', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 18px', color: '#e2e8f0', fontSize: 13, zIndex: 99 }}>{toast}</div>}
    </div>
  );
}
