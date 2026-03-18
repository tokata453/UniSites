import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { universityApi, uploadApi, opportunityApi, majorApi } from '@/api';
import { Spinner } from '@/components/common';
import { useToast } from '@/hooks';
import { formatCurrency, formatDate, galleryUrl, logoUrl, coverUrl, optimizeImageFile, cloudinaryUrl } from '@/utils';

const TYPE_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'international', label: 'International' },
];

const DEGREE_OPTIONS = [
  { value: 'associate', label: 'Associate' },
  { value: 'bachelor', label: 'Bachelor' },
  { value: 'master', label: 'Master' },
  { value: 'phd', label: 'PhD' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'diploma', label: 'Diploma' },
];

const EVENT_OPTIONS = [
  { value: 'open_day', label: 'Open Day' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'sports', label: 'Sports' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'competition', label: 'Competition' },
  { value: 'other', label: 'Other' },
];

const OPPORTUNITY_TYPE_OPTIONS = [
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'internship', label: 'Internship' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'competition', label: 'Competition' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'research', label: 'Research' },
  { value: 'parttime', label: 'Part-time' },
  { value: 'volunteer', label: 'Volunteer' },
];

const GALLERY_OPTIONS = [
  { value: 'campus', label: 'Campus' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'events', label: 'Events' },
  { value: 'students', label: 'Students' },
  { value: 'other', label: 'Other' },
];
const GALLERY_SOURCE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'gallery', label: 'Uploaded' },
  { value: 'news', label: 'News' },
  { value: 'event', label: 'Events' },
];

const MAX_UPLOAD_IMAGE_BYTES = 20 * 1024 * 1024;

const cardClass = 'bg-white border border-slate-200 rounded-2xl shadow-sm';
const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10 transition-all';
const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5';
const primaryBtn = 'inline-flex items-center justify-center rounded-xl bg-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryBtn = 'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50';
const dangerBtn = 'inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100';

const emptyProfileForm = {
  name: '',
  name_km: '',
  type: 'private',
  description: '',
  description_km: '',
  province: '',
  location: '',
  address: '',
  founded_year: '',
  student_count: '',
  tuition_min: '',
  tuition_max: '',
  accreditation: '',
  ranking_local: '',
  website_url: '',
  email: '',
  phone: '',
  facebook_url: '',
  telegram_url: '',
  instagram_url: '',
  youtube_url: '',
  linkedin_url: '',
  tiktok_url: '',
  scholarship_available: false,
  dormitory_available: false,
  international_students: false,
  meta_title: '',
  meta_description: '',
};

const emptyFacultyForm = {
  name: '',
  name_km: '',
  dean_name: '',
  description: '',
  established_year: '',
  sort_order: 0,
};

const emptyProgramForm = {
  name: '',
  name_km: '',
  faculty_id: '',
  major_id: '',
  degree_level: 'bachelor',
  duration_years: '',
  language: 'English',
  tuition_fee: '',
  credits_required: '',
  description: '',
  is_available: true,
};

const emptyNewsForm = {
  title: '',
  excerpt: '',
  content: '',
  category: '',
  tags: '',
  cover_url: '',
  image_urls: [],
  is_published: true,
  is_pinned: false,
};

const emptyEventForm = {
  title: '',
  description: '',
  cover_url: '',
  image_urls: [],
  event_date: '',
  end_date: '',
  location: '',
  type: 'other',
  is_online: false,
  meeting_url: '',
  registration_url: '',
  registration_deadline: '',
  max_participants: '',
  is_published: true,
  is_featured: false,
};

const emptyFaqForm = {
  question: '',
  answer: '',
  category: '',
  sort_order: 0,
  is_published: true,
};

const emptyOpportunityForm = {
  title: '',
  description: '',
  cover_url: '',
  image_urls: [],
  type: 'scholarship',
  deadline: '',
  start_date: '',
  end_date: '',
  eligibility: '',
  field_of_study: '',
  country: '',
  location: '',
  source: 'internal',
  source_url: '',
  application_url: '',
  contact_email: '',
  funding_amount: '',
  funding_currency: 'USD',
  is_fully_funded: false,
  is_online: false,
};

const emptyContactForm = {
  admission_email: '',
  admission_phone: '',
  general_email: '',
  general_phone: '',
  whatsapp: '',
  telegram: '',
  facebook_page: '',
  instagram: '',
  youtube: '',
  linkedin: '',
  tiktok: '',
  office_hours: '',
  map_embed_url: '',
};

const toDateTimeLocalValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function useOwnerUniversity() {
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await universityApi.getMine();
      setUniversity(res.data.universities?.[0] || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { university, loading, refresh };
}

function PageSection({ title, subtitle, action, children }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Panel({ title, description, children, action }) {
  return (
    <section className={`${cardClass} p-5`}>
      {(title || action) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      {label && <span className={labelClass}>{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function TextInput(props) {
  return <input className={inputClass} {...props} />;
}

function TextArea(props) {
  return <textarea className={`${inputClass} resize-y`} {...props} />;
}

function ImageUploadField({ values = [], onUpload, uploading, onRemove, hint = 'Recommended for feed cards and detail pages.' }) {
  return (
    <Field label="Images" hint={hint}>
      <div className="space-y-3">
        {values.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {values.map((value, index) => (
              <div key={`${value}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img src={coverUrl(value) || value} alt={`Upload ${index + 1}`} className="h-36 w-full object-cover" />
                <div className="absolute left-3 top-3 rounded-full bg-slate-900/70 px-2 py-1 text-[11px] font-semibold text-white">
                  {index === 0 ? 'Main' : `Image ${index + 1}`}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove?.(index)}
                  className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-red-600 shadow-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
            No images uploaded yet
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <label className={secondaryBtn}>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onUpload?.(Array.from(e.target.files || []), e)}
              disabled={uploading}
            />
            {uploading ? 'Uploading...' : values.length ? 'Add More Images' : 'Upload Images'}
          </label>
        </div>
      </div>
    </Field>
  );
}

function MediaImageCarousel({ item, imageIndex, onPrev, onNext }) {
  const images = Array.isArray(item.image_urls) && item.image_urls.length
    ? item.image_urls
    : item.cover_url
    ? [item.cover_url]
    : [];

  if (!images.length) return null;

  const currentIndex = Math.min(imageIndex ?? 0, images.length - 1);
  const currentImage = images[currentIndex];

  return (
    <div className="relative mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <div className="flex min-h-[280px] items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
        <img src={coverUrl(currentImage) || currentImage} alt={item.title} className="max-h-[560px] w-full object-contain" />
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
}

function SelectInput({ options, value, onChange, placeholder = 'Select an option' }) {
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
    onChange?.({ target: { value: nextValue } });
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`${inputClass} flex items-center justify-between text-left`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'text-slate-700' : 'text-slate-400'}>{selected?.label || placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>
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
}

function ToggleField({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100"
    >
      <span
        className={`relative h-5 w-9 rounded-full transition-all ${checked ? 'bg-[#1B3A6B]' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-4.5' : 'left-0.5'}`}
        />
      </span>
      {label}
    </button>
  );
}

function StatusPill({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className={`${cardClass} p-10 text-center`}>
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

function LoadingBlock() {
  return <div className="flex justify-center py-20"><Spinner /></div>;
}

function NoUniversity() {
  return (
    <EmptyState
      title="No university assigned yet"
      description="Once an admin assigns a university to your account, your owner dashboard will show its profile, content, and analytics here."
    />
  );
}

function numericValue(value) {
  return value === '' || value === null || value === undefined ? null : Number(value);
}

function OverviewStat({ label, value, tone = 'blue' }) {
  const accents = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
  };

  return (
    <div className={`${cardClass} p-5`}>
      <div className={`inline-flex rounded-xl border px-3 py-1 text-xs font-semibold ${accents[tone] || accents.blue}`}>
        {label}
      </div>
      <div className="mt-4 text-3xl font-bold text-slate-800">{value}</div>
    </div>
  );
}

function MiniBarChart({ title, description, data, color = '#1B3A6B' }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <Panel title={title} description={description}>
      <div className="space-y-4">
        <div className="flex h-52 items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 pb-4 pt-6">
          {data.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-3">
              <span className="text-xs font-semibold text-slate-500">{item.value.toLocaleString()}</span>
              <div className="flex h-36 w-full items-end justify-center">
                <div
                  className="w-full max-w-[64px] rounded-t-2xl transition-all"
                  style={{
                    height: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 12 : 4)}%`,
                    background: `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`,
                    boxShadow: `0 10px 18px ${color}22`,
                  }}
                />
              </div>
              <span className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ProgressChart({ title, description, rows, accent = '#15803d' }) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <Panel title={title} description={description}>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">{row.label}</span>
              <span className="font-semibold text-slate-800">{row.value.toLocaleString()}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max((row.value / maxValue) * 100, row.value > 0 ? 8 : 0)}%`,
                  background: `linear-gradient(90deg, ${accent} 0%, ${accent}aa 100%)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function OwnerOverview() {
  const { university, loading } = useOwnerUniversity();
  const [analytics, setAnalytics] = useState(null);
  const [summary, setSummary] = useState({ gallery: 0, faculties: 0, programs: 0, news: 0, events: 0, faqs: 0, opportunities: 0, pendingReviews: 0, flaggedReviews: 0 });

  useEffect(() => {
    if (!university?.id) return;

    Promise.all([
      universityApi.getAnalytics(university.id).catch(() => ({ data: {} })),
      universityApi.getGallery(university.id).catch(() => ({ data: { gallery: [] } })),
      universityApi.getFaculties(university.id).catch(() => ({ data: { faculties: [] } })),
      universityApi.getPrograms(university.id).catch(() => ({ data: { programs: [] } })),
      universityApi.getNews(university.id).catch(() => ({ data: { data: [] } })),
      universityApi.getEvents(university.id).catch(() => ({ data: { data: [] } })),
      universityApi.getFAQs(university.id).catch(() => ({ data: { faqs: [] } })),
      opportunityApi.getMine().catch(() => ({ data: { opportunities: [] } })),
      universityApi.getOwnerReviews(university.id).catch(() => ({ data: { reviews: [] } })),
    ]).then(([analyticsRes, galleryRes, facultiesRes, programsRes, newsRes, eventsRes, faqRes, opportunitiesRes, ownerReviewsRes]) => {
      const ownerOpportunities = (opportunitiesRes.data.opportunities || []).filter((opp) => opp.university_id === university.id);
      const ownerReviews = ownerReviewsRes.data.reviews || [];
      setAnalytics(analyticsRes.data.analytics || analyticsRes.data || null);
      setSummary({
        gallery: galleryRes.data.gallery?.length || 0,
        faculties: facultiesRes.data.faculties?.length || 0,
        programs: programsRes.data.programs?.length || 0,
        news: newsRes.data.data?.length || 0,
        events: eventsRes.data.data?.length || 0,
        faqs: faqRes.data.faqs?.length || 0,
        opportunities: ownerOpportunities.length,
        pendingReviews: ownerReviews.filter((review) => !review.is_approved).length,
        flaggedReviews: ownerReviews.filter((review) => review.flagged_for_recheck).length,
      });
    });
  }, [university?.id]);

  const profileCompletion = useMemo(() => {
    if (!university) return 0;
    const importantFields = [
      university.name,
      university.description,
      university.type || university.university_type,
      university.province,
      university.address,
      university.website_url,
      university.email,
      university.phone,
      university.facebook_url,
      university.accreditation,
    ];
    const complete = importantFields.filter(Boolean).length;
    return Math.round((complete / importantFields.length) * 100);
  }, [university]);

  const actionItems = useMemo(() => {
    if (!university) return [];
    return [
      { label: 'Add a logo and cover image', done: Boolean(university.logo_url && university.cover_url), to: '/owner/profile' },
      { label: 'Publish your university profile', done: Boolean(university.is_published), to: '/owner/profile' },
      { label: 'Add at least one faculty', done: summary.faculties > 0, to: '/owner/faculties' },
      { label: 'Add at least one program', done: summary.programs > 0, to: '/owner/faculties' },
      { label: 'Publish a news post or event', done: summary.news > 0 || summary.events > 0, to: '/owner/news' },
      { label: 'Complete contact links', done: Boolean(university.website_url && university.email && university.phone), to: '/owner/profile' },
    ];
  }, [summary.events, summary.faculties, summary.news, summary.programs, university]);

  const completedActions = actionItems.filter((item) => item.done).length;
  const trafficTrend = [
    { label: 'Daily', value: analytics?.daily_views ?? 0 },
    { label: 'Weekly', value: analytics?.weekly_views ?? 0 },
    { label: 'Monthly', value: analytics?.monthly_views ?? 0 },
  ];
  const engagementBreakdown = [
    { label: 'Website Clicks', value: analytics?.website_clicks ?? 0 },
    { label: 'Contact Clicks', value: analytics?.contact_clicks ?? 0 },
    { label: 'Gallery Views', value: analytics?.gallery_views ?? 0 },
  ];
  const dailyViews = analytics?.daily_views ?? 0;
  const weeklyViews = analytics?.weekly_views ?? 0;
  const weeklyAvg = weeklyViews / 7;
  const dailyTrend = dailyViews > weeklyAvg ? 'up' : dailyViews < weeklyAvg ? 'down' : 'flat';
  const clickThroughBase = Math.max(analytics?.total_views ?? university?.views_count ?? 0, 1);
  const clickThroughRate = Math.round((((analytics?.website_clicks ?? 0) + (analytics?.contact_clicks ?? 0)) / clickThroughBase) * 100);
  const performanceNotes = [
    dailyTrend === 'up'
      ? 'Daily traffic is running above your weekly pace.'
      : dailyTrend === 'down'
        ? 'Daily traffic is softer than your weekly average right now.'
        : 'Daily traffic is tracking close to your weekly average.',
    clickThroughRate >= 10
      ? 'Your page is converting views into clicks strongly.'
      : clickThroughRate >= 5
        ? 'Students are engaging at a healthy level, but there is room to improve calls-to-action.'
        : 'Clicks are low compared with views, so contact and application prompts may need to be stronger.',
    summary.pendingReviews > 0
      ? `You have ${summary.pendingReviews} review${summary.pendingReviews === 1 ? '' : 's'} waiting on moderation or follow-up.`
      : 'There are no pending reviews waiting on your attention right now.',
  ];

  if (loading) return <LoadingBlock />;
  if (!university) return <NoUniversity />;

  return (
    <PageSection
      title="Owner Overview"
      subtitle="Track how your university page is performing and what still needs attention."
      action={
        university.slug && university.is_published ? (
          <Link to={`/universities/${university.slug}`} className={secondaryBtn}>View Public Page</Link>
        ) : null
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewStat label="Total Views" value={(analytics?.total_views ?? university?.views_count ?? 0).toLocaleString()} tone="blue" />
        <OverviewStat label="Average Rating" value={`${Number(university.rating_avg || 0).toFixed(1)} / 5`} tone="orange" />
        <OverviewStat label="Reviews" value={(university.review_count || 0).toLocaleString()} tone="green" />
        <OverviewStat label="Profile Completion" value={`${profileCompletion}%`} tone="slate" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="University Snapshot" description="A quick read on visibility, trust signals, and content volume.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">{university.name}</p>
              <p className="mt-1 text-sm text-slate-500">{university.province || 'Province not set'}{university.founded_year ? ` • Founded ${university.founded_year}` : ''}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusPill tone={university.is_published ? 'green' : 'amber'}>{university.is_published ? 'Published' : 'Draft'}</StatusPill>
                <StatusPill tone={university.is_verified ? 'blue' : 'slate'}>{university.is_verified ? 'Verified' : 'Unverified'}</StatusPill>
                <StatusPill tone={university.is_featured ? 'orange' : 'slate'}>{university.is_featured ? 'Featured' : 'Not Featured'}</StatusPill>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Enrollment & Tuition</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>Students: <span className="font-semibold text-slate-800">{(university.student_count || 0).toLocaleString()}</span></p>
                <p>Programs: <span className="font-semibold text-slate-800">{summary.programs || university.program_count || 0}</span></p>
                <p>
                  Tuition:{' '}
                  <span className="font-semibold text-slate-800">
                    {university.tuition_min ? `${formatCurrency(university.tuition_min)} - ${formatCurrency(university.tuition_max || university.tuition_min)}` : 'Not set'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Gallery images', summary.gallery],
              ['Faculties', summary.faculties],
              ['Programs', summary.programs],
              ['News posts', summary.news],
              ['Events', summary.events],
              ['FAQs', summary.faqs],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Performance Notes" description="A short read on what the current analytics are telling you.">
          <div className="space-y-3">
            {performanceNotes.map((note) => (
              <div key={note} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {note}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Tip: complete your profile, publish at least one news post, and keep gallery photos fresh to make the page feel active.
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <MiniBarChart
          title="Traffic Trend"
          description="A simple view of your current traffic levels across daily, weekly, and monthly windows."
          data={trafficTrend}
          color="#1B3A6B"
        />
        <ProgressChart
          title="Engagement Breakdown"
          description="These interactions show whether students are moving beyond page views."
          rows={engagementBreakdown}
          accent="#15803d"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Action Checklist" description="A quick guide to the most important owner tasks.">
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Completion progress</p>
              <p className="text-sm text-slate-500">{completedActions} of {actionItems.length} core tasks completed</p>
            </div>
            <div className="text-2xl font-bold text-slate-800">{Math.round((completedActions / actionItems.length) * 100)}%</div>
          </div>
          <div className="space-y-3">
            {actionItems.map((item) => (
              <Link key={item.label} to={item.to} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${item.done ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.done ? '✓' : '!'}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.done ? 'Done' : 'Open'}</span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Quick Actions" description="Jump straight to the sections owners update most often.">
          <div className="grid gap-3">
            {[
              { to: '/owner/profile', title: 'Update profile', meta: 'Refresh contact details, tuition, and brand assets' },
              { to: '/owner/faculties', title: 'Manage faculties & programs', meta: 'Keep your academic structure current and complete' },
              { to: '/owner/news', title: 'Publish news & events', meta: 'Share fresh updates so the page feels active' },
              { to: '/owner/opportunities', title: 'Manage opportunities', meta: 'Post scholarships, internships, and new openings' },
              { to: '/owner/reviews', title: 'Review responses', meta: 'Reply to students and follow up on flagged feedback' },
              { to: '/owner/faq', title: 'Improve FAQs', meta: 'Answer common questions before students need to ask' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50">
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Public page status:{' '}
            <span className="font-semibold">
              {university.is_published ? 'Students can view your page live' : 'Your page is still in draft mode'}
            </span>
          </div>
        </Panel>
      </div>
    </PageSection>
  );
}

export function OwnerProfile() {
  const { university, loading, refresh } = useOwnerUniversity();
  const { success, error } = useToast();
  const [form, setForm] = useState(emptyProfileForm);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (!university) return;
    setForm({
      ...emptyProfileForm,
      ...university,
      type: university.type || university.university_type || 'private',
      founded_year: university.founded_year ?? '',
      student_count: university.student_count ?? '',
      tuition_min: university.tuition_min ?? '',
      tuition_max: university.tuition_max ?? '',
      ranking_local: university.ranking_local ?? '',
    });
  }, [university]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!university?.id) return;
    setSaving(true);
    try {
      await universityApi.update(university.id, {
        ...form,
        founded_year: numericValue(form.founded_year),
        student_count: numericValue(form.student_count),
        tuition_min: numericValue(form.tuition_min),
        tuition_max: numericValue(form.tuition_max),
        ranking_local: numericValue(form.ranking_local),
      });
      success('University profile updated');
      refresh();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update university profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAssetUpload = async (kind, file) => {
    if (!file) return;

    const body = new FormData();
    body.append(kind, file);

    const setUploading = kind === 'logo' ? setUploadingLogo : setUploadingCover;
    const field = kind === 'logo' ? 'logo_url' : 'cover_url';

    setUploading(true);
    try {
      const res = kind === 'logo'
        ? await uploadApi.logo(body)
        : await uploadApi.cover(body);

      setField(field, res.data.public_id || res.data.url);
      success(`${kind === 'logo' ? 'Logo' : 'Cover'} uploaded. Save changes to publish it.`);
    } catch (err) {
      error(err.response?.data?.message || `Failed to upload ${kind}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingBlock />;
  if (!university) return <NoUniversity />;

  return (
    <PageSection
      title="University Profile"
      subtitle="Manage the public details students see on your university page."
      action={<button type="button" onClick={handleSave} disabled={saving} className={primaryBtn}>{saving ? 'Saving...' : 'Save Changes'}</button>}
    >
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <Panel title="Core Information" description="This appears at the top of the public university page.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="University Name"><TextInput value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="University name" /></Field>
            <Field label="Khmer Name"><TextInput value={form.name_km} onChange={(e) => setField('name_km', e.target.value)} placeholder="Khmer name" /></Field>
            <Field label="Type"><SelectInput value={form.type} onChange={(e) => setField('type', e.target.value)} options={TYPE_OPTIONS} /></Field>
            <Field label="Province"><TextInput value={form.province} onChange={(e) => setField('province', e.target.value)} placeholder="Province" /></Field>
            <Field label="Location"><TextInput value={form.location} onChange={(e) => setField('location', e.target.value)} placeholder="Campus area or district" /></Field>
            <Field label="Founded Year"><TextInput type="number" value={form.founded_year} onChange={(e) => setField('founded_year', e.target.value)} placeholder="1960" /></Field>
            <Field label="Student Count"><TextInput type="number" value={form.student_count} onChange={(e) => setField('student_count', e.target.value)} placeholder="5000" /></Field>
            <Field label="Local Ranking"><TextInput type="number" value={form.ranking_local} onChange={(e) => setField('ranking_local', e.target.value)} placeholder="1" /></Field>
            <Field label="Tuition Min (USD)"><TextInput type="number" value={form.tuition_min} onChange={(e) => setField('tuition_min', e.target.value)} placeholder="500" /></Field>
            <Field label="Tuition Max (USD)"><TextInput type="number" value={form.tuition_max} onChange={(e) => setField('tuition_max', e.target.value)} placeholder="3000" /></Field>
            <div className="md:col-span-2">
              <Field label="Address"><TextArea rows={3} value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="Full mailing address" /></Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Description"><TextArea rows={5} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Tell students what makes this university unique" /></Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Khmer Description"><TextArea rows={4} value={form.description_km} onChange={(e) => setField('description_km', e.target.value)} placeholder="Optional Khmer description" /></Field>
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Branding">
            <div className="space-y-5">
              <div>
                <p className={labelClass}>Logo</p>
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-2xl text-slate-400">
                    {form.logo_url ? (
                      <img src={logoUrl(form.logo_url) || form.logo_url} alt="University logo" className="h-full w-full object-cover" />
                    ) : (
                      '🎓'
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAssetUpload('logo', e.target.files?.[0])}
                      className="block text-sm text-slate-500"
                    />
                    <p className="text-xs text-slate-400">Best for square images. Upload first, then save profile changes.</p>
                    {uploadingLogo && <p className="text-xs font-medium text-[#1B3A6B]">Uploading logo...</p>}
                  </div>
                </div>
              </div>

              <div>
                <p className={labelClass}>Cover Image</p>
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <div className="h-32 w-full bg-slate-100">
                      {form.cover_url ? (
                        <img src={coverUrl(form.cover_url) || form.cover_url} alt="University cover" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">No cover uploaded yet</div>
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAssetUpload('cover', e.target.files?.[0])}
                    className="block text-sm text-slate-500"
                  />
                  <p className="text-xs text-slate-400">Use a wide campus banner for the best result.</p>
                  {uploadingCover && <p className="text-xs font-medium text-[#1B3A6B]">Uploading cover...</p>}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Publishing Status">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={university.is_published ? 'green' : 'amber'}>{university.is_published ? 'Published' : 'Awaiting publication'}</StatusPill>
              <StatusPill tone={university.is_verified ? 'blue' : 'slate'}>{university.is_verified ? 'Verified' : 'Not verified'}</StatusPill>
              <StatusPill tone={university.is_featured ? 'orange' : 'slate'}>{university.is_featured ? 'Featured' : 'Standard listing'}</StatusPill>
            </div>
            <p className="mt-3 text-sm text-slate-500">Publication and featured status are controlled by admin review, but you can keep the content ready here.</p>
          </Panel>

          <Panel title="Contact & Social Links">
            <div className="space-y-4">
              <Field label="Website URL"><TextInput value={form.website_url} onChange={(e) => setField('website_url', e.target.value)} placeholder="https://example.edu.kh" /></Field>
              <Field label="Public Email"><TextInput value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="info@example.edu.kh" /></Field>
              <Field label="Phone"><TextInput value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+855 ..." /></Field>
              <Field label="Accreditation"><TextInput value={form.accreditation} onChange={(e) => setField('accreditation', e.target.value)} placeholder="National / international accreditation" /></Field>
              <Field label="Facebook URL"><TextInput value={form.facebook_url} onChange={(e) => setField('facebook_url', e.target.value)} placeholder="https://facebook.com/..." /></Field>
              <Field label="Telegram URL"><TextInput value={form.telegram_url} onChange={(e) => setField('telegram_url', e.target.value)} placeholder="https://t.me/..." /></Field>
              <Field label="Instagram URL"><TextInput value={form.instagram_url} onChange={(e) => setField('instagram_url', e.target.value)} placeholder="https://instagram.com/..." /></Field>
              <Field label="YouTube URL"><TextInput value={form.youtube_url} onChange={(e) => setField('youtube_url', e.target.value)} placeholder="https://youtube.com/..." /></Field>
              <Field label="LinkedIn URL"><TextInput value={form.linkedin_url} onChange={(e) => setField('linkedin_url', e.target.value)} placeholder="https://linkedin.com/..." /></Field>
              <Field label="TikTok URL"><TextInput value={form.tiktok_url} onChange={(e) => setField('tiktok_url', e.target.value)} placeholder="https://tiktok.com/..." /></Field>
            </div>
          </Panel>

          <Panel title="Student-facing Flags">
            <div className="space-y-3">
              <ToggleField label="Scholarships available" checked={!!form.scholarship_available} onChange={(value) => setField('scholarship_available', value)} />
              <ToggleField label="Dormitory available" checked={!!form.dormitory_available} onChange={(value) => setField('dormitory_available', value)} />
              <ToggleField label="Accepts international students" checked={!!form.international_students} onChange={(value) => setField('international_students', value)} />
            </div>
          </Panel>

          <Panel title="SEO Metadata">
            <div className="space-y-4">
              <Field label="Meta Title"><TextInput value={form.meta_title} onChange={(e) => setField('meta_title', e.target.value)} placeholder="SEO title" /></Field>
              <Field label="Meta Description"><TextArea rows={3} value={form.meta_description} onChange={(e) => setField('meta_description', e.target.value)} placeholder="Short search description" /></Field>
            </div>
          </Panel>
        </div>
      </div>
    </PageSection>
  );
}

export function OwnerGallery() {
  const { university, loading } = useOwnerUniversity();
  const { success, error } = useToast();
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('campus');
  const [uploading, setUploading] = useState(false);
  const [focusIndex, setFocusIndex] = useState(null);
  const [galleryFilter, setGalleryFilter] = useState('all');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('all');

  const loadGallery = useCallback(async (uniId) => {
    setGalleryLoading(true);
    try {
      const [galleryRes, newsRes, eventRes] = await Promise.all([
        universityApi.getGallery(uniId).catch(() => ({ data: { gallery: [] } })),
        universityApi.getNews(uniId).catch(() => ({ data: { data: [] } })),
        universityApi.getEvents(uniId).catch(() => ({ data: { data: [] } })),
      ]);

      const activityGallery = [
        ...(galleryRes.data.gallery || []).map((item) => ({
          id: item.id,
          url: item.public_id || item.url,
          caption: item.caption || 'Gallery image',
          category: item.category || 'gallery',
          source: 'gallery',
          uploadCategory: item.category || 'other',
        })),
        ...(newsRes.data.data || []).flatMap((item) => {
          const images = Array.isArray(item.image_urls) && item.image_urls.length
            ? item.image_urls
            : item.cover_url
            ? [item.cover_url]
            : [];
          return images.map((image, index) => ({
            id: `news-${item.id}-${index}`,
            url: image,
            caption: item.title || item.excerpt || 'News image',
            category: 'news',
            source: 'news',
          }));
        }),
        ...(eventRes.data.data || []).flatMap((item) => {
          const images = Array.isArray(item.image_urls) && item.image_urls.length
            ? item.image_urls
            : item.cover_url
            ? [item.cover_url]
            : [];
          return images.map((image, index) => ({
            id: `event-${item.id}-${index}`,
            url: image,
            caption: item.title || item.description || 'Event image',
            category: 'event',
            source: 'event',
          }));
        }),
      ];

      setGallery(activityGallery);
    } catch {
      setGallery([]);
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (university?.id) loadGallery(university.id);
  }, [loadGallery, university?.id]);

  useEffect(() => {
    if (focusIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFocusIndex(null);
        return;
      }
      if (event.key === 'ArrowLeft') {
        setFocusIndex((prev) => (prev === null ? prev : (prev - 1 + gallery.length) % gallery.length));
      }
      if (event.key === 'ArrowRight') {
        setFocusIndex((prev) => (prev === null ? prev : (prev + 1) % gallery.length));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [focusIndex, gallery.length]);
  const uploadedGalleryCategoryOptions = [
    { value: 'all', label: 'All uploaded' },
    ...GALLERY_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
  ];
  const filteredGallery = gallery.filter((item) =>
    (galleryFilter === 'all' || item.source === galleryFilter) &&
    (galleryCategoryFilter === 'all' || (item.source === 'gallery' && item.uploadCategory === galleryCategoryFilter))
  );

  const handleUpload = async () => {
    if (!university?.id || files.length === 0) return;
    setUploading(true);
    try {
      const preparedFiles = await Promise.all(files.map((file) => optimizeImageFile(file)));
      const validFiles = preparedFiles.filter((file) => file.size <= MAX_UPLOAD_IMAGE_BYTES);
      const oversizedFiles = preparedFiles.filter((file) => file.size > MAX_UPLOAD_IMAGE_BYTES);

      if (oversizedFiles.length > 0) {
        error(`${oversizedFiles.length} image${oversizedFiles.length > 1 ? 's are' : ' is'} over 20MB even after compression and was skipped`);
      }

      if (!validFiles.length) return;

      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append('images', file);
        formData.append('captions', caption);
      });
      formData.append('category', category);

      await universityApi.uploadGallery(university.id, formData);
      success('Gallery updated');
      setFiles([]);
      setCaption('');
      setCategory('campus');
      loadGallery(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to upload gallery images');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await universityApi.deleteGallery(university.id, id);
      success('Image deleted');
      loadGallery(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete image');
    }
  };

  if (loading) return <LoadingBlock />;
  if (!university) return <NoUniversity />;

  return (
    <PageSection title="Gallery" subtitle="Upload campus imagery to make your university page feel alive.">
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.25fr]">
        <Panel title="Upload Images" description="The backend accepts up to 20 images per upload.">
          <div className="space-y-4">
            <Field label="Images">
              <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="block w-full text-sm text-slate-500" />
            </Field>
            <Field label="Category"><SelectInput value={category} onChange={(e) => setCategory(e.target.value)} options={GALLERY_OPTIONS} /></Field>
            <Field label="Caption" hint="The same caption will be applied to this upload batch.">
              <TextInput value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Campus tour, library, student life..." />
            </Field>
            {files.length > 0 && (
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-700">Ready to upload</p>
                <ul className="mt-2 space-y-1">
                  {files.map((file) => <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>)}
                </ul>
              </div>
            )}
            <button type="button" onClick={handleUpload} disabled={uploading || files.length === 0} className={primaryBtn}>{uploading ? 'Uploading...' : 'Upload Images'}</button>
          </div>
        </Panel>

        <Panel title="Current Gallery" description={`${gallery.length} image(s) currently shown for ${university.name}.`}>
          {galleryLoading ? (
            <LoadingBlock />
          ) : gallery.length === 0 ? (
            <EmptyState title="No gallery images yet" description="Add images to your news or events posts and they will appear here automatically." />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                {GALLERY_SOURCE_FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setGalleryFilter(option.value);
                      if (option.value !== 'all' && option.value !== 'gallery') setGalleryCategoryFilter('all');
                      setFocusIndex(null);
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
                <div className="mb-4 max-w-xs">
                  <SelectInput
                    value={galleryCategoryFilter}
                    onChange={(e) => {
                      setGalleryCategoryFilter(e.target.value);
                      setFocusIndex(null);
                    }}
                    options={uploadedGalleryCategoryOptions}
                    placeholder="Filter uploaded images"
                  />
                </div>
              ) : null}
              {filteredGallery.length === 0 ? (
                <EmptyState
                  title={
                    galleryFilter === 'all'
                      ? 'No gallery images yet'
                      : `No ${GALLERY_SOURCE_FILTERS.find((item) => item.value === galleryFilter)?.label.toLowerCase()} images yet`
                  }
                  description="Try another gallery filter or add more images."
                />
              ) : (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4">
              {filteredGallery.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFocusIndex(index)}
                  className="group relative aspect-square overflow-hidden bg-slate-100 text-left shadow-sm"
                >
                  <img
                    src={cloudinaryUrl(item.url, 'w_1200,h_1200,c_fit,q_auto,f_auto') || item.url}
                    alt={item.caption || 'Gallery image'}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent px-3 py-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-xs font-medium leading-5 text-white line-clamp-2">{item.caption || 'Gallery image'}</p>
                  </div>
                </button>
              ))}
              </div>
              )}
            </>
          )}
        </Panel>
      </div>

      {focusIndex !== null && filteredGallery[focusIndex] ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/94 px-4 py-6 backdrop-blur-sm" onClick={() => setFocusIndex(null)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.15)_0%,rgba(15,23,42,0.72)_48%,rgba(2,6,23,0.96)_100%)]" />
          <button
            type="button"
            onClick={() => setFocusIndex(null)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-2xl text-white shadow-lg backdrop-blur transition-all hover:bg-white/22"
            aria-label="Close gallery focus mode"
          >
            ×
          </button>

          {filteredGallery.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setFocusIndex((prev) => (prev - 1 + filteredGallery.length) % filteredGallery.length);
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
                  setFocusIndex((prev) => (prev + 1) % filteredGallery.length);
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
              src={cloudinaryUrl(filteredGallery[focusIndex].url, 'w_1800,h_1800,c_fit,q_auto,f_auto') || filteredGallery[focusIndex].url}
              alt={filteredGallery[focusIndex].caption || 'Gallery image'}
              className="max-h-[78vh] w-auto max-w-full object-contain shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
            />
            <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur-md">
              <div className="min-w-0 flex-1">
                <div className="truncate">{filteredGallery[focusIndex].caption || 'Gallery image'}</div>
              </div>
              {filteredGallery.length > 1 ? (
                <div className="shrink-0 text-xs text-white/70">
                  {focusIndex + 1} / {filteredGallery.length}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </PageSection>
  );
}

export function OwnerFaculties() {
  const { university, loading } = useOwnerUniversity();
  const { success, error } = useToast();
  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [majors, setMajors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [facultyForm, setFacultyForm] = useState(emptyFacultyForm);
  const [programForm, setProgramForm] = useState(emptyProgramForm);
  const [editingFacultyId, setEditingFacultyId] = useState(null);
  const [editingProgramId, setEditingProgramId] = useState(null);

  const loadData = useCallback(async (uniId) => {
    const [facRes, progRes, majorRes] = await Promise.all([
      universityApi.getFaculties(uniId).catch(() => ({ data: { faculties: [] } })),
      universityApi.getPrograms(uniId).catch(() => ({ data: { programs: [] } })),
      majorApi.list({ limit: 200 }).catch(() => ({ data: { data: [], majors: [] } })),
    ]);
    setFaculties(facRes.data.faculties || []);
    setPrograms(progRes.data.programs || []);
    setMajors(majorRes.data.data || majorRes.data.majors || []);
  }, []);

  useEffect(() => {
    if (university?.id) loadData(university.id);
  }, [loadData, university?.id]);

  const submitFaculty = async () => {
    setBusy(true);
    try {
      const payload = {
        ...facultyForm,
        established_year: numericValue(facultyForm.established_year),
        sort_order: numericValue(facultyForm.sort_order) || 0,
      };

      if (editingFacultyId) {
        await universityApi.updateFaculty(university.id, editingFacultyId, payload);
        success('Faculty updated');
      } else {
        await universityApi.createFaculty(university.id, payload);
        success('Faculty added');
      }

      setFacultyForm(emptyFacultyForm);
      setEditingFacultyId(null);
      loadData(university.id);
    } catch (err) {
      error(err.response?.data?.message || `Failed to ${editingFacultyId ? 'update' : 'add'} faculty`);
    } finally {
      setBusy(false);
    }
  };

  const startEditFaculty = (faculty) => {
    setEditingFacultyId(faculty.id);
    setFacultyForm({
      name: faculty.name || '',
      name_km: faculty.name_km || '',
      dean_name: faculty.dean_name || '',
      description: faculty.description || '',
      established_year: faculty.established_year || '',
      sort_order: faculty.sort_order || 0,
    });
  };

  const resetFacultyForm = () => {
    setFacultyForm(emptyFacultyForm);
    setEditingFacultyId(null);
  };

  const submitProgram = async () => {
    setBusy(true);
    try {
      const payload = {
        ...programForm,
        faculty_id: programForm.faculty_id || null,
        major_id: programForm.major_id || null,
        duration_years: numericValue(programForm.duration_years),
        tuition_fee: numericValue(programForm.tuition_fee),
        credits_required: numericValue(programForm.credits_required),
      };

      if (editingProgramId) {
        await universityApi.updateProgram(university.id, editingProgramId, payload);
        success('Program updated');
      } else {
        await universityApi.createProgram(university.id, payload);
        success('Program added');
      }

      setProgramForm(emptyProgramForm);
      setEditingProgramId(null);
      loadData(university.id);
    } catch (err) {
      error(err.response?.data?.message || `Failed to ${editingProgramId ? 'update' : 'add'} program`);
    } finally {
      setBusy(false);
    }
  };

  const startEditProgram = (program) => {
    setEditingProgramId(program.id);
    setProgramForm({
      name: program.name || '',
      name_km: program.name_km || '',
      faculty_id: program.faculty_id || '',
      major_id: program.major_id || '',
      degree_level: program.degree_level || 'bachelor',
      duration_years: program.duration_years || '',
      language: program.language || 'English',
      tuition_fee: program.tuition_fee || '',
      credits_required: program.credits_required || '',
      description: program.description || '',
      is_available: Boolean(program.is_available),
    });
  };

  const resetProgramForm = () => {
    setProgramForm(emptyProgramForm);
    setEditingProgramId(null);
  };

  const deleteFaculty = async (id) => {
    try {
      await universityApi.deleteFaculty(university.id, id);
      success('Faculty deleted');
      loadData(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete faculty');
    }
  };

  const deleteProgram = async (id) => {
    try {
      await universityApi.deleteProgram(university.id, id);
      success('Program deleted');
      loadData(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete program');
    }
  };

  if (loading) return <LoadingBlock />;
  if (!university) return <NoUniversity />;

  return (
    <PageSection title="Faculties & Programs" subtitle="Organize academic structure so students can browse what you offer.">
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title={editingFacultyId ? 'Edit Faculty' : 'Add Faculty'}
          description={editingFacultyId ? 'Update faculty information and save the changes.' : undefined}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Faculty Name"><TextInput value={facultyForm.name} onChange={(e) => setFacultyForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Faculty of Engineering" /></Field>
            <Field label="Khmer Name"><TextInput value={facultyForm.name_km} onChange={(e) => setFacultyForm((prev) => ({ ...prev, name_km: e.target.value }))} placeholder="Optional" /></Field>
            <Field label="Dean Name"><TextInput value={facultyForm.dean_name} onChange={(e) => setFacultyForm((prev) => ({ ...prev, dean_name: e.target.value }))} placeholder="Dean or head" /></Field>
            <Field label="Established Year"><TextInput type="number" value={facultyForm.established_year} onChange={(e) => setFacultyForm((prev) => ({ ...prev, established_year: e.target.value }))} placeholder="2001" /></Field>
            <div className="md:col-span-2">
              <Field label="Description"><TextArea rows={4} value={facultyForm.description} onChange={(e) => setFacultyForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Short faculty overview" /></Field>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={submitFaculty} disabled={busy || !facultyForm.name.trim()} className={primaryBtn}>{busy ? 'Saving...' : editingFacultyId ? 'Update Faculty' : 'Add Faculty'}</button>
            {editingFacultyId && <button type="button" onClick={resetFacultyForm} className={secondaryBtn}>Cancel</button>}
          </div>
        </Panel>

        <Panel
          title={editingProgramId ? 'Edit Program' : 'Add Program'}
          description={editingProgramId ? 'Update program details and its linked major.' : 'Link each program to a major so public major pages can show the right university offerings.'}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Program Name"><TextInput value={programForm.name} onChange={(e) => setProgramForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Bachelor of Computer Science" /></Field>
            <Field label="Khmer Name"><TextInput value={programForm.name_km} onChange={(e) => setProgramForm((prev) => ({ ...prev, name_km: e.target.value }))} placeholder="Optional" /></Field>
            <Field label="Faculty">
              <SelectInput
                value={programForm.faculty_id}
                onChange={(e) => setProgramForm((prev) => ({ ...prev, faculty_id: e.target.value }))}
                options={[
                  { value: '', label: 'No faculty assigned' },
                  ...faculties.map((faculty) => ({ value: faculty.id, label: faculty.name })),
                ]}
              />
            </Field>
            <Field label="Linked Major">
              <SelectInput
                value={programForm.major_id}
                onChange={(e) => setProgramForm((prev) => ({ ...prev, major_id: e.target.value }))}
                options={[
                  { value: '', label: 'No linked major' },
                  ...majors.map((major) => ({ value: major.id, label: major.name })),
                ]}
              />
            </Field>
            <Field label="Degree Level"><SelectInput value={programForm.degree_level} onChange={(e) => setProgramForm((prev) => ({ ...prev, degree_level: e.target.value }))} options={DEGREE_OPTIONS} /></Field>
            <Field label="Duration (years)"><TextInput type="number" step="0.5" value={programForm.duration_years} onChange={(e) => setProgramForm((prev) => ({ ...prev, duration_years: e.target.value }))} placeholder="4" /></Field>
            <Field label="Language"><TextInput value={programForm.language} onChange={(e) => setProgramForm((prev) => ({ ...prev, language: e.target.value }))} placeholder="English" /></Field>
            <Field label="Tuition Fee (USD)"><TextInput type="number" value={programForm.tuition_fee} onChange={(e) => setProgramForm((prev) => ({ ...prev, tuition_fee: e.target.value }))} placeholder="1200" /></Field>
            <Field label="Credits Required"><TextInput type="number" value={programForm.credits_required} onChange={(e) => setProgramForm((prev) => ({ ...prev, credits_required: e.target.value }))} placeholder="128" /></Field>
            <div className="md:col-span-2">
              <Field label="Description"><TextArea rows={4} value={programForm.description} onChange={(e) => setProgramForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Program overview" /></Field>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <ToggleField label="Currently available" checked={programForm.is_available} onChange={(value) => setProgramForm((prev) => ({ ...prev, is_available: value }))} />
            <button type="button" onClick={submitProgram} disabled={busy || !programForm.name.trim()} className={primaryBtn}>{busy ? 'Saving...' : editingProgramId ? 'Update Program' : 'Add Program'}</button>
            {editingProgramId && <button type="button" onClick={resetProgramForm} className={secondaryBtn}>Cancel</button>}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Current Faculties" description={`${faculties.length} faculty record(s).`}>
          {faculties.length === 0 ? <EmptyState title="No faculties yet" description="Start by adding your main faculties or schools." /> : (
            <div className="space-y-3">
              {faculties.map((faculty) => (
                <div key={faculty.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{faculty.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{faculty.dean_name || 'No dean listed'}{faculty.established_year ? ` • Est. ${faculty.established_year}` : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEditFaculty(faculty)} className={secondaryBtn}>Edit</button>
                      <button type="button" onClick={() => deleteFaculty(faculty.id)} className={dangerBtn}>Delete</button>
                    </div>
                  </div>
                  {faculty.description && <p className="mt-3 text-sm text-slate-600">{faculty.description}</p>}
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Current Programs" description={`${programs.length} program record(s).`}>
          {programs.length === 0 ? <EmptyState title="No programs yet" description="Add your most important academic programs so students can compare options." /> : (
            <div className="space-y-3">
              {programs.map((program) => (
                <div key={program.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-800">{program.name}</p>
                        <StatusPill tone={program.is_available ? 'green' : 'amber'}>{program.is_available ? 'Available' : 'Unavailable'}</StatusPill>
                        {program.Major?.name && <StatusPill tone="blue">{program.Major.name}</StatusPill>}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {program.Faculty?.name || 'No faculty'} • {program.degree_level || 'degree'} • {program.duration_years || 'N/A'} years
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEditProgram(program)} className={secondaryBtn}>Edit</button>
                      <button type="button" onClick={() => deleteProgram(program.id)} className={dangerBtn}>Delete</button>
                    </div>
                  </div>
                  {program.description && <p className="mt-3 text-sm text-slate-600">{program.description}</p>}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </PageSection>
  );
}

export function OwnerNews() {
  const { university, loading } = useOwnerUniversity();
  const { success, error } = useToast();
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [newsForm, setNewsForm] = useState(emptyNewsForm);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState('');
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);
  const [newsImageIndexes, setNewsImageIndexes] = useState({});
  const [eventImageIndexes, setEventImageIndexes] = useState({});

  const loadData = useCallback(async (uniId) => {
    const [newsRes, eventRes] = await Promise.all([
      universityApi.getNews(uniId).catch(() => ({ data: { data: [] } })),
      universityApi.getEvents(uniId).catch(() => ({ data: { data: [] } })),
    ]);
    setNews(newsRes.data.data || []);
    setEvents(eventRes.data.data || []);
  }, []);

  useEffect(() => {
    if (university?.id) loadData(university.id);
  }, [loadData, university?.id]);

  const cycleNewsImage = (item, direction) => {
    const images = Array.isArray(item.image_urls) && item.image_urls.length
      ? item.image_urls
      : item.cover_url
      ? [item.cover_url]
      : [];
    if (images.length <= 1) return;

    setNewsImageIndexes((prev) => {
      const current = prev[item.id] ?? 0;
      const next = (current + direction + images.length) % images.length;
      return { ...prev, [item.id]: next };
    });
  };

  const cycleEventImage = (item, direction) => {
    const images = Array.isArray(item.image_urls) && item.image_urls.length
      ? item.image_urls
      : item.cover_url
      ? [item.cover_url]
      : [];
    if (images.length <= 1) return;

    setEventImageIndexes((prev) => {
      const current = prev[item.id] ?? 0;
      const next = (current + direction + images.length) % images.length;
      return { ...prev, [item.id]: next };
    });
  };

  const resetNewsForm = () => {
    setNewsForm(emptyNewsForm);
    setEditingNewsId(null);
  };

  const resetEventForm = () => {
    setEventForm(emptyEventForm);
    setEditingEventId(null);
  };

  const startEditNews = (item) => {
    setEditingNewsId(item.id);
    setNewsForm({
      ...emptyNewsForm,
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
      image_urls: Array.isArray(item.image_urls) && item.image_urls.length
        ? item.image_urls
        : item.cover_url
        ? [item.cover_url]
        : [],
      cover_url: item.cover_url || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditEvent = (item) => {
    setEditingEventId(item.id);
    setEventForm({
      ...emptyEventForm,
      ...item,
      image_urls: Array.isArray(item.image_urls) && item.image_urls.length
        ? item.image_urls
        : item.cover_url
        ? [item.cover_url]
        : [],
      cover_url: item.cover_url || '',
      event_date: toDateTimeLocalValue(item.event_date),
      end_date: toDateTimeLocalValue(item.end_date),
      registration_deadline: toDateTimeLocalValue(item.registration_deadline),
      max_participants: item.max_participants ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadImages = async (kind, files) => {
    if (!files?.length) return;
    setUploadingTarget(kind);
    const urls = [];
    const failures = [];
    try {
      const preparedFiles = await Promise.all(files.map((file) => optimizeImageFile(file)));
      const validFiles = preparedFiles.filter((file) => file.size <= MAX_UPLOAD_IMAGE_BYTES);
      const oversizedFiles = preparedFiles.filter((file) => file.size > MAX_UPLOAD_IMAGE_BYTES);
      if (oversizedFiles.length > 0) {
        error(`${oversizedFiles.length} image${oversizedFiles.length > 1 ? 's are' : ' is'} over 20MB even after compression and was skipped`);
      }
      if (!validFiles.length) return;

      for (const file of validFiles) {
        const body = new FormData();
        body.append('image', file);
        try {
          const res = await uploadApi.image(body);
          if (res.data.url) urls.push(res.data.url);
        } catch (err) {
          failures.push(err.response?.data?.message || file.name || 'Upload failed');
        }
      }
      if (urls.length > 0 && kind === 'news') {
        setNewsForm((prev) => {
          const image_urls = [...(prev.image_urls || []), ...urls];
          return { ...prev, image_urls, cover_url: image_urls[0] || '' };
        });
      } else if (urls.length > 0) {
        setEventForm((prev) => {
          const image_urls = [...(prev.image_urls || []), ...urls];
          return { ...prev, image_urls, cover_url: image_urls[0] || '' };
        });
      }
      if (urls.length > 0) {
        success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
      }
      if (failures.length > 0) {
        error(`${failures.length} image${failures.length > 1 ? 's were' : ' was'} skipped`);
      }
    } finally {
      setUploadingTarget('');
    }
  };

  const submitNews = async () => {
    setSaving(true);
    try {
      const payload = {
        ...newsForm,
        tags: newsForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };
      if (editingNewsId) {
        await universityApi.updateNews(university.id, editingNewsId, payload);
        success('News post updated');
      } else {
        await universityApi.createNews(university.id, payload);
        success('News post created');
      }
      resetNewsForm();
      loadData(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save news post');
    } finally {
      setSaving(false);
    }
  };

  const submitEvent = async () => {
    setSaving(true);
    try {
      const payload = {
        ...eventForm,
        registration_deadline: eventForm.registration_deadline || null,
        max_participants: numericValue(eventForm.max_participants),
      };
      if (editingEventId) {
        await universityApi.updateEvent(university.id, editingEventId, payload);
        success('Event updated');
      } else {
        await universityApi.createEvent(university.id, payload);
        success('Event created');
      }
      resetEventForm();
      loadData(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const deleteNews = async (id) => {
    try {
      await universityApi.deleteNews(university.id, id);
      success('News deleted');
      if (editingNewsId === id) resetNewsForm();
      loadData(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete news');
    }
  };

  const deleteEvent = async (id) => {
    try {
      await universityApi.deleteEvent(university.id, id);
      success('Event deleted');
      if (editingEventId === id) resetEventForm();
      loadData(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete event');
    }
  };

  if (loading) return <LoadingBlock />;
  if (!university) return <NoUniversity />;

  return (
    <PageSection title="News & Events" subtitle="Keep your university page active with announcements and upcoming activities.">
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title={editingNewsId ? 'Edit News Post' : 'Create News Post'}
          description="Only published posts appear in the current public news feed."
          action={editingNewsId ? <button type="button" onClick={resetNewsForm} className={secondaryBtn}>Cancel Editing</button> : null}
        >
          <div className="space-y-4">
            <Field label="Title"><TextInput value={newsForm.title} onChange={(e) => setNewsForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Admissions open for 2026 intake" /></Field>
            <Field label="Category"><TextInput value={newsForm.category} onChange={(e) => setNewsForm((prev) => ({ ...prev, category: e.target.value }))} placeholder="Admissions, Scholarships, Campus Life" /></Field>
            <Field label="Excerpt"><TextArea rows={3} value={newsForm.excerpt} onChange={(e) => setNewsForm((prev) => ({ ...prev, excerpt: e.target.value }))} placeholder="Short preview shown in listings" /></Field>
            <Field label="Content"><TextArea rows={6} value={newsForm.content} onChange={(e) => setNewsForm((prev) => ({ ...prev, content: e.target.value }))} placeholder="Full article content" /></Field>
            <Field label="Tags"><TextInput value={newsForm.tags} onChange={(e) => setNewsForm((prev) => ({ ...prev, tags: e.target.value }))} placeholder="admissions, scholarship, 2026" /></Field>
            <ImageUploadField
              values={newsForm.image_urls}
              uploading={uploadingTarget === 'news'}
              onUpload={(files, event) => {
                uploadImages('news', files);
                if (event?.target) event.target.value = '';
              }}
              onRemove={(index) => setNewsForm((prev) => {
                const image_urls = (prev.image_urls || []).filter((_, itemIndex) => itemIndex !== index);
                return { ...prev, image_urls, cover_url: image_urls[0] || '' };
              })}
            />
            <div className="flex flex-wrap gap-3">
              <ToggleField label="Publish immediately" checked={newsForm.is_published} onChange={(value) => setNewsForm((prev) => ({ ...prev, is_published: value }))} />
              <ToggleField label="Pin this post" checked={newsForm.is_pinned} onChange={(value) => setNewsForm((prev) => ({ ...prev, is_pinned: value }))} />
            </div>
            <button type="button" onClick={submitNews} disabled={saving || !newsForm.title.trim() || !newsForm.content.trim()} className={primaryBtn}>{saving ? 'Saving...' : editingNewsId ? 'Update News' : 'Publish News'}</button>
          </div>
        </Panel>

        <Panel
          title={editingEventId ? 'Edit Event' : 'Create Event'}
          description="Events help prospective students see that your campus is active."
          action={editingEventId ? <button type="button" onClick={resetEventForm} className={secondaryBtn}>Cancel Editing</button> : null}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title"><TextInput value={eventForm.title} onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Open Day 2026" /></Field>
            <Field label="Event Type"><SelectInput value={eventForm.type} onChange={(e) => setEventForm((prev) => ({ ...prev, type: e.target.value }))} options={EVENT_OPTIONS} /></Field>
            <Field label="Start Date"><TextInput type="datetime-local" value={eventForm.event_date} onChange={(e) => setEventForm((prev) => ({ ...prev, event_date: e.target.value }))} /></Field>
            <Field label="End Date"><TextInput type="datetime-local" value={eventForm.end_date} onChange={(e) => setEventForm((prev) => ({ ...prev, end_date: e.target.value }))} /></Field>
            <Field label="Location"><TextInput value={eventForm.location} onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Main campus auditorium" /></Field>
            <Field label="Max Participants"><TextInput type="number" value={eventForm.max_participants} onChange={(e) => setEventForm((prev) => ({ ...prev, max_participants: e.target.value }))} placeholder="300" /></Field>
            <Field label="Meeting URL"><TextInput value={eventForm.meeting_url} onChange={(e) => setEventForm((prev) => ({ ...prev, meeting_url: e.target.value }))} placeholder="For online events" /></Field>
            <Field label="Registration URL"><TextInput value={eventForm.registration_url} onChange={(e) => setEventForm((prev) => ({ ...prev, registration_url: e.target.value }))} placeholder="External signup form" /></Field>
            <Field label="Registration Deadline"><TextInput type="datetime-local" value={eventForm.registration_deadline} onChange={(e) => setEventForm((prev) => ({ ...prev, registration_deadline: e.target.value }))} /></Field>
            <div className="md:col-span-2">
              <Field label="Description"><TextArea rows={5} value={eventForm.description} onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="What attendees can expect" /></Field>
            </div>
            <div className="md:col-span-2">
              <ImageUploadField
                values={eventForm.image_urls}
                uploading={uploadingTarget === 'event'}
                onUpload={(files, event) => {
                  uploadImages('event', files);
                  if (event?.target) event.target.value = '';
                }}
                onRemove={(index) => setEventForm((prev) => {
                  const image_urls = (prev.image_urls || []).filter((_, itemIndex) => itemIndex !== index);
                  return { ...prev, image_urls, cover_url: image_urls[0] || '' };
                })}
              />
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <ToggleField label="Online event" checked={eventForm.is_online} onChange={(value) => setEventForm((prev) => ({ ...prev, is_online: value }))} />
              <ToggleField label="Publish immediately" checked={eventForm.is_published} onChange={(value) => setEventForm((prev) => ({ ...prev, is_published: value }))} />
              <ToggleField label="Feature this event" checked={eventForm.is_featured} onChange={(value) => setEventForm((prev) => ({ ...prev, is_featured: value }))} />
            </div>
          </div>
          <div className="mt-4"><button type="button" onClick={submitEvent} disabled={saving || !eventForm.title.trim() || !eventForm.event_date} className={primaryBtn}>{saving ? 'Saving...' : editingEventId ? 'Update Event' : 'Create Event'}</button></div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Published News">
          {news.length === 0 ? <EmptyState title="No published news yet" description="Your published news posts will show here after creation." /> : (
            <div className="space-y-3">
              {news.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <MediaImageCarousel
                    item={item}
                    imageIndex={newsImageIndexes[item.id] ?? 0}
                    onPrev={() => cycleNewsImage(item, -1)}
                    onNext={() => cycleNewsImage(item, 1)}
                  />
                  <p className="text-2xl font-bold leading-tight text-slate-800">{item.title}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusPill tone="blue">{item.category || 'General'}</StatusPill>
                    {item.is_pinned && <StatusPill tone="orange">Pinned</StatusPill>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                    {item.published_at && <span>Published: {formatDate(item.published_at)}</span>}
                  </div>
                  {item.excerpt && <p className="mt-3 max-w-4xl text-base leading-8 text-slate-600 line-clamp-3">{item.excerpt}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEditNews(item)} className={secondaryBtn}>Edit</button>
                    <button type="button" onClick={() => deleteNews(item.id)} className={dangerBtn}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Published Events">
          {events.length === 0 ? <EmptyState title="No published events yet" description="Add an event to start building activity on your page." /> : (
            <div className="space-y-3">
              {events.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <MediaImageCarousel
                    item={item}
                    imageIndex={eventImageIndexes[item.id] ?? 0}
                    onPrev={() => cycleEventImage(item, -1)}
                    onNext={() => cycleEventImage(item, 1)}
                  />
                  <p className="text-2xl font-bold leading-tight text-slate-800">{item.title}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusPill tone="blue">{item.type || 'Event'}</StatusPill>
                    {item.is_featured && <StatusPill tone="orange">Featured</StatusPill>}
                    {item.is_online && <StatusPill tone="green">Online</StatusPill>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                    {item.event_date && <span>Date: {formatDate(item.event_date)}</span>}
                    {item.location && <span>Location: {item.location}</span>}
                  </div>
                  {item.description && <p className="mt-3 max-w-4xl text-base leading-8 text-slate-600 line-clamp-3">{item.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEditEvent(item)} className={secondaryBtn}>Edit</button>
                    <button type="button" onClick={() => deleteEvent(item.id)} className={dangerBtn}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </PageSection>
  );
}

export function OwnerOpportunities() {
  const { university, loading } = useOwnerUniversity();
  const { success, error } = useToast();
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [imageIndexes, setImageIndexes] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyOpportunityForm);

  const loadOpportunities = useCallback(async () => {
    setItemsLoading(true);
    try {
      const res = await opportunityApi.getMine();
      setItems(res.data.opportunities || []);
    } catch {
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm(emptyOpportunityForm);
    setEditingId(null);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      ...emptyOpportunityForm,
      ...item,
      image_urls: Array.isArray(item.image_urls) && item.image_urls.length
        ? item.image_urls
        : item.cover_url
        ? [item.cover_url]
        : [],
      field_of_study: Array.isArray(item.field_of_study) ? item.field_of_study.join(', ') : '',
      deadline: item.deadline || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (files) => {
    if (!files?.length) return;
    setUploadingCover(true);
    const urls = [];
    const failures = [];
    try {
      const preparedFiles = await Promise.all(files.map((file) => optimizeImageFile(file)));
      const validFiles = preparedFiles.filter((file) => file.size <= MAX_UPLOAD_IMAGE_BYTES);
      const oversizedFiles = preparedFiles.filter((file) => file.size > MAX_UPLOAD_IMAGE_BYTES);
      if (oversizedFiles.length > 0) {
        error(`${oversizedFiles.length} image${oversizedFiles.length > 1 ? 's are' : ' is'} over 20MB even after compression and was skipped`);
      }
      if (!validFiles.length) return;

      for (const file of validFiles) {
        const body = new FormData();
        body.append('image', file);
        try {
          const res = await uploadApi.image(body);
          if (res.data.url) urls.push(res.data.url);
        } catch (err) {
          failures.push(err.response?.data?.message || file.name || 'Upload failed');
        }
      }
      if (urls.length > 0) {
        setForm((prev) => {
          const image_urls = [...(prev.image_urls || []), ...urls];
          return { ...prev, image_urls, cover_url: image_urls[0] || '' };
        });
        success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
      }
      if (failures.length > 0) {
        error(`${failures.length} image${failures.length > 1 ? 's were' : ' was'} skipped`);
      }
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    if (!university?.id) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        image_urls: Array.isArray(form.image_urls) ? form.image_urls : [],
        cover_url: Array.isArray(form.image_urls) && form.image_urls.length ? form.image_urls[0] : form.cover_url || null,
        university_id: university.id,
        field_of_study: form.field_of_study
          ? form.field_of_study.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
        deadline: form.deadline || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };

      if (editingId) {
        await opportunityApi.update(editingId, payload);
        success('Opportunity updated');
      } else {
        await opportunityApi.create(payload);
        success('Opportunity submitted for review');
      }

      resetForm();
      loadOpportunities();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save opportunity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await opportunityApi.remove(id);
      success('Opportunity deleted');
      if (editingId === id) resetForm();
      loadOpportunities();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete opportunity');
    }
  };

  const cycleItemImage = (item, direction) => {
    const images = Array.isArray(item.image_urls) && item.image_urls.length
      ? item.image_urls
      : item.cover_url
      ? [item.cover_url]
      : [];
    if (images.length <= 1) return;

    setImageIndexes((prev) => {
      const current = prev[item.id] ?? 0;
      const next = (current + direction + images.length) % images.length;
      return { ...prev, [item.id]: next };
    });
  };

  if (loading) return <LoadingBlock />;
  if (!university) return <NoUniversity />;

  return (
    <PageSection
      title="Opportunities"
      subtitle="Create scholarships, internships, and other opportunities connected to your university."
      action={
        editingId ? (
          <button type="button" onClick={resetForm} className={secondaryBtn}>Cancel Editing</button>
        ) : null
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.05fr_1.2fr]">
        <Panel
          title={editingId ? 'Edit Opportunity' : 'Create Opportunity'}
          description="Owner-created opportunities are submitted for review before they appear publicly."
          action={<button type="button" onClick={handleSave} disabled={saving} className={primaryBtn}>{saving ? 'Saving...' : editingId ? 'Update Opportunity' : 'Create Opportunity'}</button>}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Title"><TextInput value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Scholarship or program title" /></Field>
            </div>
            <Field label="Type"><SelectInput value={form.type} onChange={(e) => setField('type', e.target.value)} options={OPPORTUNITY_TYPE_OPTIONS} /></Field>
            <Field label="Country"><TextInput value={form.country} onChange={(e) => setField('country', e.target.value)} placeholder="Cambodia" /></Field>
            <Field label="Location"><TextInput value={form.location} onChange={(e) => setField('location', e.target.value)} placeholder="Phnom Penh or Online" /></Field>
            <Field label="Application Email"><TextInput value={form.contact_email} onChange={(e) => setField('contact_email', e.target.value)} placeholder="apply@example.edu.kh" /></Field>
            <Field label="Deadline"><TextInput type="date" value={form.deadline} onChange={(e) => setField('deadline', e.target.value)} /></Field>
            <Field label="Start Date"><TextInput type="date" value={form.start_date} onChange={(e) => setField('start_date', e.target.value)} /></Field>
            <Field label="End Date"><TextInput type="date" value={form.end_date} onChange={(e) => setField('end_date', e.target.value)} /></Field>
            <Field label="Funding Amount"><TextInput value={form.funding_amount} onChange={(e) => setField('funding_amount', e.target.value)} placeholder="Up to 5,000" /></Field>
            <Field label="Funding Currency"><TextInput value={form.funding_currency} onChange={(e) => setField('funding_currency', e.target.value)} placeholder="USD" /></Field>
            <div className="md:col-span-2">
              <Field label="Field of Study" hint="Separate multiple fields with commas.">
                <TextInput value={form.field_of_study} onChange={(e) => setField('field_of_study', e.target.value)} placeholder="Computer Science, Business, Engineering" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Eligibility"><TextArea rows={4} value={form.eligibility} onChange={(e) => setField('eligibility', e.target.value)} placeholder="Who can apply and what they need to qualify" /></Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Description"><TextArea rows={6} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Describe the opportunity, benefits, and how students should approach it" /></Field>
            </div>
            <div className="md:col-span-2">
              <ImageUploadField
                values={form.image_urls}
                uploading={uploadingCover}
                onUpload={(files, event) => {
                  handleImageUpload(files);
                  if (event?.target) event.target.value = '';
                }}
                onRemove={(index) => setForm((prev) => {
                  const image_urls = (prev.image_urls || []).filter((_, itemIndex) => itemIndex !== index);
                  return { ...prev, image_urls, cover_url: image_urls[0] || '' };
                })}
              />
            </div>
            <Field label="Application URL"><TextInput value={form.application_url} onChange={(e) => setField('application_url', e.target.value)} placeholder="https://..." /></Field>
            <Field label="Source URL"><TextInput value={form.source_url} onChange={(e) => setField('source_url', e.target.value)} placeholder="Optional external link" /></Field>
            <div className="md:col-span-2 flex flex-wrap gap-3">
              <ToggleField label="Fully funded" checked={!!form.is_fully_funded} onChange={(value) => setField('is_fully_funded', value)} />
              <ToggleField label="Online opportunity" checked={!!form.is_online} onChange={(value) => setField('is_online', value)} />
            </div>
          </div>
        </Panel>

        <Panel title="Your Opportunities" description={`${items.length} opportunity listing(s) created by your account.`}>
          {itemsLoading ? (
            <LoadingBlock />
          ) : items.length === 0 ? (
            <EmptyState title="No opportunities yet" description="Create your first scholarship or internship opportunity from the form on the left." />
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <MediaImageCarousel
                    item={item}
                    imageIndex={imageIndexes[item.id] ?? 0}
                    onPrev={() => cycleItemImage(item, -1)}
                    onNext={() => cycleItemImage(item, 1)}
                  />
                  <p className="text-2xl font-bold leading-tight text-slate-800">{item.title}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusPill tone={item.is_published ? 'green' : 'amber'}>{item.is_published ? 'Published' : 'Pending review'}</StatusPill>
                    <StatusPill tone="blue">{item.type}</StatusPill>
                    {item.is_fully_funded && <StatusPill tone="green">Fully funded</StatusPill>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                    {item.deadline && <span>Deadline: {formatDate(item.deadline)}</span>}
                    {item.country && <span>Country: {item.country}</span>}
                    <span>Applicants: {item.applicant_count || 0}</span>
                    <span>Views: {item.views_count || 0}</span>
                  </div>
                  {item.description && <p className="mt-3 max-w-4xl text-base leading-8 text-slate-600 line-clamp-3">{item.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEdit(item)} className={secondaryBtn}>Edit</button>
                    <button type="button" onClick={() => handleDelete(item.id)} className={dangerBtn}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </PageSection>
  );
}

export function OwnerReviews() {
  const { university, loading } = useOwnerUniversity();
  const { success, error } = useToast();
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewTab, setReviewTab] = useState('all');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [savingApproveId, setSavingApproveId] = useState(null);
  const [savingReplyId, setSavingReplyId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const reviewTabOptions = [
    { key: 'all', label: `All (${reviews.length})` },
    { key: 'visible', label: `Visible (${reviews.filter((review) => review.is_approved).length})` },
    { key: 'hidden', label: `Hidden (${reviews.filter((review) => !review.is_approved).length})` },
  ];

  const filteredReviews = reviews.filter((review) => {
    if (reviewTab === 'visible') return review.is_approved;
    if (reviewTab === 'hidden') return !review.is_approved;
    return true;
  });

  const loadReviews = useCallback(async (uniId) => {
    setReviewsLoading(true);
    try {
      const res = await universityApi.getOwnerReviews(uniId);
      const nextReviews = res.data.reviews || [];
      setReviews(nextReviews);
      setReplyDrafts(Object.fromEntries(nextReviews.map((review) => [review.id, review.owner_reply || ''])));
    } catch (err) {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (university?.id) loadReviews(university.id);
  }, [loadReviews, university?.id]);

  const saveReply = async (reviewId) => {
    if (!university?.id) return;
    setSavingReplyId(reviewId);
    try {
      await universityApi.replyToReview(university.id, reviewId, { owner_reply: replyDrafts[reviewId] || '' });
      success(replyDrafts[reviewId]?.trim() ? 'Reply saved' : 'Reply removed');
      loadReviews(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save reply');
    } finally {
      setSavingReplyId(null);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!university?.id) return;
    setDeletingReviewId(reviewId);
    try {
      await universityApi.deleteReview(university.id, reviewId);
      success('Review deleted');
      loadReviews(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const approveReview = async (reviewId) => {
    if (!university?.id) return;
    setSavingApproveId(reviewId);
    try {
      await universityApi.approveReview(university.id, reviewId);
      success('Review visibility updated');
      loadReviews(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update review approval');
    } finally {
      setSavingApproveId(null);
    }
  };

  if (loading) return <LoadingBlock />;
  if (!university) return <NoUniversity />;

  return (
    <PageSection
      title="Reviews"
      subtitle="Manage student feedback for your university, control visibility, reply publicly, or remove reviews when needed."
    >
      <Panel
        title="University Reviews"
        description={`${reviews.length} review(s) submitted for ${university.name}. You can show, hide, reply to, or delete them directly from here.`}
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {reviewTabOptions.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setReviewTab(item.key)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                reviewTab === item.key
                  ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {reviewsLoading ? (
          <LoadingBlock />
        ) : filteredReviews.length === 0 ? (
          <EmptyState title="No reviews yet" description="Student reviews will appear here once they are submitted for your university." />
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-800">{review.title || 'Untitled review'}</p>
                      <StatusPill tone={review.is_approved ? 'green' : 'slate'}>{review.is_approved ? 'Visible' : 'Hidden'}</StatusPill>
                      <StatusPill tone="blue">{review.rating}/5 stars</StatusPill>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>By {review.Author?.name || 'Unknown student'}</span>
                      {review.Author?.email && <span>{review.Author.email}</span>}
                      <span>{formatDate(review.createdAt || review.created_at)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => approveReview(review.id)}
                        disabled={savingApproveId === review.id}
                        className={review.is_approved ? secondaryBtn : primaryBtn}
                      >
                        {savingApproveId === review.id ? 'Saving...' : review.is_approved ? 'Hide Review' : 'Show Review'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteReview(review.id)}
                        disabled={deletingReviewId === review.id}
                        className={dangerBtn}
                      >
                        {deletingReviewId === review.id ? 'Deleting...' : 'Delete Review'}
                      </button>
                    </div>
                    {review.content && <p className="mt-3 text-sm leading-6 text-slate-600">{review.content}</p>}
                    {(review.pros || review.cons) && (
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-700">Pros</p>
                          <p>{review.pros || 'No pros provided.'}</p>
                        </div>
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-700">Cons</p>
                          <p>{review.cons || 'No cons provided.'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Official Reply</p>
                        <p className="text-xs text-slate-500">Visible as your university response to this review.</p>
                      </div>
                      {review.owner_replied_at && <span className="text-xs text-slate-400">Updated {formatDate(review.owner_replied_at)}</span>}
                    </div>
                    <TextArea
                      rows={4}
                      value={replyDrafts[review.id] || ''}
                      onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))}
                      placeholder="Thank the student, clarify context, or explain how your team is addressing the feedback."
                    />
                    <div className="mt-3 flex justify-end">
                      <button type="button" onClick={() => saveReply(review.id)} disabled={savingReplyId === review.id} className={primaryBtn}>
                        {savingReplyId === review.id ? 'Saving...' : 'Save Reply'}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-slate-800">Visibility</p>
                      <p className="text-xs text-slate-500">Hidden reviews stay in your dashboard but no longer appear on the public university page.</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                      Current status: <span className="font-semibold text-slate-800">{review.is_approved ? 'Visible on public page' : 'Hidden from public page'}</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      Use “Hide Review” to remove a review from the public page without deleting it permanently.
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </PageSection>
  );
}

export function OwnerFAQ() {
  const { university, loading } = useOwnerUniversity();
  const { success, error } = useToast();
  const [faqs, setFaqs] = useState([]);
  const [contact, setContact] = useState(emptyContactForm);
  const [faqForm, setFaqForm] = useState(emptyFaqForm);
  const [savingFaq, setSavingFaq] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  const loadData = useCallback(async (uniId) => {
    const [faqRes, contactRes] = await Promise.all([
      universityApi.getFAQs(uniId).catch(() => ({ data: { faqs: [] } })),
      universityApi.getContact(uniId).catch(() => ({ data: { contact: null } })),
    ]);
    setFaqs(faqRes.data.faqs || []);
    setContact({ ...emptyContactForm, ...(contactRes.data.contact || {}) });
  }, []);

  useEffect(() => {
    if (university?.id) loadData(university.id);
  }, [loadData, university?.id]);

  const submitFaq = async () => {
    setSavingFaq(true);
    try {
      await universityApi.createFAQ(university.id, {
        ...faqForm,
        sort_order: numericValue(faqForm.sort_order) || 0,
      });
      success('FAQ added');
      setFaqForm(emptyFaqForm);
      loadData(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create FAQ');
    } finally {
      setSavingFaq(false);
    }
  };

  const saveContact = async () => {
    setSavingContact(true);
    try {
      await universityApi.upsertContact(university.id, contact);
      success('Contact details updated');
      loadData(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update contact');
    } finally {
      setSavingContact(false);
    }
  };

  const deleteFaq = async (id) => {
    try {
      await universityApi.deleteFAQ(university.id, id);
      success('FAQ deleted');
      loadData(university.id);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete FAQ');
    }
  };

  if (loading) return <LoadingBlock />;
  if (!university) return <NoUniversity />;

  return (
    <PageSection title="FAQs & Contact" subtitle="Answer common questions and make it easy for students to reach out.">
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Create FAQ">
          <div className="space-y-4">
            <Field label="Question"><TextInput value={faqForm.question} onChange={(e) => setFaqForm((prev) => ({ ...prev, question: e.target.value }))} placeholder="Do you offer scholarships?" /></Field>
            <Field label="Answer"><TextArea rows={5} value={faqForm.answer} onChange={(e) => setFaqForm((prev) => ({ ...prev, answer: e.target.value }))} placeholder="Write a clear, helpful answer" /></Field>
            <Field label="Category"><TextInput value={faqForm.category} onChange={(e) => setFaqForm((prev) => ({ ...prev, category: e.target.value }))} placeholder="Admissions, Tuition, Housing" /></Field>
            <div className="flex flex-wrap gap-3">
              <ToggleField label="Publish immediately" checked={faqForm.is_published} onChange={(value) => setFaqForm((prev) => ({ ...prev, is_published: value }))} />
              <button type="button" onClick={submitFaq} disabled={savingFaq || !faqForm.question.trim() || !faqForm.answer.trim()} className={primaryBtn}>{savingFaq ? 'Saving...' : 'Add FAQ'}</button>
            </div>
          </div>
        </Panel>

        <Panel title="Contact Details" action={<button type="button" onClick={saveContact} disabled={savingContact} className={primaryBtn}>{savingContact ? 'Saving...' : 'Save Contact'}</button>}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Admission Email"><TextInput value={contact.admission_email} onChange={(e) => setContact((prev) => ({ ...prev, admission_email: e.target.value }))} placeholder="admissions@example.edu.kh" /></Field>
            <Field label="Admission Phone"><TextInput value={contact.admission_phone} onChange={(e) => setContact((prev) => ({ ...prev, admission_phone: e.target.value }))} placeholder="+855 ..." /></Field>
            <Field label="General Email"><TextInput value={contact.general_email} onChange={(e) => setContact((prev) => ({ ...prev, general_email: e.target.value }))} placeholder="info@example.edu.kh" /></Field>
            <Field label="General Phone"><TextInput value={contact.general_phone} onChange={(e) => setContact((prev) => ({ ...prev, general_phone: e.target.value }))} placeholder="+855 ..." /></Field>
            <Field label="WhatsApp"><TextInput value={contact.whatsapp} onChange={(e) => setContact((prev) => ({ ...prev, whatsapp: e.target.value }))} placeholder="WhatsApp number" /></Field>
            <Field label="Telegram"><TextInput value={contact.telegram} onChange={(e) => setContact((prev) => ({ ...prev, telegram: e.target.value }))} placeholder="Telegram username or URL" /></Field>
            <Field label="Facebook Page"><TextInput value={contact.facebook_page} onChange={(e) => setContact((prev) => ({ ...prev, facebook_page: e.target.value }))} placeholder="https://facebook.com/..." /></Field>
            <Field label="Instagram"><TextInput value={contact.instagram} onChange={(e) => setContact((prev) => ({ ...prev, instagram: e.target.value }))} placeholder="https://instagram.com/..." /></Field>
            <Field label="YouTube"><TextInput value={contact.youtube} onChange={(e) => setContact((prev) => ({ ...prev, youtube: e.target.value }))} placeholder="https://youtube.com/..." /></Field>
            <Field label="LinkedIn"><TextInput value={contact.linkedin} onChange={(e) => setContact((prev) => ({ ...prev, linkedin: e.target.value }))} placeholder="https://linkedin.com/..." /></Field>
            <Field label="TikTok"><TextInput value={contact.tiktok} onChange={(e) => setContact((prev) => ({ ...prev, tiktok: e.target.value }))} placeholder="https://tiktok.com/..." /></Field>
            <Field label="Office Hours"><TextInput value={contact.office_hours} onChange={(e) => setContact((prev) => ({ ...prev, office_hours: e.target.value }))} placeholder="Mon-Fri, 8:00 AM - 5:00 PM" /></Field>
            <div className="md:col-span-2">
              <Field label="Map Embed URL"><TextArea rows={3} value={contact.map_embed_url} onChange={(e) => setContact((prev) => ({ ...prev, map_embed_url: e.target.value }))} placeholder="Paste a Google Maps embed URL" /></Field>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Published FAQs" description={`${faqs.length} FAQ item(s) currently public.`}>
        {faqs.length === 0 ? <EmptyState title="No FAQs yet" description="Use this section to answer the top questions students ask before applying." /> : (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-800">Q{index + 1}. {faq.question}</p>
                      {faq.category && <StatusPill tone="blue">{faq.category}</StatusPill>}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
                  </div>
                  <button type="button" onClick={() => deleteFaq(faq.id)} className={dangerBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </PageSection>
  );
}
