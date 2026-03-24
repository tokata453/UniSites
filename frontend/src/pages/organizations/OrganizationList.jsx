import { useState, useEffect, useMemo, useRef } from 'react';
import { BadgeCheck, Building2, ChevronDown, Globe2, MapPin, Star, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { organizationApi } from '@/api';
import { Spinner, Pagination, Empty } from '@/components/common';
import { coverUrl, logoUrl, truncate } from '@/utils';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'ngo', label: 'NGO' },
  { value: 'company', label: 'Company' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'exchange', label: 'Exchange Program' },
  { value: 'community', label: 'Community Group' },
  { value: 'education', label: 'Education Partner' },
];

const SORT_OPTIONS = [
  { value: 'name-ASC', label: 'Name A-Z' },
  { value: 'name-DESC', label: 'Name Z-A' },
  { value: 'created_at-DESC', label: 'Newest added' },
  { value: 'founded_year-DESC', label: 'Newest founded' },
  { value: 'founded_year-ASC', label: 'Oldest founded' },
];

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ChevronDownIcon = ({ open = false }) => <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />;

export default function OrganizationList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [showAll, setShowAll] = useState(searchParams.get('view') === 'all');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const categoryRef = useRef(null);
  const sortRef = useRef(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    verified: searchParams.get('verified') === 'true',
    sort: searchParams.get('sort') || 'name-ASC',
  });

  const limit = showAll ? 1000 : 12;
  const totalPages = Math.ceil(total / limit);
  const setFilter = (key) => (value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const selectedCategoryLabel = useMemo(
    () => CATEGORY_OPTIONS.find((option) => option.value === filters.category)?.label || 'All Categories',
    [filters.category]
  );

  const selectedSortLabel = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === filters.sort)?.label || 'Name A-Z',
    [filters.sort]
  );

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      try {
        const [sort, order] = filters.sort.split('-');
        const params = {
          page: showAll ? 1 : page,
          limit,
          sort,
          order,
          search: filters.search || undefined,
          category: filters.category || undefined,
          location: filters.location || undefined,
          verified: filters.verified ? 'true' : undefined,
        };
        const res = await organizationApi.list(params, {
          signal: controller.signal,
          skipGlobalErrorToast: true,
        });
        if (!cancelled) {
          setOrganizations(res.data.organizations || []);
          setTotal(res.data.meta?.total || res.data.total || 0);
        }
      } catch (err) {
        if (err?.code === 'ERR_CANCELED') return;
        if (!cancelled) {
          setOrganizations([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [filters, page, showAll, limit]);

  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.location) params.location = filters.location;
    if (filters.verified) params.verified = 'true';
    if (filters.sort !== 'name-ASC') params.sort = filters.sort;
    if (showAll) params.view = 'all';
    if (!showAll && page > 1) params.page = String(page);
    setSearchParams(params);
  }, [filters, page, setSearchParams, showAll]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!categoryRef.current?.contains(event.target)) setCategoryOpen(false);
      if (!sortRef.current?.contains(event.target)) setSortOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-slate-50 min-h-screen sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Organizations</h1>
        <p className="text-slate-500 text-sm">
          {loading ? 'Loading...' : `${total} organizations found`}
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

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 shrink-0 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Search</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-[#1B3A6B] focus-within:ring-2 focus-within:ring-[#1B3A6B]/10 transition-all">
                <span className="text-slate-400 shrink-0"><SearchIcon /></span>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilter('search')(e.target.value)}
                  placeholder="Organization name..."
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Category</label>
              <div ref={categoryRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((open) => !open)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 focus:border-[#1B3A6B] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/10"
                >
                  <span>{selectedCategoryLabel}</span>
                  <span className="text-slate-400">
                    <ChevronDownIcon open={categoryOpen} />
                  </span>
                </button>

                {categoryOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-lg">
                    {CATEGORY_OPTIONS.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => {
                          setFilter('category')(option.value);
                          setCategoryOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-all ${
                          filters.category === option.value
                            ? 'bg-[#1B3A6B] text-white'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        <span>{option.label}</span>
                        {filters.category === option.value && <CheckIcon />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilter('location')(e.target.value)}
                placeholder="Phnom Penh..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 outline-none focus:border-[#1B3A6B] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Sort By</label>
              <div ref={sortRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((open) => !open)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 focus:border-[#1B3A6B] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/10"
                >
                  <span>{selectedSortLabel}</span>
                  <span className="text-slate-400">
                    <ChevronDownIcon open={sortOpen} />
                  </span>
                </button>

                {sortOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-lg">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setFilter('sort')(option.value);
                          setSortOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-all ${
                          filters.sort === option.value
                            ? 'bg-[#1B3A6B] text-white'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        <span>{option.label}</span>
                        {filters.sort === option.value && <CheckIcon />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setFilter('verified')(!filters.verified)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all shrink-0 ${
                    filters.verified
                      ? 'border-[#1B3A6B] bg-[#1B3A6B]'
                      : 'border-slate-300 bg-white group-hover:border-[#1B3A6B]'
                  }`}
                >
                  {filters.verified && <CheckIcon />}
                </div>
                <span className="text-sm text-slate-600 font-medium">Verified only</span>
              </label>
            </div>

            {(filters.search || filters.category || filters.location || filters.verified || filters.sort !== 'name-ASC') && (
              <button
                onClick={() => setFilters({
                  search: '',
                  category: '',
                  location: '',
                  verified: false,
                  sort: 'name-ASC',
                })}
                className="w-full py-2 rounded-xl text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-all"
              >
                Clear filters
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : organizations.length === 0 ? (
            <Empty title="No organizations found" description="Try adjusting your filters." />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {organizations.map((organization) => (
                  <Link key={organization.id} to={`/organizations/${organization.slug}`} className="group block">
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full">
                      <div className="h-36 relative overflow-hidden bg-slate-100">
                        {organization.cover_url ? (
                          <img src={coverUrl(organization.cover_url) || organization.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500"><Building2 size={52} /></div>
                        )}
                        {organization.category && (
                          <span
                            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                            style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                          >
                            {organization.category}
                          </span>
                        )}
                        {organization.is_verified && (
                          <span
                            className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
                          >
                            <span className="inline-flex items-center gap-1"><BadgeCheck size={12} /> Verified</span>
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-lg overflow-hidden">
                            {organization.logo_url
                              ? <img src={logoUrl(organization.logo_url) || organization.logo_url} alt="" className="w-full h-full object-cover" />
                              : <Building2 size={18} className="text-slate-500" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#1B3A6B] transition-colors line-clamp-2">{organization.name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5 inline-flex items-center gap-1">
                              <MapPin size={12} /> {organization.location || 'Location not set'}
                            </p>
                          </div>
                        </div>

                        {(organization.tagline || organization.description) && (
                          <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                            {truncate(organization.tagline || organization.description, 100)}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                          <span className="font-semibold" style={{ color: '#F47B20' }}>
                            <span className="inline-flex items-center gap-1"><Star size={12} className="fill-current" /> {organization.is_verified ? 'Trusted profile' : 'Public profile'}</span>
                          </span>
                          {organization.founded_year && (
                            <span className="text-slate-500">Founded {organization.founded_year}</span>
                          )}
                        </div>

                        <div className="flex gap-1.5 mt-3 flex-wrap">
                          {organization.team_size && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><Users size={12} /> {organization.team_size}</span>
                          )}
                          {organization.website_url && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200"><Globe2 size={12} /> Website</span>
                          )}
                          {organization.opportunity_count > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              {organization.opportunity_count} opportunit{organization.opportunity_count === 1 ? 'y' : 'ies'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {!showAll && (
                <div className="mt-8">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onNext={() => setPage((p) => p + 1)}
                    onPrev={() => setPage((p) => p - 1)}
                    onPage={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
