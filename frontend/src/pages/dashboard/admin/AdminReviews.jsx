import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/api';
import { Badge, Select, ActionBtn, DeleteBtn, Table, Pagination, PageHeader, Card, FilterBar, ConfirmModal, Toast } from './AdminShared';

const FILTER_OPTIONS = [{ value: '', label: 'All Reviews' }, { value: 'false', label: 'Pending Approval' }, { value: 'true', label: 'Approved' }];

const Stars = ({ n }) => (
  <span style={{ fontSize: 13, letterSpacing: 1 }}>
    <span style={{ color: '#F47B20' }}>{'★'.repeat(n)}</span>
    <span style={{ color: '#e2e8f0' }}>{'★'.repeat(5 - n)}</span>
  </span>
);

export default function AdminReviews() {
  const [reviews,  setReviews]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('false');
  const [confirm,  setConfirm]  = useState(null);
  const [toast,    setToast]    = useState('');
  const [expanded, setExpanded] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getReviews({ page, limit: 12, approved: filter || undefined })
      .then(r => { setReviews(r.data.reviews); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filter]);

  const handleApprove = async (review) => {
    try { await adminApi.approveReview(review.id); showToast(`Review ${review.is_approved ? 'unapproved' : 'approved'}`); load(); }
    catch { showToast('Failed'); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try { await adminApi.deleteReview(confirm.id); setConfirm(null); showToast('Review deleted'); load(); }
    catch { setConfirm(null); showToast('Failed'); }
  };

  const cols = [
    { key: 'author', label: 'Reviewer', render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1B3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {r.Author?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{r.Author?.name || 'Unknown'}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.Author?.email}</div>
        </div>
      </div>
    )},
    { key: 'university', label: 'University', render: r => <span style={{ fontSize: 12, color: '#64748b' }}>{r.University?.name || '—'}</span> },
    { key: 'rating',     label: 'Rating',     render: r => <Stars n={r.rating} /> },
    { key: 'title', label: 'Review', render: r => (
      <div>
        <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, marginBottom: 2 }}>{r.title || '—'}</div>
        <div style={{ fontSize: 11, color: '#64748b', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
          onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
          {r.content}
        </div>
        {expanded === r.id && (
          <div style={{ marginTop: 6, lineHeight: 1.6, maxWidth: 300 }}>
            {r.pros && <div style={{ fontSize: 11, color: '#15803d', background: '#f0fdf4', padding: '4px 8px', borderRadius: 6, marginBottom: 3 }}>✓ {r.pros}</div>}
            {r.cons && <div style={{ fontSize: 11, color: '#dc2626', background: '#fef2f2', padding: '4px 8px', borderRadius: 6 }}>✗ {r.cons}</div>}
          </div>
        )}
      </div>
    )},
    { key: 'status', label: 'Status', render: r => <Badge label={r.is_approved ? 'Approved' : 'Pending'} color={r.is_approved ? '#15803d' : '#d97706'} /> },
    { key: 'date',   label: 'Date',   render: r => <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(r.created_at).toLocaleDateString()}</span> },
    { key: 'actions', label: 'Actions', render: r => (
      <div style={{ display: 'flex', gap: 6 }}>
        <ActionBtn onClick={() => handleApprove(r)} color={r.is_approved ? '#d97706' : '#15803d'}>
          {r.is_approved ? 'Unapprove' : 'Approve'}
        </ActionBtn>
        <DeleteBtn onClick={() => setConfirm({ id: r.id, name: r.title || 'this review' })} />
      </div>
    )},
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <PageHeader title="Reviews" subtitle="Approve and moderate university reviews" count={total} />
      <Card>
        <FilterBar>
          <Select value={filter} onChange={setFilter} options={FILTER_OPTIONS} />
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>
            {filter === 'false' ? '⚠️ Showing pending reviews' : filter === 'true' ? '✅ Showing approved reviews' : 'All reviews'}
          </span>
        </FilterBar>
        <Table columns={cols} rows={reviews} loading={loading} emptyMsg="No reviews found" />
        <div style={{ padding: '8px 16px 14px' }}><Pagination page={page} pages={pages} onChange={setPage} /></div>
      </Card>
      {confirm && <ConfirmModal message={`Delete <strong>"${confirm.name}"</strong>? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      <Toast message={toast} />
    </div>
  );
}