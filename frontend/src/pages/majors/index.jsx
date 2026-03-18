import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { majorApi } from '@/api';

// ── Shared helpers ────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Spinner = () => (
  <div style={{ width:32, height:32, border:'3px solid #e2e8f0', borderTop:'3px solid #1B3A6B', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
);

const DEMAND = {
  low:       { label:'Low',       color:'#94a3b8', bg:'#f8fafc', pct:25  },
  medium:    { label:'Medium',    color:'#d97706', bg:'#fefce8', pct:50  },
  high:      { label:'High',      color:'#16a34a', bg:'#f0fdf4', pct:75  },
  very_high: { label:'Very High', color:'#1B3A6B', bg:'#eff6ff', pct:100 },
};

const DemandBar = ({ demand }) => {
  const d = DEMAND[demand] || DEMAND.medium;
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
        <span style={{ fontSize:11, color:'#64748b', fontWeight:500 }}>Job Demand</span>
        <span style={{ fontSize:11, fontWeight:700, color:d.color, background:d.bg, padding:'1px 6px', borderRadius:6 }}>{d.label}</span>
      </div>
      <div style={{ height:5, background:'#e2e8f0', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${d.pct}%`, background:d.color, borderRadius:4, transition:'width 0.6s ease' }} />
      </div>
    </div>
  );
};

const Badge = ({ children, color = 'navy' }) => {
  const map = {
    navy:   { bg:'#eff6ff', border:'#bfdbfe', text:'#1d4ed8' },
    orange: { bg:'#fff7ed', border:'#fed7aa', text:'#c2410c' },
    green:  { bg:'#f0fdf4', border:'#bbf7d0', text:'#15803d' },
    sky:    { bg:'#f0f9ff', border:'#bae6fd', text:'#0369a1' },
    purple: { bg:'#faf5ff', border:'#e9d5ff', text:'#7c3aed' },
    amber:  { bg:'#fefce8', border:'#fef08a', text:'#a16207' },
  };
  const c = map[color] || map.navy;
  return (
    <span style={{ padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:700, background:c.bg, border:`1px solid ${c.border}`, color:c.text, letterSpacing:'0.03em', whiteSpace:'nowrap' }}>
      {children}
    </span>
  );
};

const Card = ({ children, style = {}, hover = false }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background:'#fff', border:`1px solid ${hov ? '#cbd5e1' : '#e2e8f0'}`,
        borderRadius:16, boxShadow: hov ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition:'all 0.2s', ...style,
      }}>
      {children}
    </div>
  );
};

const Btn = ({ children, onClick, variant='primary', size='md', disabled, loading, style={}, type }) => {
  const base = { border:'none', borderRadius:10, fontWeight:600, cursor:disabled||loading?'not-allowed':'pointer', display:'inline-flex', alignItems:'center', gap:6, transition:'all 0.15s', fontFamily:"'DM Sans',sans-serif", opacity:disabled||loading?0.55:1 };
  const sizes = { sm:{padding:'7px 14px',fontSize:12}, md:{padding:'10px 20px',fontSize:13}, lg:{padding:'13px 28px',fontSize:14} };
  const variants = {
    primary:   { background:'#1B3A6B', color:'#fff', boxShadow:'0 2px 12px rgba(27,58,107,0.25)' },
    orange:    { background:'#F47B20', color:'#fff', boxShadow:'0 2px 12px rgba(244,123,32,0.25)' },
    secondary: { background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0' },
    ghost:     { background:'transparent', color:'#64748b' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {loading && <Spinner />}
      {children}
    </button>
  );
};

const formatSalary = n => n ? `$${n >= 1000 ? (n/1000).toFixed(0)+'k' : n}` : null;
const DEMAND_OPTIONS = ['all', 'very_high', 'high', 'medium', 'low'];

const STYLES = `
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  * { box-sizing:border-box; }
`;

const PAGE   = { minHeight:'100vh', background:'#f8fafc', fontFamily:"'DM Sans',sans-serif", color:'#334155', padding:'40px 24px' };
const CENTER = { display:'flex', alignItems:'center', justifyContent:'center', minHeight:300 };

// ── MajorCard ─────────────────────────────────────────────────────────────────
const MajorCard = ({ major }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link to={`/majors/${major.slug}`} style={{ textDecoration:'none', display:'block', height:'100%' }}>
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ background:'#fff', border:`1px solid ${hov ? '#1B3A6B30' : '#e2e8f0'}`, borderRadius:16, padding:20, height:'100%', boxShadow: hov ? '0 8px 24px rgba(27,58,107,0.1)' : '0 1px 4px rgba(0,0,0,0.04)', transform: hov ? 'translateY(-2px)' : 'none', transition:'all 0.2s' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div style={{ width:46, height:46, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, transition:'background 0.2s', background: hov ? '#1B3A6B12' : '#f8fafc', border:'1px solid #e2e8f0' }}>
            {major.icon || '📚'}
          </div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', justifyContent:'flex-end' }}>
            {major.is_stem     && <Badge color="sky">STEM</Badge>}
            {major.is_featured && <Badge color="amber">Featured</Badge>}
          </div>
        </div>

        <p style={{ fontSize:14, fontWeight:700, color: hov ? '#1B3A6B' : '#1e293b', margin:'0 0 2px', transition:'color 0.2s' }}>{major.name}</p>
        {major.name_km && <p style={{ fontSize:11, color:'#94a3b8', margin:'0 0 8px' }}>{major.name_km}</p>}
        <p style={{ fontSize:12, color:'#64748b', marginBottom:14, lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {major.description}
        </p>

        <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:12, display:'flex', flexDirection:'column', gap:10 }}>
          {major.average_salary && (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ color:'#64748b' }}>Avg. Salary</span>
              <span style={{ color:'#16a34a', fontWeight:700 }}>{formatSalary(major.average_salary)}/yr</span>
            </div>
          )}
          {major.job_demand && <DemandBar demand={major.job_demand} />}
        </div>
      </div>
    </Link>
  );
};

// ── MajorsPage ────────────────────────────────────────────────────────────────
export function MajorsPage() {
  const [majors,   setMajors]   = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [field,    setField]    = useState('All');
  const [stemOnly, setStemOnly] = useState(false);
  const [demand,   setDemand]   = useState('all');
  const [demandOpen, setDemandOpen] = useState(false);

  useEffect(() => {
    Promise.all([majorApi.list({ page: 1, limit: 1000 }), majorApi.getFeatured()])
      .then(([all, feat]) => {
        setMajors(all.data?.majors   || all.data?.data   || []);
        setFeatured(feat.data?.majors || feat.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fields = ['All', ...Array.from(new Set(
    majors
      .map((major) => major.field_of_study)
      .filter(Boolean)
  )).sort((a, b) => a.localeCompare(b))];

  const filtered = majors.filter(m => {
    const query = search.trim().toLowerCase();
    if (
      query &&
      ![
        m.name,
        m.name_km,
        m.description,
        m.field_of_study,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    ) return false;
    if (field !== 'All' && m.field_of_study !== field) return false;
    if (stemOnly && !m.is_stem) return false;
    if (demand !== 'all' && m.job_demand !== demand) return false;
    return true;
  });

  const activeFilters = [
    search.trim() ? 'search' : null,
    field !== 'All' ? 'field' : null,
    stemOnly ? 'stem' : null,
    demand !== 'all' ? 'demand' : null,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch('');
    setField('All');
    setStemOnly(false);
    setDemand('all');
    setDemandOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setDemandOpen(false);
    if (!demandOpen) return undefined;
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [demandOpen]);

  return (
    <>
      <style>{STYLES}</style>
      <div style={PAGE}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom:32, animation:'fadeUp 0.4s ease-out' }}>
            <h1 style={{ fontSize:30, fontWeight:800, color:'#0f172a', margin:'0 0 6px', fontFamily:"'Syne',sans-serif" }}>Explore Majors</h1>
            <p style={{ fontSize:14, color:'#64748b', margin:0 }}>Discover the right field of study for your career goals</p>
          </div>

          {/* Quiz CTA banner */}
          <div style={{ marginBottom:32, padding:'20px 24px', borderRadius:16, background:'linear-gradient(135deg, #1B3A6B, #2d5fa8)', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12, boxShadow:'0 4px 20px rgba(27,58,107,0.2)' }}>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:'#fff', margin:'0 0 4px' }}>🎯 Not sure which major suits you?</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', margin:0 }}>Take our quiz and get personalized major recommendations.</p>
            </div>
            <Link to="/majors/quiz"><Btn variant="orange">Take the Quiz →</Btn></Link>
          </div>

          {/* Featured */}
          {featured.length > 0 && (
            <div style={{ marginBottom:36 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:14 }}>⭐ Featured Majors</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
                {featured.slice(0, 4).map(m => <MajorCard key={m.id} major={m} />)}
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{ marginBottom:22, display:'flex', flexDirection:'column', gap:12 }}>
            {/* Search */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'center' }}>
              <div style={{ position:'relative', minWidth:240, flex:'1 1 260px' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }}>
                  <Icon d="M21 21l-4.35-4.35 M11 19a8 8 0 100-16 8 8 0 000 16z" size={15} />
                </span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search majors, fields, or keywords..."
                  style={{ paddingLeft:34, paddingRight:12, paddingTop:10, paddingBottom:10, background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, color:'#334155', fontSize:13, outline:'none', width:'100%', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }} />
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <div onClick={() => setStemOnly(p => !p)} style={{
                    width:18, height:18, borderRadius:5, border:`2px solid ${stemOnly ? '#1B3A6B' : '#cbd5e1'}`,
                    background: stemOnly ? '#1B3A6B' : '#fff', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                  }}>
                    {stemOnly && <Icon d="M20 6L9 17l-5-5" size={11} />}
                  </div>
                  <span style={{ fontSize:13, color:'#475569', fontWeight:500 }}>STEM only</span>
                </label>

                <Btn
                  variant="secondary"
                  size="sm"
                  onClick={resetFilters}
                  disabled={activeFilters === 0}
                >
                  Clear filters
                </Btn>
              </div>
            </div>

            {/* Field filters */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {fields.map(f => (
                <button key={f} onClick={() => setField(f)} style={{
                  padding:'7px 14px', borderRadius:999, fontSize:12, fontWeight:600, cursor:'pointer', border:'1px solid', transition:'all 0.15s', fontFamily:"'DM Sans',sans-serif",
                  background: field === f ? '#1B3A6B' : '#fff',
                  borderColor: field === f ? '#1B3A6B' : '#e2e8f0',
                  color: field === f ? '#fff' : '#64748b',
                  boxShadow: field === f ? '0 2px 8px rgba(27,58,107,0.2)' : 'none',
                }}>
                  {f}
                </button>
              ))}
            </div>

            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'#94a3b8', letterSpacing:'0.05em', textTransform:'uppercase' }}>
                Demand
              </span>
              <div style={{ position:'relative' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDemandOpen((prev) => !prev);
                  }}
                  style={{
                    minWidth:190,
                    padding:'10px 12px',
                    borderRadius:12,
                    border:'1px solid #e2e8f0',
                    background:'#fff',
                    color:'#475569',
                    fontSize:13,
                    fontWeight:500,
                    fontFamily:"'DM Sans',sans-serif",
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'space-between',
                    gap:10,
                    boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
                    cursor:'pointer',
                  }}
                >
                  <span>
                    {demand === 'all' ? 'All demand levels' : `${DEMAND[demand]?.label} demand`}
                  </span>
                  <span style={{ color:'#94a3b8', transform: demandOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.15s ease' }}>
                    ▼
                  </span>
                </button>

                {demandOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position:'absolute',
                      top:'calc(100% + 8px)',
                      left:0,
                      minWidth:'100%',
                      background:'#fff',
                      border:'1px solid #e2e8f0',
                      borderRadius:14,
                      boxShadow:'0 18px 40px rgba(15,23,42,0.14)',
                      padding:8,
                      zIndex:20,
                    }}
                  >
                    {DEMAND_OPTIONS.map((option) => {
                      const active = demand === option;
                      const tone = option === 'all' ? null : DEMAND[option];
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setDemand(option);
                            setDemandOpen(false);
                          }}
                          style={{
                            width:'100%',
                            textAlign:'left',
                            padding:'10px 12px',
                            borderRadius:10,
                            border:'none',
                            background: active ? (tone?.bg || '#eff6ff') : 'transparent',
                            color: active ? (tone?.color || '#1B3A6B') : '#475569',
                            fontSize:13,
                            fontWeight:active ? 700 : 500,
                            fontFamily:"'DM Sans',sans-serif",
                            cursor:'pointer',
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'space-between',
                          }}
                        >
                          <span>{option === 'all' ? 'All demand levels' : `${tone?.label} demand`}</span>
                          {active && <span style={{ color:tone?.color || '#1B3A6B' }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div style={CENTER}><Spinner /></div>
          ) : filtered.length === 0 ? (
            <div style={{ ...CENTER, flexDirection:'column', gap:8 }}>
              <span style={{ fontSize:32 }}>🔍</span>
              <p style={{ color:'#94a3b8', fontSize:14 }}>No majors found. Try different filters.</p>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:14 }}>
                <p style={{ fontSize:11, color:'#94a3b8', margin:0, fontWeight:500 }}>{filtered.length} majors found</p>
                {activeFilters > 0 && (
                  <p style={{ fontSize:11, color:'#94a3b8', margin:0 }}>
                    {activeFilters} active filter{activeFilters > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
                {filtered.map(m => <MajorCard key={m.id} major={m} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── MajorDetail ───────────────────────────────────────────────────────────────
export function MajorDetail() {
  const { slug }  = useParams();
  const [major,   setMajor]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    majorApi.getBySlug(slug)
      .then(res => setMajor(res.data?.major || res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <><style>{STYLES}</style><div style={{ ...PAGE, ...CENTER }}><Spinner /></div></>;
  if (!major)  return <><style>{STYLES}</style><div style={{ ...PAGE, ...CENTER, color:'#94a3b8' }}>Major not found.</div></>;

  const demand      = DEMAND[major.job_demand];
  const universities = [...new Map(
    (major.Programs || []).filter(p => p.University).map(p => [p.University.id, p.University])
  ).values()];

  return (
    <>
      <style>{STYLES}</style>
      <div style={PAGE}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>

          <Link to="/majors" style={{ textDecoration:'none', color:'#64748b', fontSize:13, display:'inline-flex', alignItems:'center', gap:6, marginBottom:28, transition:'color 0.15s', fontWeight:500 }}
            onMouseEnter={e => e.currentTarget.style.color='#1B3A6B'} onMouseLeave={e => e.currentTarget.style.color='#64748b'}>
            ← Back to Majors
          </Link>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>

            {/* ── Main ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Hero card */}
              <Card style={{ padding:24 }}>
                <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
                  <div style={{ width:60, height:60, borderRadius:18, background:'#f1f5f9', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 }}>
                    {major.icon || '📚'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                      {major.is_stem        && <Badge color="sky">STEM</Badge>}
                      {major.is_featured    && <Badge color="amber">Featured</Badge>}
                      {major.field_of_study && <Badge color="purple">{major.field_of_study}</Badge>}
                    </div>
                    <h1 style={{ fontSize:24, fontWeight:800, color:'#0f172a', margin:'0 0 4px', fontFamily:"'Syne',sans-serif" }}>{major.name}</h1>
                    {major.name_km && <p style={{ fontSize:13, color:'#94a3b8', margin:0 }}>{major.name_km}</p>}
                  </div>
                </div>
                {major.description && (
                  <p style={{ fontSize:13, color:'#475569', lineHeight:1.8, marginTop:18, paddingTop:18, borderTop:'1px solid #f1f5f9', marginBottom:0 }}>
                    {major.description}
                  </p>
                )}
              </Card>

              {/* Career Paths */}
              {major.career_paths?.length > 0 && (
                <Card style={{ padding:20 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                    💼 <span style={{ color:'#1B3A6B' }}>Career Paths</span>
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {major.career_paths.map(c => (
                      <span key={c} style={{ padding:'6px 12px', borderRadius:8, background:'#eff6ff', border:'1px solid #bfdbfe', fontSize:12, color:'#1d4ed8', fontWeight:500 }}>{c}</span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Skills */}
              {major.skills_gained?.length > 0 && (
                <Card style={{ padding:20 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                    ⚡ <span style={{ color:'#d97706' }}>Skills You'll Gain</span>
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {major.skills_gained.map(s => (
                      <span key={s} style={{ padding:'6px 12px', borderRadius:8, background:'#fefce8', border:'1px solid #fef08a', fontSize:12, color:'#a16207', fontWeight:500 }}>{s}</span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Programs */}
              {major.Programs?.length > 0 && (
                <Card style={{ padding:20 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                    🎓 <span style={{ color:'#15803d' }}>Programs Offering This Major</span>
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {major.Programs.map(prog => (
                      <div key={prog.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <Badge color="sky">{prog.degree_level}</Badge>
                          <div>
                            <p style={{ fontSize:13, color:'#1e293b', margin:'0 0 2px', fontWeight:600 }}>{prog.name}</p>
                            {prog.University && (
                              <Link to={`/universities/${prog.University.slug}`} style={{ fontSize:11, color:'#1B3A6B', textDecoration:'none', fontWeight:500 }}
                                onMouseEnter={e => e.currentTarget.style.textDecoration='underline'}
                                onMouseLeave={e => e.currentTarget.style.textDecoration='none'}>
                                {prog.University.name}
                              </Link>
                            )}
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:12, color:'#64748b' }}>
                          {prog.duration_years && <span>{prog.duration_years} yrs</span>}
                          {prog.tuition_fee    && <span style={{ fontWeight:700, color:'#15803d' }}>${prog.tuition_fee.toLocaleString()}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:14, position:'sticky', top:24 }}>

              {/* Stats */}
              <Card style={{ padding:18 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.08em' }}>Overview</p>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {major.average_salary && (
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                      <span style={{ color:'#64748b' }}>Avg. Salary</span>
                      <span style={{ color:'#16a34a', fontWeight:700 }}>{formatSalary(major.average_salary)}/yr</span>
                    </div>
                  )}
                  {demand && (
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13 }}>
                        <span style={{ color:'#64748b' }}>Job Demand</span>
                        <span style={{ fontWeight:700, color:demand.color }}>{demand.label}</span>
                      </div>
                      <div style={{ height:5, background:'#e2e8f0', borderRadius:4 }}>
                        <div style={{ height:'100%', width:`${demand.pct}%`, background:demand.color, borderRadius:4, transition:'width 0.6s ease' }} />
                      </div>
                    </div>
                  )}
                  {[
                    ['STEM',     major.is_stem ? 'Yes ✓' : 'No', major.is_stem ? '#1d4ed8' : '#94a3b8'],
                    ['Field',    major.field_of_study || '—', '#334155'],
                    ['Programs', major.Programs?.length || 0, '#334155'],
                  ].map(([k, v, c]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:13, paddingTop:8, borderTop:'1px solid #f1f5f9' }}>
                      <span style={{ color:'#64748b' }}>{k}</span>
                      <span style={{ fontWeight:600, color:c }}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Universities */}
              {universities.length > 0 && (
                <Card style={{ padding:18 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.08em' }}>Universities Offering This</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {universities.slice(0, 5).map(uni => (
                      <Link key={uni.id} to={`/universities/${uni.slug}`} style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <div style={{ width:28, height:28, borderRadius:8, background:'#eff6ff', border:'1px solid #bfdbfe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>🏛️</div>
                        <span style={{ fontSize:12, color:'#475569', fontWeight:500 }}>{uni.name}</span>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Related majors */}
              {major.related_majors?.length > 0 && (
                <Card style={{ padding:18 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.08em' }}>Related Majors</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {major.related_majors.map(m => (
                      <span key={m} style={{ padding:'5px 10px', borderRadius:7, background:'#f1f5f9', border:'1px solid #e2e8f0', fontSize:11, color:'#475569', fontWeight:500 }}>{m}</span>
                    ))}
                  </div>
                </Card>
              )}

              {/* CTA */}
              <div style={{ padding:16, borderRadius:14, background:'linear-gradient(135deg,#1B3A6B,#2d5fa8)', textAlign:'center', boxShadow:'0 4px 16px rgba(27,58,107,0.2)' }}>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.7)', marginBottom:10 }}>Find universities offering {major.name}</p>
                <Link to={`/universities?major=${major.slug}`} style={{ textDecoration:'none' }}>
                  <Btn variant="orange" style={{ width:'100%', justifyContent:'center' }}>Browse Universities</Btn>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── MajorQuiz ─────────────────────────────────────────────────────────────────
export function MajorQuiz() {
  const navigate          = useNavigate();
  const [questions,  setQuestions]  = useState([]);
  const [answers,    setAnswers]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results,    setResults]    = useState(null);
  const [step,       setStep]       = useState(0);

  useEffect(() => {
    majorApi.getQuizQuestions()
      .then(res => setQuestions(res.data?.questions || res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total   = questions.length;
  const current = questions[step];
  const isLast  = step === total - 1;
  const answered = Object.keys(answers).length;
  const progress = total > 0 ? (step / total) * 100 : 0;

  const pick = (qId, val) => {
    setAnswers(p => ({ ...p, [qId]: val }));
    if (!isLast) setTimeout(() => setStep(p => p + 1), 280);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await majorApi.getRecommendations({ answers });
      setResults(res.data?.recommendations || res.data?.data || []);
    } catch { setResults([]); }
    finally  { setSubmitting(false); }
  };

  const reset = () => { setResults(null); setAnswers({}); setStep(0); };

  if (loading) return <><style>{STYLES}</style><div style={{ ...PAGE, ...CENTER }}><Spinner /></div></>;

  return (
    <>
      <style>{STYLES}</style>
      <div style={PAGE}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>

          <Link to="/majors" style={{ textDecoration:'none', color:'#64748b', fontSize:13, display:'inline-flex', alignItems:'center', gap:6, marginBottom:28, transition:'color 0.15s', fontWeight:500 }}
            onMouseEnter={e => e.currentTarget.style.color='#1B3A6B'} onMouseLeave={e => e.currentTarget.style.color='#64748b'}>
            ← Back to Majors
          </Link>

          {results ? (
            /* ── Results ── */
            <div style={{ animation:'fadeUp 0.4s ease-out' }}>
              <div style={{ textAlign:'center', marginBottom:32 }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🎯</div>
                <h1 style={{ fontSize:26, fontWeight:800, color:'#0f172a', margin:'0 0 8px', fontFamily:"'Syne',sans-serif" }}>Your Recommended Majors</h1>
                <p style={{ fontSize:13, color:'#64748b' }}>Based on your answers, here are your best matches</p>
              </div>

              {results.length === 0 ? (
                <div style={{ ...CENTER, flexDirection:'column', gap:8 }}>
                  <span style={{ fontSize:32 }}>😅</span>
                  <p style={{ color:'#94a3b8', fontSize:14 }}>No matches found. Try again!</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
                  {results.map((m, i) => (
                    <Card key={m.id} style={{ padding:18, display:'flex', alignItems:'center', gap:14 }} hover>
                      <div style={{ fontSize:26, width:48, height:48, borderRadius:14, background:'#f1f5f9', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {m.icon || '📚'}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, flexWrap:'wrap' }}>
                          <span style={{ fontSize:11, fontWeight:700, color:'#F47B20', background:'#fff7ed', padding:'1px 6px', borderRadius:6, border:'1px solid #fed7aa' }}>#{i + 1}</span>
                          <span style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{m.name}</span>
                          {m.is_stem && <Badge color="sky">STEM</Badge>}
                        </div>
                        <p style={{ fontSize:12, color:'#64748b', margin:'0 0 6px', lineHeight:1.5 }}>
                          {m.description?.slice(0, 80)}{m.description?.length > 80 ? '...' : ''}
                        </p>
                        <div style={{ display:'flex', gap:12, fontSize:11 }}>
                          {m.average_salary && <span style={{ color:'#16a34a', fontWeight:600 }}>{formatSalary(m.average_salary)}/yr</span>}
                          {m.job_demand     && <span style={{ color:DEMAND[m.job_demand]?.color, fontWeight:600 }}>{DEMAND[m.job_demand]?.label} demand</span>}
                        </div>
                      </div>
                      <Link to={`/majors/${m.slug}`} style={{ textDecoration:'none' }}>
                        <Btn variant="secondary" size="sm">View →</Btn>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}

              <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                <Btn variant="secondary" onClick={reset}>Retake Quiz</Btn>
                <Link to="/majors" style={{ textDecoration:'none' }}><Btn>Browse All Majors</Btn></Link>
              </div>
            </div>

          ) : (
            /* ── Quiz ── */
            <div style={{ animation:'fadeUp 0.4s ease-out' }}>
              <div style={{ textAlign:'center', marginBottom:32 }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🎓</div>
                <h1 style={{ fontSize:26, fontWeight:800, color:'#0f172a', margin:'0 0 8px', fontFamily:"'Syne',sans-serif" }}>Find Your Perfect Major</h1>
                <p style={{ fontSize:13, color:'#64748b' }}>Answer {total} quick questions for personalized recommendations</p>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom:24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#94a3b8', marginBottom:8, fontWeight:500 }}>
                  <span>Question {Math.min(step + 1, total)} of {total}</span>
                  <span>{Math.round(progress)}% done</span>
                </div>
                <div style={{ height:5, background:'#e2e8f0', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'linear-gradient(90deg,#1B3A6B,#4AAEE0)', borderRadius:4, width:`${progress}%`, transition:'width 0.4s ease' }} />
                </div>
              </div>

              {/* Step dots */}
              <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:28 }}>
                {questions.map((_, i) => (
                  <div key={i} style={{
                    height:6, borderRadius:4, transition:'all 0.3s',
                    width: i === step ? 24 : 6,
                    background: i < step ? '#1B3A6B' : i === step ? '#4AAEE0' : '#e2e8f0',
                  }} />
                ))}
              </div>

              {/* Question card */}
              {current && (
                <div>
                  <Card style={{ padding:24, marginBottom:14 }}>
                    <h2 style={{ fontSize:15, fontWeight:700, color:'#0f172a', marginBottom:20, lineHeight:1.6 }}>
                      {current.question}
                    </h2>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {(current.options || []).map((opt, i) => {
                        const sel = answers[current.id] === opt.value;
                        return (
                          <button key={i} onClick={() => pick(current.id, opt.value)}
                            style={{
                              width:'100%', textAlign:'left', padding:'12px 16px', borderRadius:10, fontSize:13, fontWeight:500,
                              cursor:'pointer', transition:'all 0.15s', fontFamily:"'DM Sans',sans-serif",
                              background: sel ? '#eff6ff' : '#f8fafc',
                              border: `1.5px solid ${sel ? '#1B3A6B' : '#e2e8f0'}`,
                              color: sel ? '#1B3A6B' : '#475569',
                              boxShadow: sel ? '0 2px 8px rgba(27,58,107,0.1)' : 'none',
                            }}
                            onMouseEnter={e => { if (!sel) { e.currentTarget.style.background='#f1f5f9'; e.currentTarget.style.borderColor='#cbd5e1'; } }}
                            onMouseLeave={e => { if (!sel) { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#e2e8f0'; } }}>
                            <span style={{ marginRight:10, color: sel ? '#1B3A6B' : '#94a3b8', fontWeight:700 }}>
                              {String.fromCharCode(65 + i)}.
                            </span>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Nav */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <Btn variant="ghost" size="sm" onClick={() => setStep(p => Math.max(0, p - 1))} disabled={step === 0}>
                      ← Previous
                    </Btn>
                    {isLast ? (
                      <Btn onClick={submit} loading={submitting} disabled={answered < total}>
                        Get Recommendations 🎯
                      </Btn>
                    ) : (
                      <Btn variant="secondary" size="sm" onClick={() => setStep(p => p + 1)} disabled={!answers[current?.id]}>
                        Next →
                      </Btn>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
