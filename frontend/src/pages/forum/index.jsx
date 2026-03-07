// ── ForumPage ──────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forumApi } from '@/api';
import { Card, Badge, Spinner, Button, Empty } from '@/components/common';
import { timeAgo } from '@/utils';
import { useAuth } from '@/hooks';

export function ForumPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
        setThreads(thrRes.data.threads || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = activeCategory
    ? threads.filter((t) => t.ForumCategory?.slug === activeCategory)
    : threads;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Forum</h1>
          <p className="text-slate-400 text-sm mt-0.5">Ask questions, share experiences</p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => navigate('/forum/new')}>+ New Thread</Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Categories sidebar ── */}
        <aside className="lg:w-52 shrink-0">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
          <div className="space-y-1">
            <button onClick={() => setActiveCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!activeCategory ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}>
              All threads
            </button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${activeCategory === cat.slug ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}>
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
                  <Card className="p-4 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          {thread.is_pinned  && <Badge color="red">Pinned</Badge>}
                          {thread.is_solved  && <Badge color="green">Solved</Badge>}
                          {thread.ForumCategory && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ color: thread.ForumCategory.color, backgroundColor: thread.ForumCategory.color + '22' }}>
                              {thread.ForumCategory.name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-200 hover:text-indigo-400 transition-colors">
                          {thread.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                          <span>by {thread.User?.name || 'Anonymous'}</span>
                          <span>·</span>
                          <span>{timeAgo(thread.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500 shrink-0">
                        <div>{thread.reply_count || 0} replies</div>
                        <div>{thread.views_count || 0} views</div>
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
  const { useParams } = require('react-router-dom');
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [thread,  setThread]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply,   setReply]   = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await forumApi.getThread(slug);
        setThread(res.data.thread);
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
      const res = await forumApi.getThread(slug);
      setThread(res.data.thread);
      setReply('');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!thread) return <div className="text-center py-32 text-slate-400">Thread not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/forum" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-6 inline-block">← Back to Forum</Link>

      {/* Thread */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          {thread.is_solved && <Badge color="green">Solved</Badge>}
          {thread.ForumCategory && <Badge color="blue">{thread.ForumCategory.name}</Badge>}
        </div>
        <h1 className="text-xl font-bold text-white mb-3">{thread.title}</h1>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">{thread.content}</p>
        <div className="text-xs text-slate-500 flex gap-3">
          <span>Posted by {thread.User?.name}</span>
          <span>·</span>
          <span>{timeAgo(thread.created_at)}</span>
          <span>·</span>
          <span>{thread.views_count} views</span>
        </div>
      </Card>

      {/* Replies */}
      <h2 className="text-sm font-semibold text-slate-300 mb-4">{thread.Replies?.length || 0} Replies</h2>
      <div className="space-y-3 mb-8">
        {(thread.Replies || []).filter(r => !r.is_deleted).map((rep) => (
          <Card key={rep.id} className={`p-4 ${rep.is_accepted ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200">{rep.User?.name}</span>
                {rep.is_accepted && <Badge color="green">✓ Accepted</Badge>}
              </div>
              <span className="text-xs text-slate-500">{timeAgo(rep.created_at)}</span>
            </div>
            <p className="text-sm text-slate-400">{rep.content}</p>
          </Card>
        ))}
      </div>

      {/* Reply form */}
      {isAuthenticated ? (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Post a Reply</h3>
          <form onSubmit={submitReply}>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)}
              placeholder="Share your thoughts..." rows={4}
              className="input-base resize-none mb-3" />
            <Button type="submit" loading={posting} disabled={!reply.trim()}>Post Reply</Button>
          </form>
        </Card>
      ) : (
        <Card className="p-5 text-center">
          <p className="text-slate-400 text-sm mb-3">Sign in to reply to this thread</p>
          <Link to="/login"><Button>Sign in</Button></Link>
        </Card>
      )}
    </div>
  );
}
