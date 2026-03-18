import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { universityApi } from '@/api';
import { Spinner, Pagination, Empty } from '@/components/common';
import { logoUrl, coverUrl, formatCurrency, truncate } from '@/utils';

const PROVINCES = [
  { value: '', label: 'All' },
  { value: 'Phnom Penh', label: 'Phnom Penh' },
  { value: 'Siem Reap', label: 'Siem Reap' },
  { value: 'Battambang', label: 'Battambang' },
  { value: 'Kampong Cham', label: 'Kampong Cham' },
  { value: 'Kandal', label: 'Kandal' },
  { value: 'Kampot', label: 'Kampot' },
  { value: 'Sihanoukville', label: 'Sihanoukville' },
  { value: 'Other', label: 'Other' },
];
const SORT_OPTIONS = [
  { value: 'rating_avg-DESC', label: 'Top rated' },
  { value: 'name-ASC', label: 'Name A-Z' },
  { value: 'name-DESC', label: 'Name Z-A' },
  { value: 'founded_year-DESC', label: 'Newest founded' },
  { value: 'founded_year-ASC', label: 'Oldest founded' },
  { value: 'tuition_min-ASC', label: 'Lowest tuition' },
  { value: 'tuition_min-DESC', label: 'Highest tuition' },
  { value: 'review_count-DESC', label: 'Most reviewed' },
];

