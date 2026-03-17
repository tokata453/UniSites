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

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-4">
    <h3 className="text-sm font-bold tracking-wide text-slate-800 uppercase">{title}</h3>
    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
  </div>
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
  const [savedLoading, setSavedLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [liveReviews, setLiveReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    content: '',
    pros: '',
    cons: '',
  });

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

  useEffect(() => {
    if (!isAuthenticated || !uni?.id) {
      setSaved(false);
      return;
    }

    (async () => {
      setSavedLoading(true);
      try {
        const res = await authApi.getSavedItems();
        const isSaved = (res.data.items || []).some(
          (item) => item.item_type === 'university' && item.item_id === uni.id
        );
        setSaved(isSaved);
      } catch {
        setSaved(false);
      } finally {
        setSavedLoading(false);
      }
    })();
  }, [isAuthenticated, uni?.id]);

  useEffect(() => {
    if (!uni?.id || tab !== 'Reviews') return;

    (async () => {
      setReviewsLoading(true);
      try {
        const res = await universityApi.getReviews(uni.id);
        setLiveReviews(res.data.data || []);
      } catch {
        setLiveReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    })();
  }, [tab, uni?.id]);

  const handleSave = async () => {
    if (!isAuthenticated) return;
    setSavingLoading(true);
    try {
      const res = await authApi.toggleSavedItem({ item_type: 'university', item_id: uni.id });
      const nextSaved = !!res.data.saved;
      setSaved(nextSaved);
      success(nextSaved ? 'Saved!' : 'Removed from saved');
    } catch { error('Failed to save'); }
    finally { setSavingLoading(false); }
  };

  const setReviewField = (key, value) => setReviewForm((prev) => ({ ...prev, [key]: value }));

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      error('Please log in to submit a review');
      return;
    }
    if (!reviewForm.rating) {
      error('Please select an overall rating');
      return;
    }

    setReviewSubmitting(true);
    try {
      await universityApi.createReview(uni.id, {
        rating: reviewForm.rating,
        title: reviewForm.title.trim() || null,
        content: reviewForm.content.trim() || null,
        pros: reviewForm.pros.trim() || null,
        cons: reviewForm.cons.trim() || null,
      });
      setReviewSubmitted(true);
      setReviewForm({
        rating: 0,
        title: '',
        content: '',
        pros: '',
        cons: '',
      });
      if (tab === 'Reviews') {
        const res = await universityApi.getReviews(uni.id);
        setLiveReviews(res.data.data || []);
      }
      success('Review submitted. Pending approval.');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!uni)    return <div className="text-center py-32 text-slate-400">University not found.</div>;

  const uniType = uni.type || uni.university_type;
  const ts = TYPE_STYLES[uniType] || TYPE_STYLES.public;
  const contact = uni.Contact || {};
  const faculties = uni.Faculties || [];
  const allPrograms = faculties.flatMap((faculty) => faculty.Programs || []);
  const facultyCount = faculties.length || Number(uni.faculty_count || 0);
  const programCount = allPrograms.length || Number(uni.program_count || 0);
  const testimonials = (uni.Testimonials || []).filter((item) => item.is_approved);
  const programLanguages = Array.from(new Set(allPrograms.map((program) => program.language).filter(Boolean)));
  const approvedReviews = liveReviews.length > 0 ? liveReviews : (uni.Reviews || []).filter((review) => review.is_approved);
  const reviewCount = approvedReviews.length;
  const reviewAverage = reviewCount
    ? approvedReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount
    : Number(uni.rating_avg || 0);
  const reviewsByStar = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: approvedReviews.filter((review) => Number(review.rating) === star).length,
  }));

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ── Cover ── */}
      <div className="relative h-56 md:h-72 bg-slate-200 overflow-hidden">
        {uni.cover_url
          ? <img src={coverUrl(uni.cover_url)} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-slate-100 to-slate-200">🏛️</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 via-transparent to-transparent" />
      </div>

      {/* ── Header ── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-5 -mt-12 mb-8 relative z-10">

          <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 shadow-md flex items-center justify-center text-4xl overflow-hidden shrink-0">
            {uni.logo_url
              ? <img src={logoUrl(uni.logo_url)} alt="" className="w-full h-full object-cover" />
              : '🎓'}
          </div>

          <div className="flex-1 pt-2 md:pt-14">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
                style={{ background: ts.bg, border: `1px solid ${ts.border}`, color: ts.text }}>
                {uniType}
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
              <span className="font-semibold" style={{ color: '#F47B20' }}>
                ★ {Number(uni.rating_avg || 0).toFixed(1)}
                <span className="font-normal text-slate-400 ml-1">({uni.review_count || 0} reviews)</span>
              </span>
            </div>
          </div>

          <div className="flex gap-2 items-start md:pt-14 flex-wrap">
            <Link to="/universities" className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all">
              ← Back
            </Link>
            {uni.website_url && (
              <a href={uni.website_url} target="_blank" rel="noreferrer">
                <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all">
                  🌐 Website
                </button>
              </a>
            )}
            {isAuthenticated && (
              <button onClick={handleSave} disabled={savingLoading || savedLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-60"
                style={saved
                  ? { background: '#1B3A6B', color: '#fff', border: '1px solid #1B3A6B' }
                  : { background: '#fff', color: '#1B3A6B', border: '1px solid #1B3A6B' }}>
                {savingLoading || savedLoading ? 'Loading...' : saved ? '🔖 Saved' : '+ Save'}
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
                {uni.description_km && (
                  <Card className="p-6">
                    <SectionTitle title="Khmer Overview" subtitle="Local-language summary" />
                    <p className="text-sm leading-relaxed text-slate-600">{uni.description_km}</p>
                  </Card>
                )}
                {uni.accreditation && (
                  <Card className="p-6">
                    <SectionTitle title="Accreditation" subtitle="Recognition and institutional standing" />
                    <p className="text-sm text-slate-600">{uni.accreditation}</p>
                  </Card>
                )}
                {(uni.AdmissionRequirements || []).length > 0 && (
                  <Card className="p-6">
                    <SectionTitle title="Admission Requirements" subtitle="What applicants usually need to prepare" />
                    <div className="space-y-3">
                      {uni.AdmissionRequirements.slice(0, 6).map((req) => (
                        <div key={req.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">{req.title}</p>
                            {req.requirement_type && <Badge color="blue">{req.requirement_type}</Badge>}
                            {!req.is_mandatory && <Badge color="orange">Optional</Badge>}
                          </div>
                          {req.description && <p className="mt-2 text-sm text-slate-600">{req.description}</p>}
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                            {req.intake_period && <span>Intake: {req.intake_period}</span>}
                            {req.deadline && <span>Deadline: {new Date(req.deadline).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                {/* Facilities preview */}
                {(uni.CampusFacilities || uni.Facilities)?.length > 0 && (
                  <Card className="p-6">
                    <SectionTitle title="Campus Facilities" subtitle="What students can expect on campus" />
                    <div className="flex flex-wrap gap-2">
                      {(uni.CampusFacilities || uni.Facilities).map(f => (
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
                <Card className="p-6">
                  <SectionTitle title="Quick Info" subtitle="At-a-glance facts for faster comparison" />
                  <div className="space-y-3 text-sm">
                    {[
                      ['Type',      uniType],
                      ['Province',  uni.province],
                      ['Location',  uni.location],
                      ['Address',   uni.address],
                      ['Programs',  programCount ? `${programCount} programs` : null],
                      ['Faculties', facultyCount ? `${facultyCount} faculties` : null],
                      ['Tuition',   uni.tuition_min    ? `${formatCurrency(uni.tuition_min)} – ${formatCurrency(uni.tuition_max)}/yr` : null],
                      ['Ranking',   uni.ranking_local  ? `#${uni.ranking_local} in Cambodia` : null],
                      ['Global Rank', uni.ranking_global ? `#${uni.ranking_global} worldwide` : null],
                      ['Students', uni.student_count ? `${uni.student_count.toLocaleString()} enrolled` : null],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-slate-500 text-xs font-medium">{k}</span>
                        <span className="text-slate-700 font-semibold text-xs text-right capitalize max-w-[62%]">{v}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Contact */}
                {(uni.email || uni.phone || uni.facebook_url || uni.telegram_url || contact.general_email || contact.general_phone || contact.admission_email || contact.admission_phone || contact.office_hours) && (
                  <Card className="p-5">
                    <SectionTitle title="Contact" subtitle="The easiest ways to reach the university" />
                    <div className="space-y-2.5 text-sm">
                      {(contact.general_email || uni.email) && <p className="flex items-center gap-2 text-slate-600"><span>✉️</span> <span className="truncate">{contact.general_email || uni.email}</span></p>}
                      {(contact.general_phone || uni.phone) && <p className="flex items-center gap-2 text-slate-600"><span>📞</span> {contact.general_phone || uni.phone}</p>}
                      {contact.admission_email && <p className="flex items-center gap-2 text-slate-600"><span>🎓</span> <span className="truncate">{contact.admission_email}</span></p>}
                      {contact.admission_phone && <p className="flex items-center gap-2 text-slate-600"><span>☎️</span> {contact.admission_phone}</p>}
                      {contact.office_hours && <p className="flex items-center gap-2 text-slate-600"><span>🕘</span> {contact.office_hours}</p>}
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
                      {contact.map_embed_url && (
                        <a href={contact.map_embed_url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 font-medium hover:underline"
                          style={{ color: '#1B3A6B' }}>
                          🗺 View Map
                        </a>
                      )}
                    </div>
                  </Card>
                )}

                {/* Social links */}
                {(uni.instagram_url || uni.youtube_url || uni.tiktok_url) && (
                  <Card className="p-5">
                    <SectionTitle title="Social Media" subtitle="Follow the university outside UniSites" />
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
              {faculties.length > 0 ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Faculties</p>
                      <p className="mt-2 text-2xl font-bold text-slate-800">{faculties.length}</p>
                    </Card>
                    <Card className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Visible Programs</p>
                      <p className="mt-2 text-2xl font-bold text-slate-800">{allPrograms.length}</p>
                    </Card>
                    <Card className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Teaching Languages</p>
                      <p className="mt-2 text-sm font-semibold text-slate-700">{programLanguages.length ? programLanguages.join(', ') : 'Not specified'}</p>
                    </Card>
                  </div>

                  {faculties.map((faculty) => (
                    <Card key={faculty.id} className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-5">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-base shrink-0">🏛️</div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-base">{faculty.name}</h3>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                              {faculty.dean_name && <span>Dean: {faculty.dean_name}</span>}
                              {faculty.established_year && <span>Est. {faculty.established_year}</span>}
                              <span>{(faculty.Programs || []).length} program(s)</span>
                            </div>
                            {faculty.description && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{faculty.description}</p>}
                          </div>
                        </div>
                      </div>
                      {(faculty.Programs || []).length > 0 ? (
                        <div className="space-y-3">
                          {(faculty.Programs || []).map((prog) => (
                            <div key={prog.id} className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize"
                                      style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                                      {prog.degree_level}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-800">{prog.name}</span>
                                    {prog.language && (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">{prog.language}</span>
                                    )}
                                  </div>
                                  {prog.description && <p className="mt-2 text-sm text-slate-600 leading-relaxed">{prog.description}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 shrink-0 lg:min-w-[220px]">
                                  <div className="rounded-xl bg-white border border-slate-200 px-3 py-2">
                                    <span className="block text-[11px] uppercase tracking-wide text-slate-400">Duration</span>
                                    <span className="block mt-1 font-semibold text-slate-700">{prog.duration_years ? `${prog.duration_years} yrs` : 'N/A'}</span>
                                  </div>
                                  <div className="rounded-xl bg-white border border-slate-200 px-3 py-2">
                                    <span className="block text-[11px] uppercase tracking-wide text-slate-400">Tuition</span>
                                    <span className="block mt-1 font-semibold text-slate-700">{prog.tuition_fee ? formatCurrency(prog.tuition_fee) : 'N/A'}</span>
                                  </div>
                                  <div className="rounded-xl bg-white border border-slate-200 px-3 py-2">
                                    <span className="block text-[11px] uppercase tracking-wide text-slate-400">Credits</span>
                                    <span className="block mt-1 font-semibold text-slate-700">{prog.credits_required || 'N/A'}</span>
                                  </div>
                                  <div className="rounded-xl bg-white border border-slate-200 px-3 py-2">
                                    <span className="block text-[11px] uppercase tracking-wide text-slate-400">Availability</span>
                                    <span className="block mt-1 font-semibold text-slate-700">{prog.is_available ? 'Open' : 'Unavailable'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                          No programs listed under this faculty yet.
                        </div>
                      )}
                    </Card>
                  ))}
                </>
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
            <div className="space-y-5 max-w-4xl">
              <Card className="p-6">
                <SectionTitle
                  title="Share Your Experience"
                  subtitle={isAuthenticated
                    ? 'Your review helps other students. New submissions are moderated before they appear publicly.'
                    : 'Log in to leave a review for this university.'}
                />
                {reviewSubmitted ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
                    Your review has been submitted and is waiting for admin approval.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Overall Rating</p>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            disabled={!isAuthenticated || reviewSubmitting}
                            onClick={() => setReviewField('rating', star)}
                            className="text-2xl transition-transform hover:scale-110 disabled:cursor-not-allowed"
                            style={{ color: star <= reviewForm.rating ? '#F47B20' : '#cbd5e1' }}
                          >
                            ★
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-slate-500">
                          {reviewForm.rating ? `${reviewForm.rating} / 5` : 'Select a rating'}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Review Title</label>
                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) => setReviewField('title', e.target.value)}
                          disabled={!isAuthenticated || reviewSubmitting}
                          placeholder="Summarize your experience"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Best Part</label>
                        <input
                          type="text"
                          value={reviewForm.pros}
                          onChange={(e) => setReviewField('pros', e.target.value)}
                          disabled={!isAuthenticated || reviewSubmitting}
                          placeholder="What stood out positively?"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Detailed Review</label>
                      <textarea
                        value={reviewForm.content}
                        onChange={(e) => setReviewField('content', e.target.value)}
                        disabled={!isAuthenticated || reviewSubmitting}
                        rows={5}
                        placeholder="Share what studying here is really like"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">What Could Be Better?</label>
                      <textarea
                        value={reviewForm.cons}
                        onChange={(e) => setReviewField('cons', e.target.value)}
                        disabled={!isAuthenticated || reviewSubmitting}
                        rows={3}
                        placeholder="Any drawbacks or things future students should know"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-400">One review per account. Reviews appear after moderation.</p>
                      <button
                        type="button"
                        onClick={handleReviewSubmit}
                        disabled={!isAuthenticated || reviewSubmitting}
                        className="rounded-xl bg-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Rating summary */}
              {(reviewCount > 0 || Number(uni.rating_avg || 0) > 0) && (
                <Card className="p-6 flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold" style={{ color: '#F47B20' }}>{Number(reviewAverage || 0).toFixed(1)}</div>
                    <Stars n={Math.round(reviewAverage || 0)} />
                    <p className="text-xs text-slate-500 mt-1">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {reviewsByStar.map(({ star, count }) => {
                      const total = reviewCount || 1;
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

              {testimonials.length > 0 && (
                <Card className="p-6">
                  <SectionTitle title="Student Testimonials" subtitle="Featured experiences shared by students and graduates" />
                  <div className="grid gap-4 md:grid-cols-2">
                    {testimonials.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{item.name}</p>
                            {item.role && <p className="text-xs text-slate-500">{item.role}</p>}
                          </div>
                          <span style={{ color: '#F47B20' }}><Stars n={item.rating || 0} /></span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {reviewsLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner size="md" />
                </div>
              ) : approvedReviews.length > 0 ? (
                approvedReviews.map((rev) => (
                  <Card key={rev.id} className="p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0">
                          {rev.Author?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{rev.Author?.name || 'Anonymous'}</p>
                          <p className="text-xs text-slate-400">{new Date(rev.createdAt || rev.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span style={{ color: '#F47B20' }}><Stars n={rev.rating} /></span>
                        {rev.title && <span className="hidden md:inline text-xs font-semibold uppercase tracking-wide text-slate-400">Review</span>}
                      </div>
                    </div>
                    {rev.title   && <p className="text-base font-semibold text-slate-800 mb-2">{rev.title}</p>}
                    {rev.content && <p className="text-sm text-slate-600 leading-relaxed mb-4">{rev.content}</p>}
                    {(rev.pros || rev.cons) && (
                      <div className="grid gap-3 md:grid-cols-2">
                        {rev.pros && (
                          <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
                            <p className="text-xs font-bold text-green-700 mb-1">Pros</p>
                            <p className="text-sm text-green-700">{rev.pros}</p>
                          </div>
                        )}
                        {rev.cons && (
                          <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
                            <p className="text-xs font-bold text-red-700 mb-1">Cons</p>
                            <p className="text-sm text-red-700">{rev.cons}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <Empty title="No reviews yet." description={testimonials.length > 0 ? 'There are featured testimonials, but no approved review posts yet.' : 'Be the first to review this university.'} />
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
