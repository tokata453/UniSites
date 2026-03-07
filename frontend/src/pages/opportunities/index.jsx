// ── OpportunitiesPage ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { opportunityApi } from '@/api';
import { Card, Badge, Spinner, Pagination, Empty, Button } from '@/components/common';
import { formatDate, truncate } from '@/utils';

const TYPES    = ['', 'scholarship', 'internship', 'job', 'competition', 'grant', 'exchange'];
const DEADLINES = ['', 'this_week', 'this_month', 'next_month'];

export function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [filters, setFilters] = useState({ type: '', search: '' });

  const limit      = 12;
  const totalPages = Math.ceil(total / limit);
  const sf = (k) => (v) => setFilters((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = { page, limit, ...filters };
        if (!params.type)   delete params.type;
        if (!params.search) delete params.search;
        const res = await opportunityApi.list(params);
        setOpportunities(res.data.opportunities || []);
        setTotal(res.data.total || 0);
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, page]);

  const typeColors = { scholarship: 'green', internship: 'blue', job: 'purple', competition: 'yellow', grant: 'emerald', exchange: 'violet' };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Opportunities</h1>
        <p className="text-slate-400 text-sm">{total} opportunities available</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input type="text" value={filters.search} onChange={(e) => sf('search')(e.target.value)}
          placeholder="Search opportunities..." className="input-base max-w-sm" />
        <div className="flex gap-2 flex-wrap">
          {TYPES.map((t) => (
            <button key={t} onClick={() => sf('type')(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${filters.type === t ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>
              {t || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : opportunities.length === 0 ? (
        <Empty title="No opportunities found" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {opportunities.map((opp) => (
              <Link key={opp.id} to={`/opportunities/${opp.slug}`}>
                <Card className="p-5 h-full hover:border-indigo-500/30 transition-all flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge color={typeColors[opp.type] || 'blue'}>{opp.type}</Badge>
                    {opp.is_featured && <Badge color="yellow">Featured</Badge>}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-2 flex-1">{opp.title}</h3>
                  {opp.University && <p className="text-xs text-slate-500 mb-2">🎓 {opp.University.name}</p>}
                  <p className="text-xs text-slate-400 mb-3">{truncate(opp.description, 90)}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/[0.06]">
                    {opp.deadline ? (
                      <span className="text-amber-400">Deadline: {formatDate(opp.deadline)}</span>
                    ) : <span>No deadline</span>}
                    <span className="text-indigo-400">View →</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages}
            onNext={() => setPage((p) => p + 1)}
            onPrev={() => setPage((p) => p - 1)}
            onPage={setPage} />
        </>
      )}
    </div>
  );
}

// ── OpportunityDetail ─────────────────────────────────────────────────────────
export function OpportunityDetail() {
  const { useParams } = require('react-router-dom');
  const { slug }  = useParams();
  const [opp,     setOpp]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    opportunityApi.getBySlug(slug)
      .then((res) => setOpp(res.data.opportunity))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!opp)    return <div className="text-center py-32 text-slate-400">Opportunity not found.</div>;

  const typeColors = { scholarship: 'green', internship: 'blue', job: 'purple', competition: 'yellow', grant: 'emerald', exchange: 'violet' };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/opportunities" className="text-sm text-slate-400 hover:text-indigo-400 mb-6 inline-block">← Back to Opportunities</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <div className="flex gap-2 mb-3">
              <Badge color={typeColors[opp.type] || 'blue'}>{opp.type}</Badge>
              {opp.is_featured && <Badge color="yellow">Featured</Badge>}
            </div>
            <h1 className="text-xl font-bold text-white mb-3">{opp.title}</h1>
            {opp.University && (
              <Link to={`/universities/${opp.University.slug}`} className="text-sm text-indigo-400 hover:underline mb-4 inline-block">
                🎓 {opp.University.name}
              </Link>
            )}
            <p className="text-sm text-slate-400 leading-relaxed">{opp.description}</p>
          </Card>

          {opp.requirements && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Requirements</h3>
              <p className="text-sm text-slate-400 whitespace-pre-line">{opp.requirements}</p>
            </Card>
          )}

          {opp.benefits && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Benefits</h3>
              <p className="text-sm text-slate-400 whitespace-pre-line">{opp.benefits}</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            {opp.deadline && (
              <div className="text-center py-3 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-400 font-medium">Deadline</p>
                <p className="text-white font-semibold">{formatDate(opp.deadline)}</p>
              </div>
            )}
            <Button className="w-full justify-center">Apply Now</Button>
          </Card>

          <Card className="p-4 text-sm space-y-2.5">
            {[
              ['Type',       opp.type],
              ['Eligibility',opp.eligibility],
              ['Country',    opp.country],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-slate-400">{k}</span>
                <span className="text-slate-200 capitalize">{v}</span>
              </div>
            ))}
          </Card>

          {opp.Tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {opp.Tags.map((tag) => (
                <span key={tag.id} className="px-2 py-1 rounded-lg bg-white/5 text-xs text-slate-400">{tag.name}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
