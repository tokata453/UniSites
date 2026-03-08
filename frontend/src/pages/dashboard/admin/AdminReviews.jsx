import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/api';
import { Badge, SearchBar, Select, ActionBtn, DeleteBtn, Table, Pagination, PageHeader, Card, FilterBar } from './AdminShared';

const FILTER_OPTIONS = [{ value: '', label: 'All Reviews' }, { value: 'false', label: 'Pending Approval' }, { value: 'true', label: 'Approved' }];

const Stars = ({ n }) => (
  <span style={{ color: '#f59e0b', fontSize: 12, letterSpacing: 1 }}>
    {'★'.repeat(n)}{'☆'.repeat(5 - n)}
  </span>
);

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('false'); // default show pending
  const [confirm, setConfirm] = useState(null);
  const [toast,   setToast]   = useState('');
  const [expanded, setExpanded] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getReviews({ page, limit: 12, approved: filter || undefined })
      .then(r => { setReviews(r.data.reviews); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filter]);

  const handleApprove = async (review) => {
    try {
      await adminApi.approveReview(review.id);
      showToast(`Review ${review.is_approved ? 'unapproved' : 'approved'}`);
      load();
    } catch { showToast('Failed'); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await adminApi.deleteReview(confirm.id);
      setConfirm(null); showToast('Review deleted'); load();
    } catch { setConfirm(null); showToast('Failed'); }
  };

  const cols = [
    { key: 'author', label: 'Reviewer', render: r => (
      <div>
        <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{r.Author?.name || 'Unknown'}</div>
        <div style={{ fontSize: 11, color: '#64748b' }}>{r.Author?.email}</div>
      </div>
    )},
    { key: 'university', label: 'University', render: r => (
      <span style={{ fontSize: 12, color: '#94a3b8' }}>{r.University?.name || '—'}</span>
    )},
    { key: 'rating', label: 'Rating', render: r => <Stars n={r.rating} /> },
    { key: 'title', label: 'Review', render: r => (
      <div>
        <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, marginBottom: 2 }}>{r.title || '—'}</div>
        <div style={{ fontSize: 11, color: '#64748b', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
          onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
          {r.content}
        </div>
        {expanded === r.id && (
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, lineHeight: 1.6, maxWidth: 300 }}>
            {r.pros && <div><strong style={{ color: '#22c55e' }}>✓</strong> {r.pros}</div>}
            {r.cons && <div><strong style={{ color: '#ef4444' }}>✗</strong> {r.cons}</div>}
          </div>
        )}
      </div>
    )},
    { key: 'status', label: 'Status', render: r => (
      <Badge label={r.is_approved ? 'Approved' : 'Pending'} color={r.is_approved ? '#22c55e' : '#f59e0b'} />
    )},
    { key: 'date', label: 'Date', render: r => (
      <span style={{ fontSize: 11, color: '#64748b' }}>{new Date(r.created_at).toLocaleDateString()}</span>
    )},
    { key: 'actions', label: 'Actions', render: r => (
      <div style={{ display: 'flex', gap: 6 }}>
        <ActionBtn onClick={() => handleApprove(r)} color={r.is_approved ? '#f59e0b' : '#22c55e'}>
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
        <div style={{ padding: '8px 16px 14px' }}>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      </Card>

      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0f1623', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 28, maxWidth: 360, width: '90%' }}>
            <p style={{ fontSize: 14, color: '#e2e8f0', margin: '0 0 20px', lineHeight: 1.6 }}>Delete <strong>"{confirm.name}"</strong>? This cannot be undone.</p>
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
