import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { universityApi } from '@/api';
import { Card, Badge, Spinner, Pagination, Empty } from '@/components/common';
import { debounce, logoUrl, formatCurrency, truncate } from '@/utils';

const PROVINCES = ['All', 'Phnom Penh', 'Siem Reap', 'Battambang', 'Kampong Cham', 'Other'];

export default function UniversityList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [total,   setTotal]             = useState(0);
  const [page,    setPage]              = useState(1);

  const [filters, setFilters] = useState({
    search:    searchParams.get('search')   || '',
    type:      searchParams.get('type')     || '',
    province:  searchParams.get('province') || '',
    scholarship_available: searchParams.get('scholarship') === 'true',
    dormitory_available:   searchParams.get('dormitory')   === 'true',
  });

  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  const setFilter = (k) => (v) => setFilters((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { page, limit, ...filters };
        if (!params.type)     delete params.type;
        if (!params.province) delete params.province;
        if (!params.scholarship_available) delete params.scholarship_available;
        if (!params.dormitory_available)   delete params.dormitory_available;

        const res = await universityApi.list(params);
        setUniversities(res.data.universities || []);
        setTotal(res.data.total || 0);
      } catch (_) {
        setUniversities([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filters, page]);

  const typeColors = { public: 'blue', private: 'green', international: 'purple' };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Universities in Cambodia</h1>
        <p className="text-slate-400 text-sm">{total} universities found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Filters sidebar ── */}
        <aside className="lg:w-56 shrink-0 space-y-6">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Search</label>
            <input type="text" value={filters.search}
              onChange={(e) => setFilter('search')(e.target.value)}
              placeholder="University name..."
              className="input-base" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Type</label>
            <div className="space-y-1">
              {['', 'public', 'private', 'international'].map((t) => (
                <button key={t} onClick={() => setFilter('type')(t)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-all ${filters.type === t ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}>
                  {t || 'All types'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Province</label>
            <select value={filters.province} onChange={(e) => setFilter('province')(e.target.value)}
              className="input-base bg-[#1e2433]">
              {PROVINCES.map((p) => <option key={p} value={p === 'All' ? '' : p}>{p}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            {[
              ['scholarship_available', 'Has Scholarship'],
              ['dormitory_available',   'Has Dormitory'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                <div onClick={() => setFilter(key)(!filters[key])}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${filters[key] ? 'bg-indigo-600 border-indigo-600' : 'bg-white/5 border-white/20'}`}>
                  {filters[key] && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
                <span className="text-sm text-slate-300">{label}</span>
              </label>
            ))}
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
                {universities.map((uni) => (
                  <Link key={uni.id} to={`/universities/${uni.slug}`}>
                    <Card className="overflow-hidden hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all h-full">
                      {/* Cover */}
                      <div className="h-36 bg-gradient-to-br from-indigo-900/40 to-slate-900/40 relative overflow-hidden">
                        {uni.cover_url && (
                          <img src={uni.cover_url} alt="" className="w-full h-full object-cover opacity-70" />
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge color={typeColors[uni.type] || 'blue'}>{uni.type}</Badge>
                        </div>
                        {uni.is_featured && (
                          <div className="absolute top-3 right-3">
                            <Badge color="yellow">Featured</Badge>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        {/* Logo + Name */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-lg overflow-hidden">
                            {uni.logo_url ? <img src={logoUrl(uni.logo_url)} alt="" className="w-full h-full object-cover" /> : '🎓'}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white leading-tight">{uni.name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{uni.province}</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{truncate(uni.description, 100)}</p>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/[0.06]">
                          <span>⭐ {uni.rating_avg || '—'}</span>
                          {uni.tuition_min && <span>{formatCurrency(uni.tuition_min)}/yr</span>}
                          <span>{uni.program_count || 0} programs</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              <Pagination
                page={page} totalPages={totalPages}
                onNext={() => setPage((p) => p + 1)}
                onPrev={() => setPage((p) => p - 1)}
                onPage={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
