import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { universityApi, authApi } from '@/api';
import { Spinner, Empty } from '@/components/common';
import { coverUrl, logoUrl, galleryUrl, formatCurrency } from '@/utils';
import { useAuth, useToast } from '@/hooks';

const TABS = ['Overview', 'Programs', 'Gallery', 'News', 'Events', 'FAQs', 'Reviews'];

const TYPE_STYLES = {
  public:        { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  private:       { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  international: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
};

const Badge = ({ children, color = 'blue' }) => {
  const map = {
    blue:   { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    green:  { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
    yellow: { bg: '#fefce8', border: '#fef08a', text: '#a16207' },
    purple: { bg: '#faf5ff', border: '#e9d5ff', text: '#7c3aed' },
    orange: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
  };
  const s = map[color] || map.blue;
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      {children}
    </span>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>{children}</div>
);

const Stars = ({ n }) => (
  <span className="text-sm">
    {'★'.repeat(n)}<span className="text-slate-300">{'★'.repeat(5 - n)}</span>
  </span>
);

export default function UniversityDetail() {
  const { slug }            = useParams();
  const { isAuthenticated } = useAuth();
  const { success, error }  = useToast();
  const [uni,     setUni]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('Overview');
  const [saved,   setSaved]   = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await universityApi.getBySlug(slug);
        setUni(res.data.university);
      } catch {
        error('University not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleSave = async () => {
    if (!isAuthenticated) return;
    setSavingLoading(true);
    try {
      await authApi.toggleSavedItem({ item_type: 'university', item_id: uni.id });
      setSaved(p => !p);
      success(saved ? 'Removed from saved' : 'Saved!');
    } catch { error('Failed to save'); }
    finally { setSavingLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!uni)    return <div className="text-center py-32 text-slate-400">University not found.</div>;

  const ts = TYPE_STYLES[uni.university_type] || TYPE_STYLES.public;

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ── Cover ── */}
      <div className="relative h-56 md:h-72 bg-slate-200 overflow-hidden">
        {uni.cover_url
          ? <img src={coverUrl(uni.cover_url)} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-slate-100 to-slate-200">🏛️</div>
        }
        {/* Bottom fade into page bg */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 via-transparent to-transparent" />
      </div>

      {/* ── Header ── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-5 -mt-12 mb-8 relative z-10">

          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 shadow-md flex items-center justify-center text-4xl overflow-hidden shrink-0">
            {uni.logo_url
              ? <img src={logoUrl(uni.logo_url)} alt="" className="w-full h-full object-cover" />
              : '🎓'}
          </div>

          <div className="flex-1 pt-2 md:pt-14">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
                style={{ background: ts.bg, border: `1px solid ${ts.border}`, color: ts.text }}>
                {uni.university_type}
              </span>
              {uni.is_verified           && <Badge color="green">✓ Verified</Badge>}
              {uni.scholarship_available && <Badge color="yellow">🏆 Scholarship</Badge>}
              {uni.dormitory_available   && <Badge color="purple">🏠 Dormitory</Badge>}
              {uni.is_featured           && <Badge color="orange">⭐ Featured</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{uni.name}</h1>
            {uni.name_km && <p className="text-slate-500 mt-0.5 text-sm">{uni.name_km}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
              {uni.province      && <span>📍 {uni.province}</span>}
              {uni.founded_year  && <span>🗓 Est. {uni.founded_year}</span>}
              {uni.student_count && <span>👥 {uni.student_count?.toLocaleString()} students</span>}
              {uni.rating_avg    && (
                <span className="font-semibold" style={{ color: '#F47B20' }}>
                  ★ {Number(uni.rating_avg).toFixed(1)}
                  <span className="font-normal text-slate-400 ml-1">({uni.review_count || 0} reviews)</span>
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 items-start md:pt-14 flex-wrap">
            {uni.website_url && (
              <a href={uni.website_url} target="_blank" rel="noreferrer">
                <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all">
                  🌐 Website
                </button>
              </a>
            )}
            {isAuthenticated && (
              <button onClick={handleSave} disabled={savingLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-60"
                style={saved
                  ? { background: '#1B3A6B', color: '#fff', border: '1px solid #1B3A6B' }
                  : { background: '#fff', color: '#1B3A6B', border: '1px solid #1B3A6B' }}>
                {saved ? '🔖 Saved' : '+ Save'}
              </button>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-0 overflow-x-auto mb-6 border-b border-slate-200">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px"
              style={tab === t
                ? { borderColor: '#1B3A6B', color: '#1B3A6B' }
                : { borderColor: 'transparent', color: '#64748b' }}
              onMouseEnter={e => { if (tab !== t) e.currentTarget.style.color = '#1B3A6B'; }}
              onMouseLeave={e => { if (tab !== t) e.currentTarget.style.color = '#64748b'; }}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="pb-16">

          {/* ── Overview ── */}
          {tab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                {uni.description && (
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">About</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{uni.description}</p>
                  </Card>
                )}
                {uni.accreditation && (
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-slate-700 mb-2">Accreditation</h3>
                    <p className="text-sm text-slate-600">{uni.accreditation}</p>
                  </Card>
                )}
                {/* Facilities preview */}
                {uni.Facilities?.length > 0 && (
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Campus Facilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {uni.Facilities.map(f => (
                        <span key={f.id} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600">
                          {f.icon || '📌'} {f.name}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                {/* Quick stats */}
                <Card className="p-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">Quick Info</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      ['Type',      uni.university_type],
                      ['Province',  uni.province],
                      ['Programs',  uni.program_count ? `${uni.program_count} programs` : null],
                      ['Faculties', uni.faculty_count  ? `${uni.faculty_count} faculties` : null],
                      ['Tuition',   uni.tuition_min    ? `${formatCurrency(uni.tuition_min)} – ${formatCurrency(uni.tuition_max)}/yr` : null],
                      ['Ranking',   uni.ranking_local  ? `#${uni.ranking_local} in Cambodia` : null],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-slate-500 text-xs font-medium">{k}</span>
                        <span className="text-slate-700 font-semibold text-xs capitalize">{v}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Contact */}
                {(uni.email || uni.phone || uni.facebook_url || uni.telegram_url) && (
                  <Card className="p-5">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Contact</h3>
                    <div className="space-y-2.5 text-sm">
                      {uni.email        && <p className="flex items-center gap-2 text-slate-600"><span>✉️</span> <span className="truncate">{uni.email}</span></p>}
                      {uni.phone        && <p className="flex items-center gap-2 text-slate-600"><span>📞</span> {uni.phone}</p>}
                      {uni.facebook_url && (
                        <a href={uni.facebook_url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 font-medium hover:underline transition-colors"
                          style={{ color: '#1877f2' }}>
                          🔗 Facebook Page
                        </a>
                      )}
                      {uni.telegram_url && (
                        <a href={uni.telegram_url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 font-medium hover:underline"
                          style={{ color: '#0088cc' }}>
                          ✈️ Telegram
                        </a>
                      )}
                    </div>
                  </Card>
                )}

                {/* Social links */}
                {(uni.instagram_url || uni.youtube_url || uni.tiktok_url) && (
                  <Card className="p-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Social Media</h3>
                    <div className="flex gap-2 flex-wrap">
                      {uni.instagram_url && <a href={uni.instagram_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100 transition-colors">Instagram</a>}
                      {uni.youtube_url   && <a href={uni.youtube_url}   target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50  text-red-600  border border-red-200  hover:bg-red-100  transition-colors">YouTube</a>}
                      {uni.tiktok_url    && <a href={uni.tiktok_url}    target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors">TikTok</a>}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ── Programs ── */}
          {tab === 'Programs' && (
            <div className="space-y-4">
              {(uni.Faculties || []).length > 0 ? (
                uni.Faculties.map((faculty) => (
                  <Card key={faculty.id} className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-base">🏛️</div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{faculty.name}</h3>
                        {faculty.dean_name && <p className="text-xs text-slate-500">Dean: {faculty.dean_name}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(faculty.Programs || []).map((prog) => (
                        <div key={prog.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize"
                              style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                              {prog.degree_level}
                            </span>
                            <span className="text-sm font-medium text-slate-700">{prog.name}</span>
                            {prog.language && prog.language !== 'Khmer' && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">{prog.language}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
                            <span>{prog.duration_years} yrs</span>
                            {prog.tuition_fee && <span className="font-semibold text-slate-700">${prog.tuition_fee.toLocaleString()}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              ) : (
                <Empty title="No programs listed yet." />
              )}
            </div>
          )}

          {/* ── Gallery ── */}
          {tab === 'Gallery' && (
            <>
              {(uni.Gallery || []).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {uni.Gallery.map((img) => (
                    <div key={img.id} className="aspect-video rounded-2xl overflow-hidden bg-slate-100 shadow-sm group cursor-pointer">
                      <img
                        src={galleryUrl(img.public_id || img.url)}
                        alt={img.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Empty title="No gallery images yet." />
              )}
            </>
          )}

          {/* ── News ── */}
          {tab === 'News' && (
            <div className="space-y-3">
              {(uni.News || []).length > 0 ? (
                uni.News.map((item) => (
                  <Card key={item.id} className="p-4 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 mb-1">{item.title}</p>
                        {item.excerpt && <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.excerpt}</p>}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {item.category && <Badge color="blue">{item.category}</Badge>}
                          {item.published_at && <span className="text-xs text-slate-400">{new Date(item.published_at).toLocaleDateString()}</span>}
                          {item.is_pinned && <Badge color="orange">📌 Pinned</Badge>}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">👁 {item.views_count || 0}</span>
                    </div>
                  </Card>
                ))
              ) : (
                <Empty title="No news yet." />
              )}
            </div>
          )}

          {/* ── Events ── */}
          {tab === 'Events' && (
            <div className="space-y-3">
              {(uni.Events || []).length > 0 ? (
                uni.Events.map((ev) => (
                  <Card key={ev.id} className="p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800 mb-1">{ev.title}</p>
                        {ev.description && <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {ev.type && <Badge color="purple">{ev.type.replace('_', ' ')}</Badge>}
                          {ev.event_date && <span className="text-xs text-slate-500">📅 {new Date(ev.event_date).toLocaleDateString()}</span>}
                          {ev.location && <span className="text-xs text-slate-500">📍 {ev.location}</span>}
                          {ev.is_online && <Badge color="green">Online</Badge>}
                        </div>
                        {ev.registration_url && (
                          <a href={ev.registration_url} target="_blank" rel="noreferrer"
                            className="inline-block mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-all"
                            style={{ background: '#1B3A6B' }}>
                            Register →
                          </a>
                        )}
                      </div>
                      {ev.is_featured && <Badge color="yellow">⭐ Featured</Badge>}
                    </div>
                  </Card>
                ))
              ) : (
                <Empty title="No upcoming events." />
              )}
            </div>
          )}

          {/* ── FAQs ── */}
          {tab === 'FAQs' && (
            <div className="space-y-3 max-w-3xl">
              {(uni.FAQs || []).length > 0 ? (
                uni.FAQs.map((faq, i) => (
                  <Card key={faq.id} className="p-5">
                    <p className="text-sm font-bold mb-2" style={{ color: '#1B3A6B' }}>Q{i + 1}. {faq.question}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                    {faq.category && <span className="inline-block mt-2 text-xs text-slate-400 font-medium">{faq.category}</span>}
                  </Card>
                ))
              ) : (
                <Empty title="No FAQs yet." />
              )}
            </div>
          )}

          {/* ── Reviews ── */}
          {tab === 'Reviews' && (
            <div className="space-y-4 max-w-3xl">
              {/* Rating summary */}
              {uni.rating_avg > 0 && (
                <Card className="p-5 flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: '#F47B20' }}>{Number(uni.rating_avg).toFixed(1)}</div>
                    <Stars n={Math.round(uni.rating_avg)} />
                    <p className="text-xs text-slate-500 mt-1">{uni.review_count || 0} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(star => {
                      const count = (uni.Reviews || []).filter(r => r.is_approved && r.rating === star).length;
                      const total = (uni.Reviews || []).filter(r => r.is_approved).length || 1;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 w-4">{star}★</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${(count/total)*100}%`, background: '#F47B20' }} />
                          </div>
                          <span className="text-slate-400 w-4 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {(uni.Reviews || []).filter(r => r.is_approved).length > 0 ? (
                uni.Reviews.filter(r => r.is_approved).map((rev) => (
                  <Card key={rev.id} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700">
                          {rev.Author?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{rev.Author?.name || 'Anonymous'}</p>
                          <p className="text-xs text-slate-400">{new Date(rev.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span style={{ color: '#F47B20' }}><Stars n={rev.rating} /></span>
                    </div>
                    {rev.title   && <p className="text-sm font-semibold text-slate-800 mb-1">{rev.title}</p>}
                    {rev.content && <p className="text-sm text-slate-600 leading-relaxed mb-3">{rev.content}</p>}
                    {(rev.pros || rev.cons) && (
                      <div className="flex flex-col sm:flex-row gap-3 mt-2">
                        {rev.pros && (
                          <div className="flex-1 p-3 rounded-xl bg-green-50 border border-green-200">
                            <p className="text-xs font-bold text-green-700 mb-1">👍 Pros</p>
                            <p className="text-xs text-green-600">{rev.pros}</p>
                          </div>
                        )}
                        {rev.cons && (
                          <div className="flex-1 p-3 rounded-xl bg-red-50 border border-red-200">
                            <p className="text-xs font-bold text-red-700 mb-1">👎 Cons</p>
                            <p className="text-xs text-red-600">{rev.cons}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <Empty title="No reviews yet." description="Be the first to review this university." />
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}