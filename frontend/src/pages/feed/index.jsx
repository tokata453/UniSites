import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { feedApi } from '@/api';
import { Empty, Spinner } from '@/components/common';
import { avatarUrl, coverUrl, formatDate, logoUrl, truncate } from '@/utils';
import { useAuth, useToast } from '@/hooks';

const FILTERS = [
  { value: 'all', label: 'For you' },
  { value: 'news', label: 'Updates' },
  { value: 'opportunity', label: 'Opportunities' },
];

const Card = ({ children, className = '' }) => (
  <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
);

const Pill = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-full px-4 py-2 text-sm font-semibold transition-all"
    style={active
      ? { background: '#1B3A6B', color: '#fff', border: '1px solid #1B3A6B' }
      : { background: '#fff', color: '#64748b', border: '1px solid #e2e8f0' }}
  >
    {children}
  </button>
);

const getPublisher = (item) => {
  if (item.kind === 'news' && item.News?.University) {
    return {
      name: item.News.University.name,
      avatar: logoUrl(item.News.University.logo_url),
      fallback: 'U',
      meta: item.News.University.province || 'Cambodia',
    };
  }

  if (item.kind === 'opportunity' && item.Opportunity?.University) {
    return {
      name: item.Opportunity.University.name,
      avatar: logoUrl(item.Opportunity.University.logo_url),
      fallback: 'U',
      meta: item.Opportunity.University.province || 'University',
    };
  }

  if (item.kind === 'opportunity' && item.Opportunity?.PostedBy) {
    return {
      name: item.Opportunity.PostedBy.name,
      avatar: avatarUrl(item.Opportunity.PostedBy.avatar_url) || item.Opportunity.PostedBy.avatar_url,
      fallback: 'O',
      meta: 'Official organization',
    };
  }

  return { name: 'UniSites Feed', avatar: '', fallback: 'F', meta: 'Campus updates' };
};

const getTimestamp = (item) =>
  item.kind === 'news' ? item.News?.published_at || item.News?.created_at : item.Opportunity?.created_at;

const getFeedItemKey = (item) => `${item.kind}:${item.id}`;

const mergeUniqueFeedItems = (prev, next) => {
  const map = new Map();
  [...prev, ...next].forEach((item) => {
    map.set(getFeedItemKey(item), item);
  });
  return Array.from(map.values());
};

