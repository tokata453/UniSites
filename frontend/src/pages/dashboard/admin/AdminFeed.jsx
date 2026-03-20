import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api';
import { coverUrl, formatDate, logoUrl } from '@/utils';
import { Card, PageHeader, Pagination, SearchBar, Select, Badge, Toast } from './AdminShared';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Feed Items' },
  { value: 'news', label: 'News Only' },
  { value: 'opportunity', label: 'Opportunities Only' },
];

const sortOptions = [
  { value: 'latest', label: 'Latest First' },
  { value: 'engagement', label: 'Highest Engagement' },
];

const publishedOptions = [
  { value: '', label: 'All Visibility' },
  { value: 'true', label: 'Published' },
  { value: 'false', label: 'Hidden' },
];

const statCardStyle = {
  borderRadius: 20,
  border: '1px solid #e2e8f0',
  background: '#fff',
  padding: 18,
  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
};

const getPublisher = (item) => {
  if (item.kind === 'news' && item.News?.University) {
    return {
      name: item.News.University.name,
      avatar: logoUrl(item.News.University.logo_url),
      meta: item.News.University.province || 'University',
    };
  }

  if (item.kind === 'opportunity' && item.Opportunity?.University) {
    return {
      name: item.Opportunity.University.name,
      avatar: logoUrl(item.Opportunity.University.logo_url),
      meta: item.Opportunity.University.province || 'University',
    };
  }

  if (item.kind === 'opportunity' && item.Opportunity?.PostedBy) {
    return {
      name: item.Opportunity.PostedBy.name,
      avatar: item.Opportunity.PostedBy.avatar_url || '',
      meta: 'Organization',
    };
  }

  return {
    name: 'UniSites',
    avatar: '',
    meta: 'Feed item',
  };
};

const getTimestamp = (item) => item.kind === 'news'
  ? item.News?.published_at || item.News?.created_at
  : item.Opportunity?.created_at;

const getViews = (item) => item.kind === 'news'
  ? Number(item.News?.views_count || 0)
  : Number(item.Opportunity?.views_count || 0);

const getStatusBadges = (item) => {
  if (item.kind === 'news') {
    return [
      { label: item.News?.is_published ? 'Published' : 'Hidden', color: item.News?.is_published ? '#15803d' : '#64748b' },
      ...(item.News?.is_pinned ? [{ label: 'Pinned', color: '#d97706' }] : []),
    ];
  }

  return [
    { label: item.Opportunity?.is_published ? 'Published' : 'Hidden', color: item.Opportunity?.is_published ? '#15803d' : '#64748b' },
    ...(item.Opportunity?.is_featured ? [{ label: 'Featured', color: '#d97706' }] : []),
    ...(item.Opportunity?.is_verified ? [{ label: 'Verified', color: '#1B3A6B' }] : []),
  ];
};

