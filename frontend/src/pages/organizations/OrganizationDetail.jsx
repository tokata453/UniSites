import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, Building2, CalendarDays, ChevronLeft, Clock3, ExternalLink, Globe2, Layers3, Mail, MapPin, Phone, Star, Users } from 'lucide-react';
import { inboxApi, organizationApi } from '@/api';
import { Empty, Spinner } from '@/components/common';
import { useAuth, useToast } from '@/hooks';
import { avatarUrl, coverUrl, formatDate, logoUrl } from '@/utils';

const TABS = ['Overview', 'Opportunities', 'Gallery', 'News', 'Events', 'FAQs', 'Reviews'];

const Card = ({ className = '', children }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
);

const Badge = ({ children, tone = 'slate' }) => {
  const tones = {
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    blue: 'bg-blue-50 border-blue-200 text-[#1B3A6B]',
    slate: 'bg-slate-50 border-slate-200 text-slate-600',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${tones[tone] || tones.slate}`}>{children}</span>;
};

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-4">
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
  </div>
);

export default function OrganizationDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { error, info, success } = useToast();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [reviewForm, setReviewForm] = useState({ rating: 0, content: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await organizationApi.getBySlug(slug, {
          signal: controller.signal,
          skipGlobalErrorToast: true,
        });
        if (!cancelled) {
          setOrganization(res.data.organization);
        }
      } catch (err) {
        if (err?.code === 'ERR_CANCELED') return;
        if (!cancelled) {
          setOrganization(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [slug]);

  const gallery = useMemo(
    () => (organization?.Gallery || []).filter((item) => item.url),
    [organization],
  );

  const opportunities = useMemo(
    () => organization?.Opportunities || [],
    [organization],
  );
  const news = useMemo(() => organization?.News || [], [organization]);
  const events = useMemo(() => organization?.Events || [], [organization]);
  const reviews = useMemo(() => organization?.Reviews || [], [organization]);

  const contact = organization?.Contact || {};
  const socialLinks = [
    organization?.facebook_url || contact.facebook_page ? { label: 'Facebook', href: organization?.facebook_url || contact.facebook_page, color: 'text-blue-600' } : null,
    organization?.telegram_url || contact.telegram ? { label: 'Telegram', href: organization?.telegram_url || contact.telegram, color: 'text-sky-600' } : null,
    organization?.instagram_url || contact.instagram ? { label: 'Instagram', href: organization?.instagram_url || contact.instagram, color: 'text-pink-600' } : null,
    organization?.linkedin_url || contact.linkedin ? { label: 'LinkedIn', href: organization?.linkedin_url || contact.linkedin, color: 'text-blue-700' } : null,
  ].filter(Boolean);

  const handleMessageOrganization = async () => {
    if (!isAuthenticated) {
      info('Please log in to send a message');
      navigate('/login');
      return;
    }
    if (!organization?.id) {
      error('This organization is not available for messaging right now');
      return;
    }
    try {
      const res = await inboxApi.createConversation({
        context: 'organization',
        organization_id: organization.id,
      });
      const inboxPath = user?.Role?.name === 'owner'
        ? '/owner/inbox'
        : user?.Role?.name === 'organization'
        ? '/organization/inbox'
        : user?.Role?.name === 'admin'
        ? '/admin/inbox'
        : '/dashboard/inbox';
      const conversationId = res.data.conversation?.id;
      navigate(`${inboxPath}?context=organization${conversationId ? `&conversation=${conversationId}` : ''}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to open conversation');
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      info('Please log in to submit a review');
      navigate('/login');
      return;
    }
    if (!organization?.id) return;
    if (!reviewForm.rating) {
      error('Please select a rating');
      return;
    }

    setReviewSubmitting(true);
    try {
      await organizationApi.createReview(organization.id, {
        rating: reviewForm.rating,
        content: reviewForm.content.trim() || null,
        title: null,
      });
      const res = await organizationApi.getBySlug(slug);
      setOrganization(res.data.organization);
      setReviewForm({ rating: 0, content: '' });
      success('Review published successfully.');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!organization) return <div className="px-6 py-20"><Empty title="Organization not found" description="This organization profile may be unavailable or unpublished." /></div>;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="relative h-56 overflow-hidden bg-slate-200 md:h-72">
        {organization.cover_url
          ? <img src={coverUrl(organization.cover_url) || organization.cover_url} alt="" className="h-full w-full object-cover" />
          : gallery[0]
          ? <img src={coverUrl(gallery[0].url) || gallery[0].url} alt="" className="h-full w-full object-cover" />
          : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500"><Building2 size={72} /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative z-10 mb-8 -mt-12 flex flex-col gap-5 md:flex-row">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-white text-4xl shadow-md">
            {organization.logo_url
              ? <img src={logoUrl(organization.logo_url) || organization.logo_url} alt="" className="h-full w-full object-cover" />
              : <Building2 size={34} className="text-slate-500" />}
          </div>

          <div className="flex-1 pt-2 md:pt-14">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone="teal">Organization</Badge>
              {organization.category && <Badge tone="blue">{organization.category}</Badge>}
              {organization.is_verified && <Badge tone="green"><BadgeCheck size={12} /> Verified</Badge>}
              {opportunities.length > 0 && <Badge tone="blue"><Star size={12} className="fill-current" /> Active Opportunities</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">{organization.name}</h1>
            {organization.shortcut_name && <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{organization.shortcut_name}</p>}
            {organization.tagline && <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">{organization.tagline}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
              {(contact.address || organization.location) && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {contact.address || organization.location}</span>}
              {organization.founded_year && <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> Founded {organization.founded_year}</span>}
              {organization.team_size && <span className="inline-flex items-center gap-1"><Users size={14} /> {organization.team_size}</span>}
              {contact.office_hours && <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> {contact.office_hours}</span>}
              <span className="inline-flex items-center gap-1"><Users size={14} /> {opportunities.length} opportunit{opportunities.length === 1 ? 'y' : 'ies'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-stretch gap-2 md:items-start md:pt-14">
            <Link to="/opportunities" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50">
              <span className="inline-flex items-center gap-1"><ChevronLeft size={15} /> Back</span>
            </Link>
            {(organization.website_url || contact.website_url) && (
              <a href={organization.website_url || contact.website_url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50">
                <span className="inline-flex items-center gap-1"><Globe2 size={15} /> Website</span>
              </a>
            )}
            <button type="button" onClick={handleMessageOrganization} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50">
              <span className="inline-flex items-center gap-1"><Mail size={15} /> Message Organization</span>
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-0 overflow-x-auto border-b border-slate-200">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className="mb-[-1px] whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all"
              style={tab === item ? { borderColor: '#1B3A6B', color: '#1B3A6B' } : { borderColor: 'transparent', color: '#64748b' }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="pb-16">
          {tab === 'Overview' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-2">
                <Card className="p-6">
                  <SectionTitle title="About This Organization" subtitle="What the organization does and how it supports students or partners" />
                  <p className="text-sm leading-relaxed text-slate-600">{organization.description || 'This organization has not added a public description yet.'}</p>
                </Card>

                {(organization.mission || organization.vision) && (
                  <Card className="p-6">
                    <SectionTitle title="Mission and Vision" subtitle="The purpose behind the organization and the future it is working toward" />
                    <div className="grid gap-4 md:grid-cols-2">
                      {organization.mission && (
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mission</p>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">{organization.mission}</p>
                        </div>
                      )}
                      {organization.vision && (
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vision</p>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">{organization.vision}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {(organization.category || organization.industry || organization.team_size || organization.founded_year || organization.location) && (
                  <Card className="p-6">
                    <SectionTitle title="Organization Snapshot" subtitle="Key facts that help visitors understand your background at a glance" />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {organization.category && (
                        <div className="rounded-xl border border-slate-200 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Category</p>
                          <p className="mt-2 text-base font-bold text-slate-800">{organization.category}</p>
                        </div>
                      )}
                      {organization.industry && (
                        <div className="rounded-xl border border-slate-200 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Industry</p>
                          <p className="mt-2 text-base font-bold text-slate-800">{organization.industry}</p>
                        </div>
                      )}
                      {organization.team_size && (
                        <div className="rounded-xl border border-slate-200 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Team Size</p>
                          <p className="mt-2 text-base font-bold text-slate-800">{organization.team_size}</p>
                        </div>
                      )}
                      {organization.founded_year && (
                        <div className="rounded-xl border border-slate-200 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Founded</p>
                          <p className="mt-2 text-base font-bold text-slate-800">{organization.founded_year}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {opportunities.length > 0 && (
                  <Card className="p-6">
                    <SectionTitle title="Opportunity Snapshot" subtitle="A quick preview of what this organization is currently publishing" />
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Live Opportunities</p>
                        <p className="mt-2 text-2xl font-bold text-slate-800">{opportunities.length}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Featured Posts</p>
                        <p className="mt-2 text-2xl font-bold text-slate-800">{opportunities.filter((item) => item.is_featured).length}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fully Funded</p>
                        <p className="mt-2 text-2xl font-bold text-slate-800">{opportunities.filter((item) => item.is_fully_funded).length}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {gallery.length > 0 && (
                  <Card className="p-6">
                    <SectionTitle title="Visual Preview" subtitle="Scenes from the organization’s work, programs, or community" />
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {gallery.slice(0, 6).map((item) => (
                        <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                          <img src={coverUrl(item.url) || item.url} alt={item.caption || organization.name} className="h-40 w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                <Card className="p-6">
                  <SectionTitle title="Quick Info" subtitle="The basics students usually look for first" />
                  <div className="space-y-3 text-sm">
                    {[
                      ['Type', 'Organization'],
                      ['Category', organization.category],
                      ['Industry', organization.industry],
                      ['Location', organization.location || contact.address],
                      ['Team Size', organization.team_size],
                      ['Founded', organization.founded_year],
                      ['Website', organization.website_url || contact.website_url],
                      ['Email', organization.email || contact.general_email],
                      ['Phone', organization.contact_phone || contact.general_phone],
                      ['Office Hours', contact.office_hours],
                      ['Address', contact.address],
                      ['FAQs', organization.FAQs?.length ? `${organization.FAQs.length} entries` : null],
                      ['Gallery', gallery.length ? `${gallery.length} images` : null],
                    ].filter(([, value]) => value).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between border-b border-slate-100 py-1.5 last:border-0">
                        <span className="text-xs font-medium text-slate-500">{key}</span>
                        <span className="max-w-[62%] text-right text-xs font-semibold capitalize text-slate-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {(organization.email || organization.contact_phone || contact.general_email || contact.general_phone || contact.office_hours) && (
                  <Card className="p-5">
                    <SectionTitle title="Contact" subtitle="The easiest ways to reach the organization" />
                    <div className="space-y-2.5 text-sm">
                      {(organization.email || contact.general_email) && <p className="flex items-center gap-2 text-slate-600"><Mail size={14} /> <span className="truncate">{organization.email || contact.general_email}</span></p>}
                      {(organization.contact_phone || contact.general_phone) && <p className="flex items-center gap-2 text-slate-600"><Phone size={14} /> {organization.contact_phone || contact.general_phone}</p>}
                      {contact.office_hours && <p className="flex items-center gap-2 text-slate-600"><Clock3 size={14} /> {contact.office_hours}</p>}
                      {(organization.address || contact.address) && <p className="flex items-start gap-2 text-slate-600"><MapPin size={14} className="mt-0.5 shrink-0" /> <span>{organization.address || contact.address}</span></p>}
                      {contact.map_embed_url && (
                        <a href={contact.map_embed_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium text-[#1B3A6B] hover:underline">
                          <ExternalLink size={14} /> View Map
                        </a>
                      )}
                    </div>
                  </Card>
                )}

                {socialLinks.length > 0 && (
                  <Card className="p-5">
                    <SectionTitle title="Social Media" subtitle="Follow the organization outside UniSites" />
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map((item) => (
                        <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className={`rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-slate-50 ${item.color}`}>
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {tab === 'Opportunities' && (
            <div className="space-y-4">
              {opportunities.length > 0 ? (
                opportunities.map((opp) => (
                  <Card key={opp.id} className="overflow-hidden">
                    <div className="grid gap-0 md:grid-cols-[240px_1fr]">
                      <div className="h-48 bg-slate-100 md:h-full">
                        {opp.cover_url ? (
                          <img src={coverUrl(opp.cover_url) || opp.cover_url} alt={opp.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500"><Building2 size={40} /></div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <Badge tone="blue">{opp.type}</Badge>
                          {opp.is_featured && <Badge tone="amber"><Star size={12} className="fill-current" /> Featured</Badge>}
                          {opp.is_fully_funded && <Badge tone="green">Fully Funded</Badge>}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">{opp.title}</h3>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                          {opp.deadline && <span className="inline-flex items-center gap-1"><Clock3 size={14} /> {formatDate(opp.deadline)}</span>}
                          {opp.country && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {opp.country}</span>}
                        </div>
                        <div className="mt-5">
                          <Link to={`/opportunities/${opp.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">
                            View Opportunity
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center text-sm text-slate-500">No public opportunities available from this organization yet.</Card>
              )}
            </div>
          )}

          {tab === 'Gallery' && (
            <div className="space-y-4">
              {gallery.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {gallery.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <img src={coverUrl(item.url) || item.url} alt={item.caption || organization.name} className="h-52 w-full object-cover" />
                      {(item.caption || item.category) && (
                        <div className="p-4">
                          <p className="text-sm font-semibold text-slate-800">{item.caption || 'Organization image'}</p>
                          {item.category && <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{item.category}</p>}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center text-sm text-slate-500">No gallery images have been published yet.</Card>
              )}
            </div>
          )}

          {tab === 'FAQs' && (
            <div className="space-y-4">
              {organization.FAQs?.length > 0 ? (
                organization.FAQs.map((faq) => (
                  <Card key={faq.id} className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                        <Layers3 size={18} />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-800">{faq.question}</p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center text-sm text-slate-500">No FAQs have been published yet.</Card>
              )}
            </div>
          )}

          {tab === 'Reviews' && (
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id} className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-600">
                          {review.Author?.avatar_url ? (
                            <img src={avatarUrl(review.Author.avatar_url) || review.Author.avatar_url} alt={review.Author?.name || 'Reviewer'} className="h-full w-full object-cover" />
                          ) : (
                            <span>{(review.Author?.name || 'U').slice(0, 1).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-base font-semibold text-slate-800">{review.Author?.name || 'Anonymous user'}</p>
                              <p className="mt-0.5 text-xs text-slate-400">{formatDate(review.createdAt || review.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <span key={`${review.id}-${index}`} className={index < Math.round(review.rating || 0) ? 'text-amber-500' : 'text-slate-200'}>★</span>
                              ))}
                            </div>
                          </div>
                          {review.content ? <p className="mt-3 text-sm leading-7 text-slate-600">{review.content}</p> : null}
                          {review.owner_reply ? (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <p className="text-sm font-semibold text-slate-800">{organization.name}</p>
                              <p className="mt-2 text-sm leading-6 text-slate-600">{review.owner_reply}</p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center text-sm text-slate-500">No public reviews yet.</Card>
                )}
              </div>
              <Card className="p-6">
                <SectionTitle title="Leave a Review" subtitle="Share your experience with this organization." />
                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Rating</p>
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setReviewForm((prev) => ({ ...prev, rating: value }))}
                            className={`text-2xl ${value <= reviewForm.rating ? 'text-amber-500' : 'text-slate-200'}`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Your Review</p>
                    <textarea
                      rows={5}
                      value={reviewForm.content}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, content: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10"
                      placeholder="Share something useful for future visitors."
                    />
                  </div>
                  <button type="submit" disabled={reviewSubmitting} className="inline-flex items-center justify-center rounded-xl bg-[#1B3A6B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60">
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </Card>
            </div>
          )}

          {tab === 'News' && (
            <div className="space-y-4">
              {news.length > 0 ? (
                news.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    {item.cover_url ? <img src={coverUrl(item.cover_url) || item.cover_url} alt={item.title} className="h-48 w-full object-cover" /> : null}
                    <div className="p-6">
                      <div className="mb-2 flex flex-wrap gap-2">
                        {item.category ? <Badge tone="blue">{item.category}</Badge> : null}
                        {item.is_pinned ? <Badge tone="amber">Pinned</Badge> : null}
                      </div>
                      <p className="text-xl font-bold text-slate-800">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.published_at ? formatDate(item.published_at) : 'Draft'}</p>
                      {item.excerpt ? <p className="mt-3 text-sm leading-7 text-slate-600">{item.excerpt}</p> : null}
                      {item.content ? <p className="mt-3 text-sm leading-7 text-slate-600">{item.content}</p> : null}
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center text-sm text-slate-500">No news published yet.</Card>
              )}
            </div>
          )}

          {tab === 'Events' && (
            <div className="space-y-4">
              {events.length > 0 ? (
                events.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    {item.cover_url ? <img src={coverUrl(item.cover_url) || item.cover_url} alt={item.title} className="h-48 w-full object-cover" /> : null}
                    <div className="p-6">
                      <div className="mb-2 flex flex-wrap gap-2">
                        {item.type ? <Badge tone="blue">{item.type}</Badge> : null}
                        {item.is_featured ? <Badge tone="amber">Featured</Badge> : null}
                        {item.is_online ? <Badge tone="teal">Online</Badge> : null}
                      </div>
                      <p className="text-xl font-bold text-slate-800">{item.title}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                        {item.event_date ? <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> {formatDate(item.event_date)}</span> : null}
                        {item.location ? <span className="inline-flex items-center gap-1"><MapPin size={14} /> {item.location}</span> : null}
                      </div>
                      {item.description ? <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p> : null}
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center text-sm text-slate-500">No events published yet.</Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
