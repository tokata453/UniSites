import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/api';
import { Badge, SearchBar, Select, DeleteBtn, Table, Pagination, PageHeader, Card, FilterBar, ConfirmModal, Toast, ToggleSwitch } from './AdminShared';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'scholarship', label: 'Scholarship' }, { value: 'internship', label: 'Internship' },
  { value: 'exchange', label: 'Exchange' },        { value: 'competition', label: 'Competition' },
  { value: 'workshop', label: 'Workshop' },        { value: 'research', label: 'Research' },
  { value: 'parttime', label: 'Part-time' },       { value: 'volunteer', label: 'Volunteer' },
];
const PUB_OPTIONS = [{ value: '', label: 'All Status' }, { value: 'true', label: 'Published' }, { value: 'false', label: 'Unpublished' }];
const TYPE_COLORS = {
  scholarship: '#d97706', internship: '#15803d', exchange: '#1B3A6B',
  competition: '#be185d', workshop: '#7c3aed',   research: '#1d4ed8',
  parttime: '#0f766e',    volunteer: '#4d7c0f',
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
  const [confirm, setConfirm] = useState(null);
  const [toast,   setToast]   = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getOpportunities({ page, limit: 12, search: search || undefined, type: type || undefined, published: pub || undefined })
      .then(r => { setOpps(r.data.opportunities); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [page, search, type, pub]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, type, pub]);

  const toggle = async (opp, field) => {
    try { await adminApi.updateOpportunity(opp.id, { [field]: !opp[field] }); showToast('Updated'); load(); }
    catch { showToast('Failed'); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try { await adminApi.deleteOpportunity(confirm.id); setConfirm(null); showToast('Deleted'); load(); }
    catch { setConfirm(null); showToast('Failed'); }
  };

  const cols = [
    { key: 'title', label: 'Title', render: o => (
      <div>
        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{o.University?.name || 'External'}</div>
      </div>
    )},
    { key: 'type',     label: 'Type',     render: o => <Badge label={o.type} color={TYPE_COLORS[o.type] || '#1B3A6B'} /> },
    { key: 'funding',  label: 'Funding',  render: o => (
      <div>
        <div style={{ fontSize: 12, color: '#334155' }}>{o.funding_amount || '—'}</div>
        {o.is_fully_funded && <Badge label="Full" color="#15803d" />}
      </div>
    )},
    { key: 'deadline', label: 'Deadline', render: o => (
      <span style={{ fontSize: 12, color: o.deadline && new Date(o.deadline) < new Date() ? '#ef4444' : '#64748b' }}>
        {o.deadline ? new Date(o.deadline).toLocaleDateString() : '—'}
      </span>
    )},
    { key: 'published', label: 'Published', render: o => <ToggleSwitch checked={o.is_published} onChange={() => toggle(o, 'is_published')} color="#15803d" /> },
    { key: 'featured',  label: 'Featured',  render: o => <ToggleSwitch checked={o.is_featured}  onChange={() => toggle(o, 'is_featured')}  color="#d97706" /> },
    { key: 'views',    label: 'Views',    render: o => <span style={{ fontSize: 12, color: '#94a3b8' }}>{o.views_count?.toLocaleString() || 0}</span> },
    { key: 'actions',  label: '',         render: o => <DeleteBtn onClick={() => setConfirm({ id: o.id, name: o.title })} /> },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <PageHeader title="Opportunities" subtitle="Manage scholarships, internships, and all opportunities" count={total} />
      <Card>
        <FilterBar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by title..." />
          <Select value={type} onChange={setType} options={TYPE_OPTIONS} />
          <Select value={pub}  onChange={setPub}  options={PUB_OPTIONS} />
        </FilterBar>
        <Table columns={cols} rows={opps} loading={loading} emptyMsg="No opportunities found" />
        <div style={{ padding: '8px 16px 14px' }}><Pagination page={page} pages={pages} onChange={setPage} /></div>
      </Card>
      {confirm && <ConfirmModal message={`Delete <strong>"${confirm.name}"</strong>?`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      <Toast message={toast} />
    </div>
  );
}