export default function AdminFeed() {
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  ));
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [published, setPublished] = useState('');
  const [toast, setToast] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    adminApi.getFeed({
      kind,
      search: search.trim() || undefined,
      page,
      limit: 12,
      published: published || undefined,
    })
      .then((res) => {
        setItems(res.data.items || []);
        setTotal(res.data.meta?.total || 0);
        setPages(res.data.meta?.totalPages || 1);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
        setPages(1);
      })
      .finally(() => setLoading(false));
  }, [kind, page, published, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [kind, search, published]);

  const handleToggleVisibility = async (item) => {
    const nextPublished = item.kind === 'news'
      ? !item.News?.is_published
      : !item.Opportunity?.is_published;
    setUpdatingId(`${item.kind}:${item.id}`);
    try {
      if (item.kind === 'news') {
        await adminApi.updateFeedNews(item.id, { is_published: nextPublished });
      } else {
        await adminApi.updateOpportunity(item.id, { is_published: nextPublished });
      }
      showToast(nextPublished ? 'Feed item republished' : 'Feed item hidden');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update feed visibility');
    } finally {
      setUpdatingId(null);
    }
  };

  const visibleItems = useMemo(() => {
    const nextItems = [...items];
    if (sortBy === 'engagement') {
      nextItems.sort((a, b) => {
        const aScore = Number(a.like_count || 0) + Number(a.comment_count || 0) * 2 + getViews(a) / 20;
        const bScore = Number(b.like_count || 0) + Number(b.comment_count || 0) * 2 + getViews(b) / 20;
        return bScore - aScore;
      });
    } else {
      nextItems.sort((a, b) => new Date(getTimestamp(b) || 0) - new Date(getTimestamp(a) || 0));
    }
    return nextItems;
  }, [items, sortBy]);

  const summary = useMemo(() => {
    const newsCount = visibleItems.filter((item) => item.kind === 'news').length;
    const opportunityCount = visibleItems.filter((item) => item.kind === 'opportunity').length;
    const highlightedCount = visibleItems.filter((item) => item.News?.is_pinned || item.Opportunity?.is_featured).length;
    const totalEngagement = visibleItems.reduce((sum, item) => sum + Number(item.like_count || 0) + Number(item.comment_count || 0), 0);
    return { newsCount, opportunityCount, highlightedCount, totalEngagement };
  }, [visibleItems]);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <PageHeader
        title="Feed Monitor"
        subtitle="Track, hide, and republish what appears in the public feed so the admin team can moderate visibility from one place."
        count={total}
      />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>News Items</div>
          <div style={{ marginTop: 10, fontSize: isMobile ? 28 : 34, fontWeight: 800, color: '#0f172a', fontFamily: "'Syne',sans-serif" }}>{summary.newsCount}</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Opportunities</div>
          <div style={{ marginTop: 10, fontSize: isMobile ? 28 : 34, fontWeight: 800, color: '#0f172a', fontFamily: "'Syne',sans-serif" }}>{summary.opportunityCount}</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Highlighted</div>
          <div style={{ marginTop: 10, fontSize: isMobile ? 28 : 34, fontWeight: 800, color: '#0f172a', fontFamily: "'Syne',sans-serif" }}>{summary.highlightedCount}</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Engagement</div>
          <div style={{ marginTop: 10, fontSize: isMobile ? 28 : 34, fontWeight: 800, color: '#0f172a', fontFamily: "'Syne',sans-serif" }}>{summary.totalEngagement}</div>
        </div>
      </div>

      <Card>
        <div style={{ padding: '16px 16px 0', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search feed title, content, or post source..." />
          <Select value={kind} onChange={setKind} options={FILTER_OPTIONS} style={{ width: '100%', minWidth: isMobile ? 0 : 170 }} />
          <Select value={published} onChange={setPublished} options={publishedOptions} style={{ width: '100%', minWidth: isMobile ? 0 : 170 }} />
          <Select value={sortBy} onChange={setSortBy} options={sortOptions} style={{ width: '100%', minWidth: isMobile ? 0 : 170 }} />
        </div>

        <div style={{ padding: 16, display: 'grid', gap: 14 }}>
          {loading ? (
            <div style={{ padding: 28, color: '#94a3b8', fontSize: 14 }}>Loading feed items...</div>
          ) : visibleItems.length === 0 ? (
            <div style={{ padding: 28, color: '#94a3b8', fontSize: 14 }}>No feed items found for this filter.</div>
          ) : (
            visibleItems.map((item) => {
              const publisher = getPublisher(item);
              const itemUrl = item.kind === 'news'
                ? `/universities/${item.News?.University?.slug || ''}`
                : item.Opportunity?.slug ? `/opportunities/${item.Opportunity.slug}` : null;
              const image = item.kind === 'news'
                ? (item.News?.cover_url || item.News?.image_urls?.[0] || '')
                : (item.Opportunity?.cover_url || item.Opportunity?.image_urls?.[0] || '');
              const isPublished = item.kind === 'news' ? item.News?.is_published : item.Opportunity?.is_published;

              return (
                <div key={`${item.kind}:${item.id}`} style={{ border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden', background: '#fff' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: image ? (isMobile ? '1fr' : '180px minmax(0,1fr)') : 'minmax(0,1fr)' }}>
                    {image && (
                      <div style={{ minHeight: isMobile ? 180 : 160, maxHeight: isMobile ? 180 : 'none', background: '#f8fafc' }}>
                        <img src={coverUrl(image) || image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: isMobile ? 14 : 18, display: 'grid', gap: isMobile ? 12 : 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                            <Badge label={item.kind === 'news' ? 'News' : 'Opportunity'} color={item.kind === 'news' ? '#1B3A6B' : '#7c3aed'} />
                            {getStatusBadges(item).map((badge) => (
                              <Badge key={badge.label} label={badge.label} color={badge.color} />
                            ))}
                          </div>
                          <h3 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 800, color: '#0f172a', fontFamily: "'Syne',sans-serif", lineHeight: 1.35 }}>
                            {item.kind === 'news' ? item.News?.title : item.Opportunity?.title}
                          </h3>
                          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: isMobile ? 3 : 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.kind === 'news'
                              ? (item.News?.excerpt || item.News?.content || 'No summary yet.')
                              : (item.Opportunity?.description || 'No summary yet.')}
                          </p>
                        </div>
                        <div style={{ textAlign: isMobile ? 'left' : 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>Last activity</div>
                          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                            {formatDate(getTimestamp(item))}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B3A6B', fontWeight: 700, flexShrink: 0 }}>
                          {publisher.avatar ? <img src={publisher.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : publisher.name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{publisher.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{publisher.meta}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: isMobile ? 10 : 16, flexWrap: 'wrap', fontSize: 12, color: '#64748b' }}>
                        <span><strong style={{ color: '#0f172a' }}>{item.like_count || 0}</strong> likes</span>
                        <span><strong style={{ color: '#0f172a' }}>{item.comment_count || 0}</strong> comments</span>
                        <span><strong style={{ color: '#0f172a' }}>{getViews(item).toLocaleString()}</strong> views</span>
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(item)}
                          disabled={updatingId === `${item.kind}:${item.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '9px 14px',
                            borderRadius: 10,
                            width: isMobile ? '100%' : 'auto',
                            border: `1px solid ${isPublished ? '#ef444420' : '#15803d20'}`,
                            background: isPublished ? '#fef2f2' : '#f0fdf4',
                            color: isPublished ? '#dc2626' : '#15803d',
                            textDecoration: 'none',
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: updatingId === `${item.kind}:${item.id}` ? 'not-allowed' : 'pointer',
                            opacity: updatingId === `${item.kind}:${item.id}` ? 0.7 : 1,
                          }}
                        >
                          {updatingId === `${item.kind}:${item.id}`
                            ? 'Saving...'
                            : (item.kind === 'news' ? item.News?.is_published : item.Opportunity?.is_published)
                              ? 'Hide from Feed'
                              : 'Republish'}
                        </button>
                        {itemUrl && (
                          <Link
                            to={itemUrl}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '9px 14px', borderRadius: 10, border: '1px solid #1B3A6B20', background: '#1B3A6B10', color: '#1B3A6B', textDecoration: 'none', fontSize: 13, fontWeight: 700, width: isMobile ? '100%' : 'auto' }}
                          >
                            Open source
                          </Link>
                        )}
                        {isPublished && (
                          <Link
                            to="/feed"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '9px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', textDecoration: 'none', fontSize: 13, fontWeight: 700, width: isMobile ? '100%' : 'auto' }}
                          >
                            Open public feed
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <div style={{ marginTop: 14 }}>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </div>

      <Toast message={toast} />
    </div>
  );
}
