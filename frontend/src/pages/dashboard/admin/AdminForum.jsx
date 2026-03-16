import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/api';
import { SearchBar, ActionBtn, DeleteBtn, Table, Pagination, PageHeader, Card, FilterBar, ConfirmModal, Toast } from './AdminShared';

export default function AdminForum() {
  const [threads, setThreads] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [confirm, setConfirm] = useState(null);
  const [toast,   setToast]   = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getThreads({ page, limit: 15, search: search || undefined })
      .then(r => { setThreads(r.data.threads); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  const handlePin = async (thread) => {
    try { await adminApi.pinThread(thread.id); showToast(`Thread ${thread.is_pinned ? 'unpinned' : 'pinned'}`); load(); }
    catch { showToast('Failed'); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try { await adminApi.deleteThread(confirm.id); setConfirm(null); showToast('Thread deleted'); load(); }
    catch { setConfirm(null); showToast('Failed'); }
  };

  const cols = [
    { key: 'title', label: 'Thread', render: t => (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {t.is_pinned   && <span style={{ fontSize: 11 }}>📌</span>}
          {t.is_official && <span style={{ fontSize: 11 }}>✅</span>}
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>in {t.Category?.name || '—'}</div>
      </div>
    )},
    { key: 'author', label: 'Author', render: t => (
      <div>
        <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{t.Author?.name || '—'}</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{t.Author?.email}</div>
      </div>
    )},
    { key: 'stats', label: 'Stats', render: t => (
      <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#64748b' }}>
        <span>👁 {t.views || 0}</span>
        <span>💬 {t.reply_count || 0}</span>
        <span>❤️ {t.like_count || 0}</span>
      </div>
    )},
    { key: 'tags', label: 'Tags', render: t => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 180 }}>
        {(t.tags || []).slice(0, 3).map(tag => (
          <span key={tag} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 600 }}>{tag}</span>
        ))}
      </div>
    )},
    { key: 'date', label: 'Posted', render: t => <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(t.created_at).toLocaleDateString()}</span> },
    { key: 'actions', label: 'Actions', render: t => (
      <div style={{ display: 'flex', gap: 6 }}>
        <ActionBtn onClick={() => handlePin(t)} color={t.is_pinned ? '#d97706' : '#1B3A6B'}>
          {t.is_pinned ? 'Unpin' : 'Pin'}
        </ActionBtn>
        <DeleteBtn onClick={() => setConfirm({ id: t.id, name: t.title })} />
      </div>
    )},
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <PageHeader title="Forum" subtitle="Manage, pin, and moderate forum threads" count={total} />
      <Card>
        <FilterBar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by title..." />
        </FilterBar>
        <Table columns={cols} rows={threads} loading={loading} emptyMsg="No threads found" />
        <div style={{ padding: '8px 16px 14px' }}><Pagination page={page} pages={pages} onChange={setPage} /></div>
      </Card>
      {confirm && <ConfirmModal message={`Delete thread <strong>"${confirm.name}"</strong> and all its replies?`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      <Toast message={toast} />
    </div>
  );
}