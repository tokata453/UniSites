import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { universityApi, authApi, inboxApi } from '@/api';
import { Spinner, Empty } from '@/components/common';
import { coverUrl, logoUrl, galleryUrl, formatCurrency, formatDate, cloudinaryUrl } from '@/utils';
import { useAuth, useToast } from '@/hooks';

const TABS = ['Overview', 'Programs', 'Gallery', 'News', 'Events', 'FAQs', 'Reviews'];
const GALLERY_SOURCE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'gallery', label: 'Uploaded' },
  { value: 'news', label: 'News' },
  { value: 'event', label: 'Events' },
];
const GALLERY_CATEGORY_LABELS = {
  campus: 'Campus',
  facilities: 'Facilities',
  events: 'Events',
  students: 'Students',
  other: 'Other',
};

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

const DetailMediaCarousel = ({ images = [], title, imageIndex = 0, onPrev, onNext }) => {
  if (!images.length) return null;

  const currentIndex = Math.min(imageIndex, images.length - 1);
  const currentImage = images[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <div className="flex min-h-[260px] items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
        <img
          src={coverUrl(currentImage) || currentImage}
          alt={title || ''}
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

const GalleryFilterSelect = ({ value, onChange, options, placeholder = 'Select an option' }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full md:w-56">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-700 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected?.label || placeholder}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl" role="listbox">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-all ${
                  active ? 'bg-blue-50 font-semibold text-[#1B3A6B]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function UniversityDetail() {
  const { slug }            = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { success, error, info }  = useToast();
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
  const [reviewError, setReviewError] = useState('');
  const [openFaculties, setOpenFaculties] = useState({});
  const [newsImageIndexes, setNewsImageIndexes] = useState({});
  const [eventImageIndexes, setEventImageIndexes] = useState({});
  const [galleryFocusIndex, setGalleryFocusIndex] = useState(null);
  const [galleryFilter, setGalleryFilter] = useState('all');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('all');
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    content: '',
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

  useEffect(() => {
    const facultyItems = uni?.Faculties || [];
    if (!facultyItems.length) return;

    setOpenFaculties((prev) => {
      if (Object.keys(prev).length) return prev;
      return facultyItems.reduce((acc, faculty, index) => {
        acc[faculty.id] = index === 0;
        return acc;
      }, {});
    });
  }, [uni?.Faculties]);

  useEffect(() => {
    if (galleryFocusIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setGalleryFocusIndex(null);
        return;
      }
      if (event.key === 'ArrowLeft') {
        setGalleryFocusIndex((prev) => (prev === null ? prev : (prev - 1 + activityGallery.length) % activityGallery.length));
      }
      if (event.key === 'ArrowRight') {
        setGalleryFocusIndex((prev) => (prev === null ? prev : (prev + 1) % activityGallery.length));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [galleryFocusIndex, uni]);

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

  const inboxPath = user?.Role?.name === 'owner'
    ? '/owner/inbox'
    : user?.Role?.name === 'organization'
    ? '/organization/inbox'
    : user?.Role?.name === 'admin'
    ? '/admin/inbox'
    : '/dashboard/inbox';

  const handleMessageUniversity = async () => {
    const recipientId = uni?.Owner?.id || uni?.owner_id;
    if (!isAuthenticated) {
      info('Please log in to send a message');
      navigate('/login');
      return;
    }
    if (!recipientId) {
      error('This university does not have a contact owner yet');
      return;
    }
    try {
      const res = await inboxApi.createConversation({ recipient_id: recipientId });
      const conversationId = res.data.conversation?.id;
      navigate(`${inboxPath}${conversationId ? `?conversation=${conversationId}` : ''}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to open conversation');
    }
  };

  const setReviewField = (key, value) => setReviewForm((prev) => ({ ...prev, [key]: value }));
  const toggleFaculty = (facultyId) =>
    setOpenFaculties((prev) => ({ ...prev, [facultyId]: !prev[facultyId] }));
  const cycleMedia = (setIndexes, key, images, direction) => {
    if (images.length <= 1) return;
    setIndexes((prev) => {
      const current = prev[key] ?? 0;
      const next = (current + direction + images.length) % images.length;
      return { ...prev, [key]: next };
    });
  };

  const handleReviewSubmit = async (event) => {
    event?.preventDefault();
    setReviewError('');

    if (!isAuthenticated) {
      setReviewError('Please log in to submit a review.');
      error('Please log in to submit a review');
      return;
    }
    if (!uni?.id) {
      setReviewError('University details are still loading. Please try again.');
      error('University details are still loading');
      return;
    }
    if (!reviewForm.rating) {
      setReviewError('Please select an overall rating.');
      error('Please select an overall rating');
      return;
    }

    setReviewSubmitting(true);
    try {
      await universityApi.createReview(uni.id, {
        rating: reviewForm.rating,
        content: reviewForm.content.trim() || null,
        title: null,
        pros: null,
        cons: null,
      });
      setReviewSubmitted(true);
      setReviewForm({
        rating: 0,
        content: '',
      });
      if (tab === 'Reviews') {
        const res = await universityApi.getReviews(uni.id);
        setLiveReviews(res.data.data || []);
      }
      success('Review published successfully.');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit review';
      setReviewError(message);
      error(message);
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
  const activityGallery = [
    ...(uni.Gallery || []).map((item) => ({
      id: item.id,
      url: item.public_id || item.url,
      title: item.caption || 'Gallery image',
      kind: 'Gallery',
      source: 'gallery',
      uploadCategory: item.category || 'other',
    })),
    ...(uni.News || []).flatMap((item) => {
      const images = Array.isArray(item.image_urls) && item.image_urls.length
        ? item.image_urls
        : item.cover_url
        ? [item.cover_url]
        : [];
      return images.map((image, index) => ({
        id: `news-${item.id}-${index}`,
        url: image,
        title: item.title,
        kind: 'News',
        source: 'news',
      }));
    }),
    ...(uni.Events || []).flatMap((item) => {
      const images = Array.isArray(item.image_urls) && item.image_urls.length
        ? item.image_urls
        : item.cover_url
        ? [item.cover_url]
        : [];
      return images.map((image, index) => ({
        id: `event-${item.id}-${index}`,
        url: image,
        title: item.title,
        kind: 'Event',
        source: 'event',
      }));
    }),
  ];
  const uploadedGalleryCategoryOptions = [
    { value: 'all', label: 'All uploaded' },
    ...Object.entries(GALLERY_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
  ];
  const filteredActivityGallery = activityGallery.filter((item) => galleryFilter === 'all' || item.source === galleryFilter);
  const finalGalleryItems = filteredActivityGallery.filter((item) =>
    galleryCategoryFilter === 'all' || (item.source === 'gallery' && item.uploadCategory === galleryCategoryFilter)
  );
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
            <button
              type="button"
              onClick={handleMessageUniversity}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
            >
              ✉️ Message University
            </button>
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
                      <button
                        type="button"
                        onClick={() => toggleFaculty(faculty.id)}
                        className="mb-5 flex w-full flex-col gap-4 text-left md:flex-row md:items-start md:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-base shrink-0">🏛️</div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-slate-800 text-base">{faculty.name}</h3>
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                                {(faculty.Programs || []).length} program{(faculty.Programs || []).length === 1 ? '' : 's'}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                              {faculty.dean_name && <span>Dean: {faculty.dean_name}</span>}
                              {faculty.established_year && <span>Est. {faculty.established_year}</span>}
                            </div>
                            {faculty.description && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{faculty.description}</p>}
                          </div>
                        </div>
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 shrink-0">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform ${openFaculties[faculty.id] ? 'rotate-180' : ''}`}
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </span>
                      </button>
                      {openFaculties[faculty.id] ? (
                        (faculty.Programs || []).length > 0 ? (
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
                        )
                      ) : null}
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
              <div className="mb-4 flex flex-wrap gap-2">
                {GALLERY_SOURCE_FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setGalleryFilter(option.value);
                      if (option.value !== 'all' && option.value !== 'gallery') setGalleryCategoryFilter('all');
                      setGalleryFocusIndex(null);
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                      galleryFilter === option.value
                        ? 'border border-[#1B3A6B] bg-[#1B3A6B] text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {(galleryFilter === 'all' || galleryFilter === 'gallery') && uploadedGalleryCategoryOptions.length > 1 ? (
                <div className="mb-4">
                  <GalleryFilterSelect
                    value={galleryCategoryFilter}
                    onChange={(nextValue) => {
                      setGalleryCategoryFilter(nextValue);
                      setGalleryFocusIndex(null);
                    }}
                    options={uploadedGalleryCategoryOptions}
                  />
                </div>
              ) : null}
              {finalGalleryItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
                  {finalGalleryItems.map((img, index) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setGalleryFocusIndex(index)}
                      className="group relative aspect-square overflow-hidden bg-slate-100 text-left shadow-sm"
                    >
                      <img
                        src={cloudinaryUrl(img.url, 'w_1200,h_1200,c_fit,q_auto,f_auto') || img.url}
                        alt={img.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent px-3 py-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <p className="text-xs font-medium leading-5 text-white line-clamp-2">{img.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <Empty
                  title={
                    galleryFilter === 'all'
                      ? 'No gallery images yet.'
                      : `No ${GALLERY_SOURCE_FILTERS.find((item) => item.value === galleryFilter)?.label.toLowerCase()} images yet.`
                  }
                />
              )}
            </>
          )}

          {/* ── News ── */}
          {tab === 'News' && (
            <div className="space-y-3">
              {(uni.News || []).length > 0 ? (
                uni.News.map((item) => (
                  <Card key={item.id} className="p-4 md:p-5">
                    {(() => {
                      const images = Array.isArray(item.image_urls) && item.image_urls.length
                        ? item.image_urls
                        : item.cover_url
                        ? [item.cover_url]
                        : [];
                      const itemKey = `news:${item.id}`;
                      return (
                        <>
                          {images.length > 0 && (
                            <div className="mb-4">
                              <DetailMediaCarousel
                                images={images}
                                title={item.title}
                                imageIndex={newsImageIndexes[itemKey] ?? 0}
                                onPrev={() => cycleMedia(setNewsImageIndexes, itemKey, images, -1)}
                                onNext={() => cycleMedia(setNewsImageIndexes, itemKey, images, 1)}
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xl font-semibold leading-snug text-slate-900">{item.title}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {item.category && <Badge color="blue">{item.category}</Badge>}
                              {item.is_pinned && <Badge color="orange">Pinned</Badge>}
                              {item.published_at && <span className="text-xs text-slate-400">{formatDate(item.published_at)}</span>}
                            </div>
                          </div>
                          {(item.excerpt || item.content) && (
                            <div className="mt-4 space-y-3">
                              {item.excerpt && (
                                <p className="text-sm font-medium leading-7 text-slate-700">{item.excerpt}</p>
                              )}
                              {item.content && (
                                <p className="text-sm leading-7 text-slate-600 whitespace-pre-line">{item.content}</p>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}
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
                  <Card key={ev.id} className="p-4 md:p-5">
                    {(() => {
                      const images = Array.isArray(ev.image_urls) && ev.image_urls.length
                        ? ev.image_urls
                        : ev.cover_url
                        ? [ev.cover_url]
                        : [];
                      const itemKey = `event:${ev.id}`;
                      return (
                        <>
                          {images.length > 0 && (
                            <div className="mb-4">
                              <DetailMediaCarousel
                                images={images}
                                title={ev.title}
                                imageIndex={eventImageIndexes[itemKey] ?? 0}
                                onPrev={() => cycleMedia(setEventImageIndexes, itemKey, images, -1)}
                                onNext={() => cycleMedia(setEventImageIndexes, itemKey, images, 1)}
                              />
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="text-xl font-semibold leading-snug text-slate-900">{ev.title}</p>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {ev.type && <Badge color="purple">{ev.type.replace('_', ' ')}</Badge>}
                                {ev.is_online && <Badge color="green">Online</Badge>}
                                {ev.is_featured && <Badge color="yellow">Featured</Badge>}
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                                {ev.event_date && <span>📅 {formatDate(ev.event_date)}</span>}
                                {ev.location && <span>📍 {ev.location}</span>}
                              </div>
                            </div>
                          </div>
                          {ev.description && (
                            <p className="mt-4 text-sm leading-7 text-slate-600 whitespace-pre-line">{ev.description}</p>
                          )}
                          {ev.registration_url && (
                            <a
                              href={ev.registration_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mt-4 text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-all"
                              style={{ background: '#1B3A6B' }}
                            >
                              Register →
                            </a>
                          )}
                        </>
                      );
                    })()}
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
                    ? 'Your review helps other students and appears on the page right away.'
                    : 'Log in to leave a review for this university.'}
                />
                {reviewSubmitted ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
                    Your review has been published successfully.
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
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

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Your Review</label>
                      <textarea
                        value={reviewForm.content}
                        onChange={(e) => setReviewField('content', e.target.value)}
                        disabled={!isAuthenticated || reviewSubmitting}
                        rows={4}
                        placeholder="Optional: share a few words about your experience"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    {reviewError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {reviewError}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-400">One review per account. Keep it honest, respectful, and helpful for future students.</p>
                      <button
                        type="submit"
                        disabled={!isAuthenticated || reviewSubmitting}
                        className="rounded-xl bg-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </form>
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
                  <Card key={rev.id} className="p-4 md:p-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-xs font-semibold text-slate-700">
                            {rev.Author?.avatar_url ? (
                              <img src={rev.Author.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              rev.Author?.name?.[0]?.toUpperCase() || 'A'
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{rev.Author?.name || 'Anonymous student'}</p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-400">
                              <span>{new Date(rev.createdAt || rev.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{Number(rev.rating || 0).toFixed(1)}/5</span>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 text-xs" style={{ color: '#F47B20' }}>
                          <Stars n={rev.rating} />
                        </div>
                      </div>

                      <div>
                        {rev.title && <h4 className="mb-1 text-[15px] font-semibold text-slate-900">{rev.title}</h4>}
                        {rev.content && <p className="text-sm leading-6 text-slate-600">{rev.content}</p>}
                      </div>

                      {(rev.pros || rev.cons) && (
                        <div className="grid gap-2.5 md:grid-cols-2">
                          {rev.pros && (
                            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                              <p className="mb-0.5 text-[11px] font-medium text-slate-400">Pros</p>
                              <p className="text-sm leading-6 text-slate-700">{rev.pros}</p>
                            </div>
                          )}
                          {rev.cons && (
                            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                              <p className="mb-0.5 text-[11px] font-medium text-slate-400">Cons</p>
                              <p className="text-sm leading-6 text-slate-700">{rev.cons}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {rev.owner_reply && (
                        <div className="border-l-2 border-slate-200 pl-3">
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">University reply</p>
                            {rev.owner_replied_at && (
                              <span className="text-[11px] text-slate-400">{formatDate(rev.owner_replied_at)}</span>
                            )}
                          </div>
                          <p className="mt-1.5 text-sm leading-6 text-slate-700">{rev.owner_reply}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <Empty title="No reviews yet." description={testimonials.length > 0 ? 'There are featured testimonials, but no approved review posts yet.' : 'Be the first to review this university.'} />
              )}
            </div>
          )}

        </div>
      </div>

      {galleryFocusIndex !== null && finalGalleryItems[galleryFocusIndex] ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/94 px-4 py-6 backdrop-blur-sm" onClick={() => setGalleryFocusIndex(null)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.15)_0%,rgba(15,23,42,0.72)_48%,rgba(2,6,23,0.96)_100%)]" />
          <button
            type="button"
            onClick={() => setGalleryFocusIndex(null)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-2xl text-white shadow-lg backdrop-blur transition-all hover:bg-white/22"
            aria-label="Close gallery focus mode"
          >
            ×
          </button>

          {finalGalleryItems.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setGalleryFocusIndex((prev) => (prev - 1 + finalGalleryItems.length) % finalGalleryItems.length);
                }}
                className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-3xl text-white shadow-lg backdrop-blur transition-all hover:bg-white/22"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setGalleryFocusIndex((prev) => (prev + 1) % finalGalleryItems.length);
                }}
                className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-3xl text-white shadow-lg backdrop-blur transition-all hover:bg-white/22"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          ) : null}

          <div className="relative z-10 max-h-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <img
              src={cloudinaryUrl(finalGalleryItems[galleryFocusIndex].url, 'w_1800,h_1800,c_fit,q_auto,f_auto') || finalGalleryItems[galleryFocusIndex].url}
              alt={finalGalleryItems[galleryFocusIndex].title}
              className="max-h-[78vh] w-auto max-w-full object-contain shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
            />
            <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur-md">
              <div className="min-w-0 flex-1">
                {finalGalleryItems[galleryFocusIndex].title ? (
                  <div className="truncate">{finalGalleryItems[galleryFocusIndex].title}</div>
                ) : (
                  <div>Image {galleryFocusIndex + 1}</div>
                )}
              </div>
              {finalGalleryItems.length > 1 ? (
                <div className="shrink-0 text-xs text-white/70">
                  {galleryFocusIndex + 1} / {finalGalleryItems.length}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
