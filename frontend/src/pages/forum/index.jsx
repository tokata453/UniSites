// ── ForumPage ──────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { forumApi } from '@/api';
import { Card, Badge, Spinner, Button, Empty } from '@/components/common';
import { timeAgo } from '@/utils';
import { useAuth, useToast } from '@/hooks';

export function ForumPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { error } = useToast();
  const [categories, setCategories] = useState([]);
  const [threads,    setThreads]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, thrRes] = await Promise.all([
          forumApi.getCategories(),
          forumApi.getThreads({ limit: 20 }),
        ]);
        setCategories(catRes.data.categories || []);
        setThreads(thrRes.data.data || []);
      } catch (err) {
        error(err.response?.data?.message || 'Failed to load forum');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = activeCategory
    ? threads.filter((t) => t.Category?.slug === activeCategory)
    : threads;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Forum</h1>
          <p className="text-slate-500 text-sm mt-0.5">Ask questions, share experiences</p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => navigate('/forum/new')}>+ New Thread</Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Categories sidebar ── */}
        <aside className="lg:w-52 shrink-0">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Categories</h3>
          <div className="space-y-1">
            <button onClick={() => setActiveCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!activeCategory ? 'bg-blue-50 text-[#1B3A6B] border border-blue-200' : 'text-slate-600 hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200'}`}>
              All threads
            </button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${activeCategory === cat.slug ? 'bg-blue-50 text-[#1B3A6B] border border-blue-200' : 'text-slate-600 hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200'}`}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Threads ── */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <Empty title="No threads yet" description="Be the first to start a discussion." />
          ) : (
            <div className="space-y-3">
              {filtered.map((thread) => (
                <Link key={thread.id} to={`/forum/${thread.slug}`}>
                  <Card className="p-4 bg-white border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          {thread.is_pinned  && <Badge color="red">Pinned</Badge>}
                          {thread.Category && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ color: thread.Category.color, backgroundColor: thread.Category.color + '22' }}>
                              {thread.Category.name}
                            </span>
                          )}
                          {thread.is_official && <Badge color="purple">Official</Badge>}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800 hover:text-[#1B3A6B] transition-colors">
                          {thread.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                          <span>by {thread.Author?.name || 'Anonymous'}</span>
                          <span>·</span>
                          <span>{timeAgo(thread.createdAt || thread.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500 shrink-0">
                        <div>{thread.reply_count || 0} replies</div>
                        <div>{thread.views || 0} views</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ForumThreadPage ────────────────────────────────────────────────────────────
export function ForumThreadPage() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { success, error } = useToast();
  const [thread,  setThread]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply,   setReply]   = useState('');
  const [posting, setPosting] = useState(false);
  const [actingReplyId, setActingReplyId] = useState(null);

  const loadThread = async () => {
    const res = await forumApi.getThread(slug);
    setThread(res.data.thread);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadThread();
      } catch (err) {
        error(err.response?.data?.message || 'Failed to load thread');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const submitReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setPosting(true);
    try {
      await forumApi.createReply(thread.id, { content: reply });
      await loadThread();
      setReply('');
      success('Reply posted');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (replyId) => {
    if (!isAuthenticated) {
      error('Please sign in to like replies');
      return;
    }
    setActingReplyId(replyId);
    try {
      await forumApi.toggleLike(replyId);
      await loadThread();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update like');
    } finally {
      setActingReplyId(null);
    }
  };

  const acceptReply = async (replyId) => {
    setActingReplyId(replyId);
    try {
      await forumApi.acceptReply(replyId);
      await loadThread();
      success('Accepted answer updated');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to accept reply');
    } finally {
      setActingReplyId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!thread) return <div className="text-center py-32 text-slate-400">Thread not found.</div>;

  const canAcceptReply = isAuthenticated && (user?.id === thread.author_id || user?.Role?.name === 'admin');

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/forum" className="text-sm text-slate-500 hover:text-[#1B3A6B] transition-colors mb-6 inline-block">← Back to Forum</Link>

      {/* Thread */}
      <Card className="p-6 mb-6 bg-white border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          {thread.Replies?.some((rep) => rep.is_accepted) && <Badge color="green">Solved</Badge>}
          {thread.Category && <Badge color="blue">{thread.Category.name}</Badge>}
          {thread.is_official && <Badge color="purple">Official</Badge>}
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-3">{thread.title}</h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{thread.content}</p>
        <div className="text-xs text-slate-500 flex gap-3">
          <span>Posted by {thread.Author?.name || 'Anonymous'}</span>
          <span>·</span>
          <span>{timeAgo(thread.createdAt || thread.created_at)}</span>
          <span>·</span>
          <span>{thread.views || 0} views</span>
        </div>
      </Card>

      {/* Replies */}
      <h2 className="text-sm font-semibold text-slate-700 mb-4">{thread.Replies?.length || 0} Replies</h2>
      <div className="space-y-3 mb-8">
        {(thread.Replies || []).filter(r => !r.is_deleted).map((rep) => (
          <Card key={rep.id} className={`p-4 bg-white border-slate-200 ${rep.is_accepted ? 'border-emerald-300 bg-emerald-50' : ''}`}>
            <div className="flex justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800">{rep.Author?.name || 'Anonymous'}</span>
                {rep.is_accepted && <Badge color="green">✓ Accepted</Badge>}
                {rep.is_official && <Badge color="purple">Official</Badge>}
              </div>
              <span className="text-xs text-slate-500">{timeAgo(rep.createdAt || rep.created_at)}</span>
            </div>
            <p className="text-sm text-slate-600">{rep.content}</p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                loading={actingReplyId === rep.id}
                onClick={() => toggleLike(rep.id)}
              >
                {rep.Likes?.some((like) => like.user_id === user?.id) ? 'Unlike' : 'Like'} ({rep.like_count || 0})
              </Button>
              {canAcceptReply && !rep.is_accepted && (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white text-[#1B3A6B] border-blue-200 hover:bg-blue-50"
                  loading={actingReplyId === rep.id}
                  onClick={() => acceptReply(rep.id)}
                >
                  Accept Answer
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Reply form */}
      {isAuthenticated ? (
        <Card className="p-5 bg-white border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Post a Reply</h3>
          <form onSubmit={submitReply}>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)}
              placeholder="Share your thoughts..." rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 resize-none mb-3" />
            <Button type="submit" loading={posting} disabled={!reply.trim()}>Post Reply</Button>
          </form>
        </Card>
      ) : (
        <Card className="p-5 text-center bg-white border-slate-200">
          <p className="text-slate-500 text-sm mb-3">Sign in to reply to this thread</p>
          <Link to="/login"><Button>Sign in</Button></Link>
        </Card>
      )}
    </div>
  );
}

// ── ForumNewThreadPage ───────────────────────────────────────────────────────
export function ForumNewThreadPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category_id: '',
    content: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await forumApi.getCategories();
        const nextCategories = res.data.categories || [];
        setCategories(nextCategories);
        setForm((prev) => ({ ...prev, category_id: prev.category_id || nextCategories[0]?.id || '' }));
      } catch (err) {
        error(err.response?.data?.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const submitThread = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      error('Please sign in to create a thread');
      return;
    }
    setSubmitting(true);
    try {
      const res = await forumApi.createThread({
        title: form.title.trim(),
        category_id: form.category_id,
        content: form.content.trim(),
      });
      success('Thread created');
      navigate(`/forum/${res.data.thread.slug}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create thread');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/forum" className="text-sm text-slate-500 hover:text-[#1B3A6B] transition-colors mb-6 inline-block">← Back to Forum</Link>
      <Card className="p-6 bg-white border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Start a New Thread</h1>
        <p className="mt-1 text-sm text-slate-500">Ask a question or share something helpful with the community.</p>

        <form onSubmit={submitThread} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="What would you like to ask?"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Category
            </label>
            <select
              value={form.category_id}
              onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Content
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Add the details people need in order to help you"
              rows={7}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={submitting}
              disabled={!form.title.trim() || !form.category_id || !form.content.trim()}
            >
              Post Thread
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
