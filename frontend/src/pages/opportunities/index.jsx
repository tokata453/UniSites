import { useState, useEffect } from 'react';
import { BadgeCheck, BookOpen, BriefcaseBusiness, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, ExternalLink, Globe2, GraduationCap, Hammer, Landmark, Mail, MapPinned, Microscope, Monitor, Phone, Pin, Search, Star, Trophy, TriangleAlert, Users, HandHeart } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { opportunityApi, inboxApi } from '@/api';
import { Spinner, Pagination, Empty } from '@/components/common';
import { avatarUrl, coverUrl, formatDate, logoUrl, truncate } from '@/utils';
import { useAuth, useToast } from '@/hooks';

const TYPES = ['', 'scholarship', 'internship', 'exchange', 'competition', 'workshop', 'research', 'parttime', 'volunteer'];

const TYPE_STYLES = {
  scholarship: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', icon: Trophy },
  internship:  { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', icon: BriefcaseBusiness },
  exchange:    { bg: '#faf5ff', border: '#e9d5ff', text: '#7c3aed', icon: Globe2 },
  competition: { bg: '#fefce8', border: '#fef08a', text: '#a16207', icon: Landmark },
  workshop:    { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', icon: Hammer },
  research:    { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', icon: Microscope },
  parttime:    { bg: '#f8fafc', border: '#e2e8f0', text: '#475569', icon: Clock3 },
  volunteer:   { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: HandHeart },
};

const TypeBadge = ({ type }) => {
  const s = TYPE_STYLES[type] || { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', icon: Pin };
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      <Icon size={12} /> {type}
    </span>
  );
};

const SearchIcon = () => <Search size={15} />;

const isExpired   = (d) => d && new Date(d) < new Date();
const daysLeft    = (d) => Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));

const OpportunityMediaCarousel = ({ images = [], title, imageIndex = 0, onPrev, onNext }) => {
  if (!images.length) return null;
  const currentIndex = Math.max(0, Math.min(imageIndex, images.length - 1));
  const currentImage = images[currentIndex];

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden bg-slate-100">
        <img
          src={coverUrl(currentImage) || currentImage}
          alt={title}
          className="h-full max-h-[440px] w-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onPrev?.();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onNext?.();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-sm">
              {images.map((_, index) => (
                <span
                  key={`${title}-image-dot-${index}`}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-white' : 'bg-white/45'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── OpportunitiesPage ─────────────────────────────────────────────────────────
export function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [filters, setFilters] = useState({ type: '', search: '' });
  const [showAll, setShowAll] = useState(false);

  const limit      = showAll ? 1000 : 12;
  const totalPages = Math.ceil(total / limit);
  const safeTotalPages = Math.max(totalPages, 1);
  const setSafePage = (nextPage) => setPage(Math.max(1, Math.min(nextPage, safeTotalPages)));
  const sf = (k) => (v) => { setFilters((p) => ({ ...p, [k]: v })); setPage(1); };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = { page: showAll ? 1 : page, limit, ...filters };
        if (!params.type)   delete params.type;
        if (!params.search) delete params.search;
        const res = await opportunityApi.list(params);
        setOpportunities(res.data.data || []);
        setTotal(res.data.meta?.total || res.data.total || 0);
      } catch {
        setOpportunities([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, page, showAll]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Syne',sans-serif" }}>
            Opportunities
          </h1>
          <p className="text-slate-500 text-sm">
            {loading ? 'Loading...' : `${total} opportunities available`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAll(false);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={!showAll
                ? { background: '#1B3A6B', color: '#fff', border: '1px solid #1B3A6B' }
                : { background: '#fff', color: '#64748b', border: '1px solid #e2e8f0' }}
            >
              Paginated view
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAll(true);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={showAll
                ? { background: '#1B3A6B', color: '#fff', border: '1px solid #1B3A6B' }
                : { background: '#fff', color: '#64748b', border: '1px solid #e2e8f0' }}
            >
              Show all
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-[#1B3A6B] focus-within:ring-2 focus-within:ring-[#1B3A6B]/10 transition-all flex-1 min-w-[200px] max-w-sm">
              <span className="text-slate-400 shrink-0"><SearchIcon /></span>
              <input type="text" value={filters.search} onChange={(e) => sf('search')(e.target.value)}
                placeholder="Search opportunities..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
            </div>

            {/* Type filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto md:flex-wrap">
              {TYPES.map((t) => {
                const s = TYPE_STYLES[t] || {};
                const active = filters.type === t;
                return (
                  <button key={t} onClick={() => sf('type')(t)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
                    style={active
                      ? { background: t ? s.text : '#1B3A6B', color: '#fff', border: `1px solid ${t ? s.text : '#1B3A6B'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }
                      : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                    {t ? t : 'All'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : opportunities.length === 0 ? (
          <Empty title="No opportunities found" description="Try adjusting your filters." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map((opp) => {
                const expired = isExpired(opp.deadline);
                const days    = opp.deadline && !expired ? daysLeft(opp.deadline) : null;
                const ts      = TYPE_STYLES[opp.type] || {};
                return (
                  <Link key={opp.id} to={`/opportunities/${opp.slug}`} className="group block">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full overflow-hidden flex flex-col">

                      {/* Cover */}
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        {opp.cover_url ? (
                          <img
                            src={coverUrl(opp.cover_url) || opp.cover_url}
                            alt={opp.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                            <BriefcaseBusiness size={34} />
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>

                      <div className="p-5 flex flex-1 flex-col">

                      {/* Top row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <TypeBadge type={opp.type} />
                          {opp.is_featured && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: '#fefce8', color: '#a16207', border: '1px solid #fef08a' }}>
                              <span className="inline-flex items-center gap-1"><Star size={12} className="fill-current" /> Featured</span>
                            </span>
                          )}
                          {opp.is_fully_funded && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                              <span className="inline-flex items-center gap-1"><CircleDollarSign size={12} /> Full Funding</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-800 mb-2 flex-1 leading-snug group-hover:text-[#1B3A6B] transition-colors line-clamp-2">
                        {opp.title}
                      </h3>

                      {/* Source */}
                      {opp.University && (
                        <div className="mb-3 flex items-center gap-2">
                          <div className="h-8 w-8 overflow-hidden rounded-full border border-slate-200 bg-white flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0">
                            {opp.University.logo_url ? (
                              <img
                                src={logoUrl(opp.University.logo_url) || opp.University.logo_url}
                                alt={opp.University.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              opp.University.name?.[0]?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">{opp.University.name}</p>
                            <p className="text-[11px] text-slate-400">Official university</p>
                          </div>
                        </div>
                      )}
                      {!opp.University && opp.Organization && (
                        <div className="mb-3 flex items-center gap-2">
                          <div className="h-7 w-7 overflow-hidden rounded-full bg-teal-700 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                            {opp.Organization.logo_url ? (
                              <img src={logoUrl(opp.Organization.logo_url) || opp.Organization.logo_url} alt={opp.Organization.name} className="h-full w-full object-cover" />
                            ) : (
                              opp.Organization.name?.[0]?.toUpperCase() || 'O'
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">{opp.Organization.name}</p>
                            <p className="text-[11px] text-slate-400">Official organization</p>
                          </div>
                        </div>
                      )}
                      {!opp.University && !opp.Organization && opp.PostedBy && (
                        <div className="mb-3 flex items-center gap-2">
                          <div className="h-7 w-7 overflow-hidden rounded-full bg-slate-700 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                            {opp.PostedBy.avatar_url ? (
                              <img src={avatarUrl(opp.PostedBy.avatar_url) || opp.PostedBy.avatar_url} alt={opp.PostedBy.name} className="h-full w-full object-cover" />
                            ) : (
                              opp.PostedBy.name?.[0]?.toUpperCase() || 'P'
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">{opp.PostedBy.name}</p>
                            <p className="text-[11px] text-slate-400">Posted by organization</p>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">
                        {truncate(opp.description, 90)}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 mt-auto">
                        {opp.deadline ? (
                          expired ? (
                            <span className="text-slate-400 line-through">Expired</span>
                          ) : days <= 7 ? (
                            <span className="inline-flex items-center gap-1 font-bold" style={{ color: '#dc2626' }}><TriangleAlert size={12} /> {days}d left</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500"><Clock3 size={12} /> {formatDate(opp.deadline)}</span>
                          )
                        ) : (
                          <span className="text-slate-400">No deadline</span>
                        )}
                        <span className="font-semibold group-hover:underline" style={{ color: '#1B3A6B' }}>
                          <span className="inline-flex items-center gap-1">View <ChevronRight size={13} /></span>
                        </span>
                      </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {!showAll && (
              <div className="mt-8">
                <Pagination page={page} totalPages={totalPages}
                  onNext={() => setSafePage(page + 1)}
                  onPrev={() => setSafePage(page - 1)}
                  onPage={setSafePage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── OpportunityDetail ─────────────────────────────────────────────────────────
export function OpportunityDetail() {
  const { slug }  = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { error, info } = useToast();
  const [opp,     setOpp]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    opportunityApi.getBySlug(slug)
      .then((res) => setOpp(res.data.opportunity))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    setImageIndex(0);
  }, [slug]);

  const mediaImages =
    Array.isArray(opp?.image_urls) && opp.image_urls.length
      ? opp.image_urls
      : opp?.cover_url
      ? [opp.cover_url]
      : [];

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!opp)    return <div className="text-center py-32 text-slate-400">Opportunity not found.</div>;

  const ts      = TYPE_STYLES[opp.type] || {};
  const expired = isExpired(opp.deadline);
  const days    = opp.deadline && !expired ? daysLeft(opp.deadline) : null;
  const messageLabel = opp.Organization
    ? 'Message Organization'
    : opp.University
    ? 'Message University'
    : 'Message Poster';
  const messageHint = opp.Organization
    ? 'Starts a direct conversation with the organization that posted this opportunity.'
    : opp.University
    ? 'Sends your message to the university contact behind this opportunity.'
    : 'Starts a direct conversation with the opportunity contact.';
  const inboxPath = user?.Role?.name === 'owner'
    ? '/owner/inbox'
    : user?.Role?.name === 'organization'
    ? '/organization/inbox'
    : user?.Role?.name === 'admin'
    ? '/admin/inbox'
    : '/dashboard/inbox';

  const handleMessage = async () => {
    const recipientId = opp.Organization?.owner_id || opp.PostedBy?.id || opp.University?.Owner?.id || opp.University?.owner_id;
    if (!isAuthenticated) {
      info('Please log in to send a message');
      navigate('/login');
      return;
    }
    if (!recipientId) {
      error('No direct contact is available for this opportunity');
      return;
    }
    try {
      const payload = opp.Organization
        ? {
            recipient_id: recipientId,
            context: 'organization',
            organization_id: opp.Organization.id,
          }
        : opp.University
        ? {
            recipient_id: recipientId,
            context: 'university',
            university_id: opp.University.id,
          }
        : { recipient_id: recipientId };
      const res = await inboxApi.createConversation(payload);
      const conversationId = res.data.conversation?.id;
      const contextQuery = opp.Organization
        ? 'context=organization'
        : opp.University
        ? 'context=university'
        : 'context=personal';
      navigate(`${inboxPath}?${contextQuery}${conversationId ? `&conversation=${conversationId}` : ''}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to open conversation');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <Link to="/opportunities"
          className="text-sm font-medium text-slate-500 hover:text-[#1B3A6B] mb-6 inline-flex items-center gap-1 transition-colors">
          <ChevronLeft size={15} /> Back to Opportunities
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <OpportunityMediaCarousel
                images={mediaImages}
                title={opp.title}
                imageIndex={imageIndex}
                onPrev={() => setImageIndex((current) => (current - 1 + mediaImages.length) % mediaImages.length)}
                onNext={() => setImageIndex((current) => (current + 1) % mediaImages.length)}
              />

              <div className="flex gap-2 mb-4 flex-wrap">
                <TypeBadge type={opp.type} />
                {opp.is_featured    && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background:'#fefce8', color:'#a16207', border:'1px solid #fef08a' }}><Star size={12} className="fill-current" /> Featured</span>}
                {opp.is_fully_funded && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background:'#f0fdf4', color:'#15803d', border:'1px solid #bbf7d0' }}><CircleDollarSign size={12} /> Full Funding</span>}
                {opp.is_verified    && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe' }}><BadgeCheck size={12} /> Verified</span>}
              </div>

              <h1 className="text-xl font-bold text-slate-800 mb-3 leading-snug">{opp.title}</h1>

              {opp.University && (
                <Link to={`/universities/${opp.University.slug}`}
                  className="text-sm font-semibold hover:underline mb-4 inline-flex items-center gap-1 transition-colors"
                  style={{ color: '#1B3A6B' }}>
                  <GraduationCap size={15} /> {opp.University.name}
                </Link>
              )}
              {!opp.University && opp.Organization && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3">
                  <div className="h-11 w-11 overflow-hidden rounded-full bg-teal-700 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {opp.Organization.logo_url ? (
                      <img src={logoUrl(opp.Organization.logo_url) || opp.Organization.logo_url} alt={opp.Organization.name} className="h-full w-full object-cover" />
                    ) : (
                      opp.Organization.name?.[0]?.toUpperCase() || 'O'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{opp.Organization.name}</p>
                    <p className="text-xs text-teal-700">Official organization</p>
                  </div>
                </div>
              )}
              {!opp.University && !opp.Organization && opp.PostedBy && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="h-11 w-11 overflow-hidden rounded-full bg-slate-700 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {opp.PostedBy.avatar_url ? (
                      <img src={avatarUrl(opp.PostedBy.avatar_url) || opp.PostedBy.avatar_url} alt={opp.PostedBy.name} className="h-full w-full object-cover" />
                    ) : (
                      opp.PostedBy.name?.[0]?.toUpperCase() || 'P'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{opp.PostedBy.name}</p>
                    <p className="text-xs text-slate-500">Posted by organization</p>
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-600 leading-relaxed mt-3">{opp.description}</p>

              {/* Funding info */}
              {(opp.funding_amount || opp.country) && (
                <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-slate-100">
                  {opp.funding_amount && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-200">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700"><CircleDollarSign size={12} /> Funding</span>
                      <span className="text-xs text-green-600">{opp.funding_amount} {opp.funding_currency}</span>
                    </div>
                  )}
                  {opp.country && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700"><Globe2 size={12} /> Country</span>
                      <span className="text-xs text-blue-600">{opp.country}</span>
                    </div>
                  )}
                  {opp.is_online && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 border border-purple-200">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700"><Monitor size={12} /> Online</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Eligibility */}
            {opp.eligibility && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <BadgeCheck size={15} /> <span style={{ color: '#1B3A6B' }}>Eligibility Requirements</span>
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{opp.eligibility}</p>
              </div>
            )}

            {/* Field of study */}
            {opp.field_of_study?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><BookOpen size={15} /> Fields of Study</h3>
                <div className="flex flex-wrap gap-2">
                  {opp.field_of_study.map((f) => (
                    <span key={f} className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {opp.Tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {opp.Tags.map((tag) => (
                  <span key={tag.id || tag.tag} className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-500 shadow-sm">
                    #{tag.tag || tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">

            {/* Deadline + Apply CTA */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              {opp.deadline && (
                <div className={`text-center py-3 mb-4 rounded-xl border ${
                  expired
                    ? 'bg-slate-50 border-slate-200'
                    : days <= 7
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <p className={`text-xs font-semibold mb-0.5 ${expired ? 'text-slate-400' : days <= 7 ? 'text-red-600' : 'text-amber-700'}`}>
                    {expired ? 'Expired' : 'Application Deadline'}
                  </p>
                  <p className={`font-bold ${expired ? 'text-slate-400 line-through' : days <= 7 ? 'text-red-700' : 'text-amber-800'}`}>
                    {formatDate(opp.deadline)}
                  </p>
                  {!expired && days && (
                    <p className={`text-xs mt-0.5 font-medium ${days <= 7 ? 'text-red-500' : 'text-amber-600'}`}>
                      {days} days remaining
                    </p>
                  )}
                </div>
              )}

              {opp.application_url ? (
                <a href={opp.application_url} target="_blank" rel="noreferrer" className="block">
                  <button className="w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all shadow-sm"
                    style={{ background: expired ? '#94a3b8' : '#F47B20' }}
                    disabled={expired}>
                    {expired ? 'Applications Closed' : <span className="inline-flex items-center gap-1">Apply Now <ChevronRight size={14} /></span>}
                  </button>
                </a>
              ) : (
                <button className="w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all shadow-sm"
                  style={{ background: expired ? '#94a3b8' : '#F47B20' }}>
                  {expired ? 'Applications Closed' : <span className="inline-flex items-center gap-1">Apply Now <ChevronRight size={14} /></span>}
                </button>
              )}

              <button
                type="button"
                onClick={handleMessage}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                {messageLabel}
              </button>
              <p className="mt-2 text-center text-xs leading-5 text-slate-400">
                {messageHint}
              </p>

              {opp.source_url && (
                <a href={opp.source_url} target="_blank" rel="noreferrer"
                  className="block text-center text-xs font-medium mt-3 hover:underline transition-colors"
                  style={{ color: '#1B3A6B' }}>
                  <span className="inline-flex items-center gap-1">View original source <ExternalLink size={13} /></span>
                </a>
              )}
            </div>

            {/* Quick info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Details</h3>
              <div className="space-y-3">
                {[
                  ['Type',        opp.type],
                  ['Source',      opp.source],
                  ['Location',    opp.location],
                  ['Country',     opp.country],
                  ['Eligibility', opp.eligibility?.slice(0, 60) + (opp.eligibility?.length > 60 ? '…' : '')],
                  ['Start Date',  opp.start_date ? formatDate(opp.start_date) : null],
                  ['End Date',    opp.end_date   ? formatDate(opp.end_date)   : null],
                  ['Applicants',  opp.applicant_count ? `${opp.applicant_count} applied` : null],
                  ['Views',       opp.views_count ? `${opp.views_count} views` : null],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                    <span className="text-xs text-slate-400 font-medium shrink-0">{k}</span>
                    <span className="text-xs text-slate-700 font-semibold capitalize text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            {(opp.contact_email || opp.Organization?.contact_phone || opp.Organization?.website_url || opp.PostedBy?.contact_phone || opp.PostedBy?.website_url) && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Contact</h3>
                {opp.contact_email && (
                  <a href={`mailto:${opp.contact_email}`}
                    className="text-sm font-medium hover:underline transition-colors flex items-center gap-1"
                    style={{ color: '#1B3A6B' }}>
                    <Mail size={14} /> {opp.contact_email}
                  </a>
                )}
                {(opp.Organization?.contact_phone || opp.PostedBy?.contact_phone) && (
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-600"><Phone size={14} /> {opp.Organization?.contact_phone || opp.PostedBy?.contact_phone}</p>
                )}
                {(opp.Organization?.website_url || opp.PostedBy?.website_url) && (
                  <a
                    href={opp.Organization?.website_url || opp.PostedBy?.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    style={{ color: '#1B3A6B' }}
                  >
                    <Globe2 size={14} /> Visit organization website
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
