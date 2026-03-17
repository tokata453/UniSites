import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api';
import { Badge, SearchBar, Select, DeleteBtn, Table, Pagination, PageHeader, Card, FilterBar, ConfirmModal, Toast, ToggleSwitch, ActionBtn } from './AdminShared';
import { avatarUrl } from '@/utils';

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
  const [confirm, setConfirm] = useState(null);
  const [toast,   setToast]   = useState('');
  const [density, setDensity] = useState('comfortable');

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

  const renderOwner = (opp) => {
    if (opp.University?.name) {
      const ownerName = opp.University.name;
      if (opp.University.slug) {
        return (
          <Link
            to={`/universities/${opp.University.slug}`}
            style={{ fontWeight: 600, color: '#1B3A6B', fontSize: 12, textDecoration: 'none', ...textClamp }}
            title={ownerName}
          >
            {ownerName}
          </Link>
        );
      }

      return (
        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 12, ...textClamp }} title={ownerName}>
          {ownerName}
        </div>
      );
    }

    if (opp.PostedBy?.Role?.name === 'organization') {
      const ownerName = opp.PostedBy?.name || 'Organization';
      return (
        <Link
          to={`/admin/users?role=organization&search=${encodeURIComponent(opp.PostedBy.email || ownerName)}`}
          style={{ fontWeight: 600, color: '#0f766e', fontSize: 12, textDecoration: 'none', ...textClamp }}
          title={ownerName}
        >
          {ownerName}
        </Link>
      );
    }

    return <div style={{ fontWeight: 600, color: '#64748b', fontSize: 12 }}>Unknown</div>;
  };

  const cols = [
    { key: 'title', label: 'Title', render: o => (
      <div style={{ minWidth: 280, maxWidth: 320 }}>
        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, ...textClamp }} title={o.title}>{o.title}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, ...textClamp }} title={o.University?.name || 'External'}>
          {o.University?.name || 'External'}
        </div>
      </div>
    ), width: 320, minWidth: 320 },
    { key: 'ownedBy', label: 'Owned By', render: o => (
      <div style={{ minWidth: 150, maxWidth: 180 }}>
        {renderOwner(o)}
        <div style={{ marginTop: 4 }}>
          {o.University ? (
            <Badge label="University" color="#15803d" />
          ) : o.PostedBy?.Role?.name === 'organization' ? (
            <Badge label="Organization" color="#0f766e" />
          ) : (
            <span style={{ fontSize: 11, color: '#94a3b8' }}>No owner</span>
          )}
        </div>
      </div>
    ), width: 180, minWidth: 180 },
    { key: 'submittedBy', label: 'Submitted By', render: o => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 190, maxWidth: 220 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#475569', flexShrink: 0, overflow: 'hidden' }}>
          {o.PostedBy?.avatar_url ? (
            <img
              src={avatarUrl(o.PostedBy.avatar_url) || o.PostedBy.avatar_url}
              alt={o.PostedBy.name || 'User avatar'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            o.PostedBy?.name?.[0]?.toUpperCase() || 'S'
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          {o.PostedBy?.id ? (
            <Link
              to={`/admin/users/${o.PostedBy.id}`}
              style={{ display: 'block', fontWeight: 600, color: '#1B3A6B', fontSize: 12, textDecoration: 'none', ...textClamp }}
              title={o.PostedBy?.name}
            >
              {o.PostedBy?.name}
            </Link>
          ) : (
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 12, ...textClamp }} title={o.PostedBy?.name || 'Seeded record'}>
              {o.PostedBy?.name || 'Seeded record'}
            </div>
          )}
          <div
            style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, ...textClamp }}
            title={o.PostedBy ? `${o.PostedBy?.Role?.name || 'No role'}${o.PostedBy?.email ? ` • ${o.PostedBy.email}` : ''}` : 'Legacy seeded import'}
          >
            {o.PostedBy
              ? `${o.PostedBy?.Role?.name || 'No role'}${o.PostedBy?.email ? ` • ${o.PostedBy.email}` : ''}`
              : 'Legacy seeded import'}
          </div>
        </div>
      </div>
    ), width: 220, minWidth: 220 },
    { key: 'type',     label: 'Type',     render: o => <Badge label={o.type} color={TYPE_COLORS[o.type] || '#1B3A6B'} /> },
    { key: 'funding',  label: 'Funding',  render: o => (
      <div style={{ minWidth: 220, maxWidth: 240 }}>
        <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.45 }}>{o.funding_amount || '—'}</div>
        {o.is_fully_funded && <Badge label="Full" color="#15803d" />}
      </div>
    ), width: 240, minWidth: 240 },
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
          <ActionBtn onClick={() => setDensity((prev) => prev === 'comfortable' ? 'compact' : 'comfortable')} color="#475569" title="Toggle row density">
            {density === 'compact' ? 'Comfortable rows' : 'Compact rows'}
          </ActionBtn>
        </FilterBar>
        <Table columns={cols} rows={opps} loading={loading} emptyMsg="No opportunities found" density={density} />
        <div style={{ padding: '8px 16px 14px' }}><Pagination page={page} pages={pages} onChange={setPage} /></div>
      </Card>
      {confirm && <ConfirmModal message={`Delete <strong>"${confirm.name}"</strong>?`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      <Toast message={toast} />
    </div>
  );
}
