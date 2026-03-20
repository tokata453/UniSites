import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, ChevronLeft, ExternalLink, Globe2, Mail, Phone, BadgeCheck, CircleDollarSign, Star, Clock3, ChevronRight } from 'lucide-react';
import { organizationApi } from '@/api';
import { Empty, Spinner } from '@/components/common';
import { coverUrl, logoUrl, formatDate } from '@/utils';

const TypeBadge = ({ type }) => (
  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
    {type}
  </span>
);

const SectionCard = ({ title, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
    {children}
  </div>
);

export default function OrganizationDetail() {
  const { slug } = useParams();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    organizationApi.getBySlug(slug)
      .then((res) => setOrganization(res.data.organization))
      .catch(() => setOrganization(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const gallery = useMemo(
    () => (organization?.Gallery || []).filter((item) => item.image_url),
    [organization],
  );

  const opportunities = useMemo(
    () => organization?.Opportunities || [],
    [organization],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <Empty title="Organization not found" description="This organization profile may be unavailable or unpublished." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link to="/opportunities" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-[#1B3A6B]">
          <ChevronLeft size={15} /> Back
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-56 bg-slate-100">
            {organization.cover_url ? (
              <img src={coverUrl(organization.cover_url) || organization.cover_url} alt={organization.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_100%)] text-slate-400">
                <Building2 size={48} />
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-sm">
                  {organization.logo_url ? (
                    <img src={logoUrl(organization.logo_url) || organization.logo_url} alt={organization.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-2xl font-bold text-slate-500">
                      {organization.name?.[0]?.toUpperCase() || 'O'}
                    </div>
                  )}
                </div>
                <div className="min-w-0 pb-1">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${organization.is_verified ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                      <BadgeCheck size={12} /> {organization.is_verified ? 'Verified Organization' : 'Organization'}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">{organization.name}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                    {organization.description || 'No public description yet.'}
                  </p>
                </div>
              </div>
              {organization.website_url && (
                <a
                  href={organization.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Globe2 size={15} /> Visit Website
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {opportunities.length > 0 && (
              <SectionCard title="Published Opportunities">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {opportunities.map((opp) => (
                    <Link key={opp.id} to={`/opportunities/${opp.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-slate-300 hover:bg-white">
                      <div className="h-40 bg-slate-100">
                        {opp.cover_url ? (
                          <img src={coverUrl(opp.cover_url) || opp.cover_url} alt={opp.title} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="p-4">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <TypeBadge type={opp.type} />
                          {opp.is_featured && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              <Star size={12} className="fill-current" /> Featured
                            </span>
                          )}
                          {opp.is_fully_funded && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                              <CircleDollarSign size={12} /> Full Funding
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold leading-snug text-slate-800 transition-colors group-hover:text-[#1B3A6B]">{opp.title}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={12} /> {opp.deadline ? formatDate(opp.deadline) : 'No deadline'}
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#1B3A6B]">
                            View <ChevronRight size={13} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </SectionCard>
            )}

            {gallery.length > 0 && (
              <SectionCard title="Gallery">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {gallery.slice(0, 6).map((item) => (
                    <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      <img src={coverUrl(item.image_url) || item.image_url} alt={item.caption || organization.name} className="h-36 w-full object-cover" />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {organization.FAQs?.length > 0 && (
              <SectionCard title="FAQs">
                <div className="space-y-3">
                  {organization.FAQs.map((faq) => (
                    <div key={faq.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-800">{faq.question}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-500">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          <div className="space-y-6">
            <SectionCard title="Contact">
              <div className="space-y-3 text-sm text-slate-600">
                {organization.email && (
                  <a href={`mailto:${organization.email}`} className="flex items-center gap-2 hover:text-[#1B3A6B]">
                    <Mail size={14} /> {organization.email}
                  </a>
                )}
                {(organization.contact_phone || organization.Contact?.general_phone) && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} /> {organization.contact_phone || organization.Contact?.general_phone}
                  </div>
                )}
                {(organization.website_url || organization.Contact?.website_url) && (
                  <a href={organization.website_url || organization.Contact?.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#1B3A6B]">
                    <Globe2 size={14} /> Visit website <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