const TYPE_STYLES = {
  public:        { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  private:       { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  international: { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
};

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const ChevronDownIcon = ({ open = false }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform ${open ? 'rotate-180' : ''}`}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function UniversityList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [total,   setTotal]             = useState(0);
  const [page,    setPage]              = useState(1);
  const [typeOpen, setTypeOpen]         = useState(false);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [sortOpen, setSortOpen]         = useState(false);
  const typeRef = useRef(null);
  const provinceRef = useRef(null);
  const sortRef = useRef(null);

  const [filters, setFilters] = useState({
    search:                searchParams.get('search')   || '',
    type:                  searchParams.get('type')     || '',
    province:              searchParams.get('province') || '',
    scholarship_available: searchParams.get('scholarship') === 'true',
    dormitory_available:   searchParams.get('dormitory')   === 'true',
    tuition_min:           searchParams.get('tuition_min') || '',
    tuition_max:           searchParams.get('tuition_max') || '',
    sort:                  searchParams.get('sort') || 'rating_avg-DESC',
  });

  const limit      = 12;
  const totalPages = Math.ceil(total / limit);
  const setFilter  = (k) => (v) => { setFilters((p) => ({ ...p, [k]: v })); setPage(1); };
  const selectedTypeLabel = useMemo(() => {
    if (!filters.type) return 'All Types';
    return filters.type.charAt(0).toUpperCase() + filters.type.slice(1);
  }, [filters.type]);
  const selectedProvinceLabel = useMemo(
    () => PROVINCES.find((province) => province.value === filters.province)?.label || 'All',
    [filters.province]
  );
  const selectedSortLabel = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === filters.sort)?.label || 'Top rated',
    [filters.sort]
  );

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [sort, order] = (filters.sort || 'rating_avg-DESC').split('-');
        const params = { page, limit, ...filters, sort, order };
        if (!params.type)                  delete params.type;
        if (!params.province)              delete params.province;
        if (!params.scholarship_available) delete params.scholarship_available;
        if (!params.dormitory_available)   delete params.dormitory_available;
        if (!params.search)                delete params.search;
        if (!params.tuition_min)           delete params.tuition_min;
        if (!params.tuition_max)           delete params.tuition_max;
        delete params.sort;
        const res = await universityApi.list(params);
        setUniversities(res.data.data || []);
        setTotal(res.data.total || 0);
      } catch {
        setUniversities([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filters, page]);

  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    if (filters.province) params.province = filters.province;
    if (filters.scholarship_available) params.scholarship = 'true';
    if (filters.dormitory_available) params.dormitory = 'true';
    if (filters.tuition_min) params.tuition_min = filters.tuition_min;
    if (filters.tuition_max) params.tuition_max = filters.tuition_max;
    if (filters.sort && filters.sort !== 'rating_avg-DESC') params.sort = filters.sort;
    if (page > 1) params.page = String(page);
    setSearchParams(params);
  }, [filters, page, setSearchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!typeRef.current?.contains(event.target)) setTypeOpen(false);
      if (!provinceRef.current?.contains(event.target)) setProvinceOpen(false);
      if (!sortRef.current?.contains(event.target)) setSortOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-slate-50 min-h-screen">

      {/* ── Page header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Universities in Cambodia</h1>
        <p className="text-slate-500 text-sm">
          {loading ? 'Loading...' : `${total} universities found`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Filters sidebar ── */}
        <aside className="lg:w-56 shrink-0 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">

            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Search</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-[#1B3A6B] focus-within:ring-2 focus-within:ring-[#1B3A6B]/10 transition-all">
                <span className="text-slate-400 shrink-0"><SearchIcon /></span>
                <input
                  type="text" value={filters.search}
                  onChange={(e) => setFilter('search')(e.target.value)}
                  placeholder="University name..."
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Type</label>
              <div ref={typeRef} className="relative">
                <button
                  type="button"
                  onClick={() => setTypeOpen((open) => !open)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 focus:border-[#1B3A6B] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/10"
                >
                  <span>{selectedTypeLabel}</span>
                  <span className="text-slate-400">
                    <ChevronDownIcon open={typeOpen} />
                  </span>
                </button>

                {typeOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-lg">
                    {['', 'public', 'private', 'international'].map((type) => (
                      <button
                        key={type || 'all'}
                        type="button"
                        onClick={() => {
                          setFilter('type')(type);
                          setTypeOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-all ${
                          filters.type === type
                            ? 'bg-[#1B3A6B] text-white'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        <span className="capitalize">{type || 'All Types'}</span>
                        {filters.type === type && <CheckIcon />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Province */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Province</label>
              <div ref={provinceRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProvinceOpen((open) => !open)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 focus:border-[#1B3A6B] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/10"
                >
                  <span>{selectedProvinceLabel}</span>
                  <span className="text-slate-400">
                    <ChevronDownIcon open={provinceOpen} />
                  </span>
                </button>

                {provinceOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-lg">
                    {PROVINCES.map((province) => (
                      <button
                        key={province.label}
                        type="button"
                        onClick={() => {
                          setFilter('province')(province.value);
                          setProvinceOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-all ${
                          filters.province === province.value
                            ? 'bg-[#1B3A6B] text-white'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        <span>{province.label}</span>
                        {filters.province === province.value && <CheckIcon />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tuition range */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Tuition Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.tuition_min}
                  onChange={(e) => setFilter('tuition_min')(e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 outline-none focus:border-[#1B3A6B] transition-all"
                />
                <input
                  type="number"
                  min="0"
                  value={filters.tuition_max}
                  onChange={(e) => setFilter('tuition_max')(e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 outline-none focus:border-[#1B3A6B] transition-all"
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Annual tuition in USD</p>
            </div>

            {/* Sort */}
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

            {/* Checkboxes */}
            <div className="space-y-3 pt-1">
              {[
                ['scholarship_available', '🏆 Has Scholarship'],
                ['dormitory_available',   '🏠 Has Dormitory'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => setFilter(key)(!filters[key])}
                    className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all shrink-0 ${
                      filters[key]
                        ? 'border-[#1B3A6B] bg-[#1B3A6B]'
                        : 'border-slate-300 bg-white group-hover:border-[#1B3A6B]'
                    }`}>
                    {filters[key] && <CheckIcon />}
                  </div>
                  <span className="text-sm text-slate-600 font-medium">{label}</span>
                </label>
              ))}
            </div>

            {/* Clear filters */}
            {(filters.search || filters.type || filters.province || filters.scholarship_available || filters.dormitory_available || filters.tuition_min || filters.tuition_max || filters.sort !== 'rating_avg-DESC') && (
              <button
                onClick={() => setFilters({
                  search: '',
                  type: '',
                  province: '',
                  scholarship_available: false,
                  dormitory_available: false,
                  tuition_min: '',
                  tuition_max: '',
                  sort: 'rating_avg-DESC',
                })}
                className="w-full py-2 rounded-xl text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-all">
                ✕ Clear filters
              </button>
            )}
          </div>
        </aside>

        {/* ── Grid ── */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : universities.length === 0 ? (
            <Empty title="No universities found" description="Try adjusting your filters." />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {universities.map((uni) => {
                  const uniType = uni.type || uni.university_type;
                  const ts = TYPE_STYLES[uniType] || TYPE_STYLES.public;
                  return (
                    <Link key={uni.id} to={`/universities/${uni.slug}`} className="group block">
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full">

                        {/* Cover */}
                        <div className="h-36 relative overflow-hidden bg-slate-100">
                          {uni.cover_url ? (
                            <img src={coverUrl(uni.cover_url) || uni.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-100 to-slate-200">🏛️</div>
                          )}
                          {/* Type badge */}
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                            style={{ background: ts.bg, color: ts.text, border: `1px solid ${ts.border}` }}>
                            {uniType}
                          </span>
                          {/* Featured badge */}
                          {uni.is_featured && (
                            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold"
                              style={{ background: '#fff7ed', color: '#F47B20', border: '1px solid #fed7aa' }}>
                              ⭐ Featured
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          {/* Logo + Name */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-lg overflow-hidden">
                              {uni.logo_url
                                ? <img src={logoUrl(uni.logo_url)} alt="" className="w-full h-full object-cover" />
                                : '🎓'}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#1B3A6B] transition-colors line-clamp-2">{uni.name}</h3>
                              <p className="text-xs text-slate-500 mt-0.5">📍 {uni.province}</p>
                            </div>
                          </div>

                          {uni.description && (
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{truncate(uni.description, 100)}</p>
                          )}

                          {/* Stats */}
                          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                            <span className="font-semibold" style={{ color: '#F47B20' }}>
                              ★ {uni.rating_avg ? Number(uni.rating_avg).toFixed(1) : '—'}
                            </span>
                            {uni.tuition_min && (
                              <span className="text-slate-500">{formatCurrency(uni.tuition_min)}/yr</span>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="flex gap-1.5 mt-3 flex-wrap">
                            {uni.scholarship_available && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">🏆 Scholarship</span>
                            )}
                            {uni.dormitory_available && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">🏠 Dorm</span>
                            )}
                            {uni.international_students && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">🌏 Intl</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8">
                <Pagination
                  page={page} totalPages={totalPages}
                  onNext={() => setPage((p) => p + 1)}
                  onPrev={() => setPage((p) => p - 1)}
                  onPage={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