const InteractionButton = ({ active = false, icon, label, count, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all hover:bg-slate-100"
    style={active ? { color: '#1B3A6B', background: '#eff6ff' } : { color: '#64748b' }}
  >
    <span>{icon}</span>
    <span>{label}</span>
    {typeof count === 'number' && <span className="text-slate-400">{count}</span>}
  </button>
);

const getFeedImages = (item) => {
  if (item.kind === 'news') {
    const images = item.News?.image_urls;
    if (Array.isArray(images) && images.length) return images;
    return item.News?.cover_url ? [item.News.cover_url] : [];
  }

  const images = item.Opportunity?.image_urls;
  if (Array.isArray(images) && images.length) return images;
  return item.Opportunity?.cover_url ? [item.Opportunity.cover_url] : [];
};

const FeedImageCarousel = ({ item, imageIndex, onPrev, onNext }) => {
  const images = getFeedImages(item);
  if (!images.length) return null;

  const currentIndex = Math.min(imageIndex ?? 0, images.length - 1);
  const currentImage = images[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <div className="flex min-h-[280px] items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] md:min-h-[360px]">
        <img
          src={coverUrl(currentImage) || currentImage}
          alt=""
          className="max-h-[560px] w-full object-contain"
        />
      </div>
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition-all hover:bg-white"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onNext}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition-all hover:bg-white"
            aria-label="Next image"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur">
            {images.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${index === currentIndex ? 'bg-[#1B3A6B]' : 'bg-slate-300'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function FeedPage() {
  const { isAuthenticated } = useAuth();
  const { success, info } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [commentsByItem, setCommentsByItem] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});
  const [imageIndexes, setImageIndexes] = useState({});
  const loadMoreRef = useRef(null);
  const requestedPagesRef = useRef(new Set());

  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasNextPage(false);
    requestedPagesRef.current = new Set();
  }, [filter, search]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const requestKey = `${filter}:${search.trim()}:${page}`;
      if (requestedPagesRef.current.has(requestKey)) return;
      requestedPagesRef.current.add(requestKey);

      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await feedApi.list({
          kind: filter,
          search: search.trim() || undefined,
          page,
          limit: 12,
        });
        if (!cancelled) {
          const nextItems = res.data.items || [];
          setItems((prev) => (page === 1 ? nextItems : mergeUniqueFeedItems(prev, nextItems)));
          setHasNextPage(Boolean(res.data.meta?.hasNext));
        }
      } catch {
        requestedPagesRef.current.delete(requestKey);
        if (!cancelled && page === 1) {
          setItems([]);
          setHasNextPage(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filter, page, search]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || loading || loadingMore || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: '320px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, loading, loadingMore, items.length]);

  const visibleItems = useMemo(() => mergeUniqueFeedItems([], items), [items]);

  const summary = useMemo(() => {
    const newsCount = visibleItems.filter((item) => item.kind === 'news').length;
    const opportunityCount = visibleItems.filter((item) => item.kind === 'opportunity').length;
    const featuredCount = visibleItems.filter((item) => item.Opportunity?.is_featured || item.News?.is_pinned).length;
    const publishers = new Set(visibleItems.map((item) => getPublisher(item).name)).size;
    return { newsCount, opportunityCount, featuredCount, publishers };
  }, [visibleItems]);

  const trendingTopics = useMemo(() => {
    const source = [];
    visibleItems.forEach((item) => {
      if (item.kind === 'news' && item.News?.category) source.push(item.News.category);
      if (item.kind === 'opportunity' && item.Opportunity?.type) source.push(item.Opportunity.type);
    });
    return Array.from(new Set(source)).slice(0, 6);
  }, [visibleItems]);

  const updateItemMetrics = (itemType, itemId, patch) => {
    setItems((prev) =>
      prev.map((item) =>
        item.kind === itemType && item.id === itemId
          ? { ...item, ...patch }
          : item
      )
    );
  };

  const ensureCommentsLoaded = async (itemType, itemId) => {
    const key = `${itemType}:${itemId}`;
    if (commentsByItem[key]) return;
    setCommentsLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await feedApi.getComments(itemType, itemId);
      setCommentsByItem((prev) => ({ ...prev, [key]: res.data.comments || [] }));
    } catch {
      setCommentsByItem((prev) => ({ ...prev, [key]: [] }));
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleToggleComments = async (itemType, itemId) => {
    const key = `${itemType}:${itemId}`;
    const nextOpen = !openComments[key];
    setOpenComments((prev) => ({ ...prev, [key]: nextOpen }));
    if (nextOpen) await ensureCommentsLoaded(itemType, itemId);
  };

  const handleLike = async (item) => {
    if (!isAuthenticated) {
      info('Please log in to like posts');
      return;
    }
    try {
      const res = await feedApi.toggleLike(item.kind, item.id);
      updateItemMetrics(item.kind, item.id, {
        liked_by_me: res.data.liked,
        like_count: res.data.like_count,
      });
    } catch {}
  };

  const handleSubmitComment = async (item) => {
    if (!isAuthenticated) {
      info('Please log in to comment');
      return;
    }
    const key = `${item.kind}:${item.id}`;
    const content = String(commentDrafts[key] || '').trim();
    if (!content) {
      info('Write a comment first');
      return;
    }
    setCommentSubmitting((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await feedApi.addComment(item.kind, item.id, { content });
      const comment = res.data.comment;
      setCommentsByItem((prev) => ({ ...prev, [key]: [comment, ...(prev[key] || [])] }));
      setCommentDrafts((prev) => ({ ...prev, [key]: '' }));
      updateItemMetrics(item.kind, item.id, {
        comment_count: Number(item.comment_count || 0) + 1,
      });
      success('Comment posted');
    } catch {} finally {
      setCommentSubmitting((prev) => ({ ...prev, [key]: false }));
    }
  };

  const cycleItemImage = (item, direction) => {
    const images = getFeedImages(item);
    if (images.length <= 1) return;

    setImageIndexes((prev) => {
      const current = prev[`${item.kind}:${item.id}`] ?? 0;
      const next = (current + direction + images.length) % images.length;
      return { ...prev, [`${item.kind}:${item.id}`]: next };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <Card className="p-5 sm:p-6 lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Campus activity</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900" style={{ fontFamily: "'Syne',sans-serif" }}>Feed</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Follow official university updates and opportunities from across Cambodia in one place.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 lg:flex-col">
                {FILTERS.map((option) => (
                  <Pill key={option.value} active={filter === option.value} onClick={() => setFilter(option.value)}>
                    {option.label}
                  </Pill>
                ))}
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Search the feed</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search universities, updates, scholarships..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10"
                />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : visibleItems.length === 0 ? (
              <Empty title="Nothing in the feed yet" description="Try a different filter or search term." />
            ) : (
              <div className="space-y-4">
                {visibleItems.map((item) => {
                  const publisher = getPublisher(item);
                  const timestamp = getTimestamp(item);
                  const key = getFeedItemKey(item);
                  const comments = commentsByItem[key] || [];
                  const commentsOpen = !!openComments[key];

                  return (
                    <Card key={key} className="overflow-hidden">
                      <div className="p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                            {publisher.avatar ? (
                              <img src={publisher.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-600">{publisher.fallback}</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <p className="truncate text-sm font-semibold text-slate-900">{publisher.name}</p>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500">{publisher.meta}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                              <span>{timestamp ? formatDate(timestamp) : 'Recently posted'}</span>
                              {item.kind === 'news' && (
                                <>
                                  <span>•</span>
                                  <span>{item.News?.views_count || 0} views</span>
                                </>
                              )}
                              {item.kind === 'opportunity' && item.Opportunity?.deadline && (
                                <>
                                  <span>•</span>
                                  <span>Deadline {formatDate(item.Opportunity.deadline)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          {item.kind === 'news' ? (
                            <>
                              <h2 className="text-xl font-semibold leading-snug text-slate-900">{item.News?.title}</h2>
                              <p className="mt-3 text-sm leading-7 text-slate-600">{truncate(item.News?.excerpt || item.News?.content, 260)}</p>
                            </>
                          ) : (
                            <>
                              <h2 className="text-xl font-semibold leading-snug text-slate-900">{item.Opportunity?.title}</h2>
                              <p className="mt-3 text-sm leading-7 text-slate-600">{truncate(item.Opportunity?.description, 260)}</p>
                            </>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.kind === 'news' && item.News?.category && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">#{item.News.category}</span>}
                          {item.kind === 'news' && item.News?.is_pinned && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">#pinned</span>}
                          {item.kind === 'opportunity' && item.Opportunity?.is_featured && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">#featured</span>}
                          {item.kind === 'opportunity' && item.Opportunity?.is_fully_funded && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">#fullyfunded</span>}
                          {item.kind === 'opportunity' && item.Opportunity?.country && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">#{item.Opportunity.country.replace(/\s+/g, '').toLowerCase()}</span>}
                        </div>

                        <div className="mt-4">
                          <FeedImageCarousel
                            item={item}
                            imageIndex={imageIndexes[key] ?? 0}
                            onPrev={() => cycleItemImage(item, -1)}
                            onNext={() => cycleItemImage(item, 1)}
                          />
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                          <div className="flex flex-wrap gap-1">
                            <InteractionButton
                              active={item.liked_by_me}
                              icon={item.liked_by_me ? '♥' : '♡'}
                              label="Like"
                              count={Number(item.like_count || 0)}
                              onClick={() => handleLike(item)}
                            />
                            <InteractionButton
                              icon="💬"
                              label="Comment"
                              count={Number(item.comment_count || 0)}
                              onClick={() => handleToggleComments(item.kind, item.id)}
                            />
                          </div>
                          <Link
                            to={item.kind === 'news' ? `/universities/${item.News?.University?.slug || ''}` : `/opportunities/${item.Opportunity?.slug || ''}`}
                            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                              item.kind === 'news'
                                ? 'border border-slate-200 bg-white text-[#1B3A6B] hover:bg-slate-50'
                                : 'bg-[#1B3A6B] text-white shadow-sm hover:opacity-90'
                            }`}
                          >
                            {item.kind === 'news' ? 'View university' : 'Open opportunity'}
                          </Link>
                        </div>

                        {commentsOpen && (
                          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-sm font-semibold text-slate-800">Comments</p>
                              {commentsLoading[key] ? <span className="text-xs text-slate-400">Loading...</span> : null}
                            </div>

                            <div className="space-y-3">
                              {comments.map((comment) => (
                                <div key={comment.id} className="rounded-2xl bg-white px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-100">
                                      {comment.Author?.avatar_url ? (
                                        <img src={avatarUrl(comment.Author.avatar_url) || comment.Author.avatar_url} alt="" className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-600">
                                          {comment.Author?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-800">{comment.Author?.name || 'User'}</p>
                                      <p className="text-xs text-slate-400">{formatDate(comment.created_at || comment.createdAt)}</p>
                                    </div>
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">{comment.content}</p>
                                </div>
                              ))}

                              {!commentsLoading[key] && comments.length === 0 && (
                                <p className="text-sm text-slate-500">No comments yet. Start the conversation.</p>
                              )}
                            </div>

                            <div className="mt-4 flex gap-2">
                              <input
                                value={commentDrafts[key] || ''}
                                onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [key]: e.target.value }))}
                                placeholder={isAuthenticated ? 'Write a comment...' : 'Log in to comment'}
                                disabled={!isAuthenticated || commentSubmitting[key]}
                                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                              />
                              <button
                                type="button"
                                onClick={() => handleSubmitComment(item)}
                                disabled={!isAuthenticated || commentSubmitting[key]}
                                className="rounded-2xl bg-[#1B3A6B] px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {commentSubmitting[key] ? 'Posting...' : 'Post'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
                {loadingMore ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : null}
                <div ref={loadMoreRef} className="h-1" />
              </div>
            )}
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Trending now</p>
              <div className="mt-4 space-y-3">
                {trendingTopics.length > 0 ? trendingTopics.map((topic, index) => (
                  <div key={topic} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Topic {index + 1}</p>
                      <p className="truncate text-sm font-medium text-slate-800">#{topic.replace(/\s+/g, '').toLowerCase()}</p>
                    </div>
                    <span className="text-xs text-slate-400">Live</span>
                  </div>
                )) : <p className="text-sm text-slate-500">More topics will appear as new feed activity comes in.</p>}
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Feed mix</p>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-sm"><span className="text-slate-600">Official updates</span><span className="font-medium text-slate-800">{summary.newsCount}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${items.length ? (summary.newsCount / items.length) * 100 : 0}%` }} /></div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-sm"><span className="text-slate-600">Opportunities</span><span className="font-medium text-slate-800">{summary.opportunityCount}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${items.length ? (summary.opportunityCount / items.length) * 100 : 0}%` }} /></div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-sm"><span className="text-slate-600">Highlighted</span><span className="font-medium text-slate-800">{summary.featuredCount}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-500" style={{ width: `${items.length ? (summary.featuredCount / items.length) * 100 : 0}%` }} /></div>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
