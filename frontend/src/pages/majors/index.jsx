import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { majorApi } from '@/api';

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
);

const Spinner = () => (
  <div style={{ width:36, height:36, border:'3px solid rgba(99,102,241,0.2)', borderTop:'3px solid #6366f1', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
);

const DEMAND = {
  low:       { label:'Low',       color:'#94a3b8', pct: 25 },
  medium:    { label:'Medium',    color:'#f59e0b', pct: 50 },
  high:      { label:'High',      color:'#10b981', pct: 75 },
  very_high: { label:'Very High', color:'#6366f1', pct:100 },
};

const DemandBar = ({ demand }) => {
  const d = DEMAND[demand] || DEMAND.medium;
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:11, color:'#64748b' }}>Job Demand</span>
        <span style={{ fontSize:11, fontWeight:600, color: d.color }}>{d.label}</span>
      </div>
      <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${d.pct}%`, background: d.color, borderRadius:4, transition:'width 0.6s ease' }} />
      </div>
    </div>
  );
};

const Badge = ({ children, color = 'indigo' }) => {
  const colors = {
    indigo: { bg:'rgba(99,102,241,0.12)',   border:'rgba(99,102,241,0.25)',  text:'#a5b4fc' },
    blue:   { bg:'rgba(59,130,246,0.12)',   border:'rgba(59,130,246,0.25)',  text:'#93c5fd' },
    amber:  { bg:'rgba(245,158,11,0.12)',   border:'rgba(245,158,11,0.25)', text:'#fcd34d' },
    green:  { bg:'rgba(16,185,129,0.12)',   border:'rgba(16,185,129,0.25)', text:'#6ee7b7' },
    purple: { bg:'rgba(139,92,246,0.12)',   border:'rgba(139,92,246,0.25)', text:'#c4b5fd' },
  };
  const c = colors[color] || colors.indigo;
  return (
    <span style={{ padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:600, background:c.bg, border:`1px solid ${c.border}`, color:c.text, letterSpacing:'0.03em' }}>
      {children}
    </span>
  );
};

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:16, ...style,
    cursor: onClick ? 'pointer' : 'default',
    transition:'border-color 0.2s, background 0.2s',
  }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, variant='primary', size='md', disabled, loading, style={} }) => {
  const base = { border:'none', borderRadius:10, fontWeight:600, cursor: disabled||loading ? 'not-allowed':'pointer', display:'inline-flex', alignItems:'center', gap:6, transition:'all 0.15s', fontFamily:"'DM Sans',sans-serif", opacity: disabled||loading ? 0.5 : 1 };
  const sizes = { sm:{ padding:'7px 14px', fontSize:12 }, md:{ padding:'10px 20px', fontSize:13 }, lg:{ padding:'13px 28px', fontSize:14 } };
  const variants = {
    primary:   { background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', boxShadow:'0 4px 20px rgba(99,102,241,0.3)' },
    secondary: { background:'rgba(255,255,255,0.06)', color:'#cbd5e1', border:'1px solid rgba(255,255,255,0.12)' },
    ghost:     { background:'transparent', color:'#64748b' },
  };
  return (
    <button onClick={onClick} disabled={disabled||loading} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {loading && <Spinner />}
      {children}
    </button>
  );
};

const formatSalary = n => n ? `$${n >= 1000 ? (n/1000).toFixed(0)+'k' : n}` : null;

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  * { box-sizing:border-box; }
`;

const PAGE = { minHeight:'100vh', background:'#080c14', fontFamily:"'DM Sans',sans-serif", color:'#cbd5e1', padding:'40px 24px' };
const CENTER = { display:'flex', alignItems:'center', justifyContent:'center', minHeight:300 };

const FIELDS = ['All','Technology','Business','Medicine','Engineering','Law','Education','Arts','Science','Social Science'];

// ─────────────────────────────────────────────────────────────────────────────
// MajorCard
// ─────────────────────────────────────────────────────────────────────────────
const MajorCard = ({ major }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link to={`/majors/${major.slug}`} style={{ textDecoration:'none' }}>
      <Card
        style={{ padding:20, height:'100%', borderColor: hov ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)', background: hov ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)' }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      >
        {/* Top row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(99,102,241,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, transition:'background 0.2s', ...(hov && { background:'rgba(99,102,241,0.22)' }) }}>
            {major.icon || '📚'}
          </div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', justifyContent:'flex-end' }}>
            {major.is_stem     && <Badge color="blue">STEM</Badge>}
            {major.is_featured && <Badge color="amber">Featured</Badge>}
          </div>
        </div>

        {/* Name */}
        <p style={{ fontSize:14, fontWeight:700, color: hov ? '#a5b4fc' : '#f1f5f9', margin:'0 0 2px', transition:'color 0.2s' }}>{major.name}</p>
        {major.name_km && <p style={{ fontSize:11, color:'#475569', margin:'0 0 8px' }}>{major.name_km}</p>}
        <p style={{ fontSize:12, color:'#64748b', marginBottom:14, lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {major.description}
        </p>

        {/* Stats */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:12, display:'flex', flexDirection:'column', gap:10 }}>
          {major.average_salary && (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ color:'#64748b' }}>Avg. Salary</span>
              <span style={{ color:'#34d399', fontWeight:700 }}>{formatSalary(major.average_salary)}/yr</span>
            </div>
          )}
          {major.job_demand && <DemandBar demand={major.job_demand} />}
        </div>
      </Card>
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MajorsPage — listing + search + filters
// ─────────────────────────────────────────────────────────────────────────────
export function MajorsPage() {
  const [majors,   setMajors]   = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [field,    setField]    = useState('All');
  const [stemOnly, setStemOnly] = useState(false);

  useEffect(() => {
    Promise.all([majorApi.list(), majorApi.getFeatured()])
      .then(([all, feat]) => {
        setMajors(all.data?.majors   || all.data?.data   || []);
        setFeatured(feat.data?.majors || feat.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = majors.filter(m => {
    if (search   && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (field !== 'All' && m.field_of_study !== field) return false;
    if (stemOnly && !m.is_stem) return false;
    return true;
  });

  return (
    <>
      <style>{STYLES}</style>
      <div style={PAGE}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom:36, animation:'fadeUp 0.4s ease-out' }}>
            <h1 style={{ fontSize:32, fontWeight:800, color:'#f1f5f9', margin:'0 0 6px', fontFamily:"sans-serif" }}>Explore Majors</h1>
            <p style={{ fontSize:14, color:'#64748b', margin:0 }}>Discover the right field of study for your career goals</p>
          </div>

          {/* Quiz CTA */}
          <div style={{ marginBottom:36, padding:'20px 24px', borderRadius:16, background:'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))', border:'1px solid rgba(99,102,241,0.2)', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', margin:'0 0 4px' }}>🎯 Not sure which major suits you?</p>
              <p style={{ fontSize:13, color:'#64748b', margin:0 }}>Take our quiz and get personalized major recommendations.</p>
            </div>
            <Link to="/majors/quiz"><Btn>Take the Quiz →</Btn></Link>
          </div>

          {/* Featured */}
          {featured.length > 0 && (
            <div style={{ marginBottom:40 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#475569', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:14 }}>⭐ Featured Majors</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
                {featured.slice(0, 4).map(m => <MajorCard key={m.id} major={m} />)}
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{ marginBottom:24, display:'flex', flexWrap:'wrap', gap:10, alignItems:'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search majors..."
              style={{ padding:'9px 14px', background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#f1f5f9', fontSize:13, outline:'none', minWidth:220, fontFamily:",sans-serif" }} />

            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {FIELDS.map(f => (
                <button key={f} onClick={() => setField(f)} style={{
                  padding:'6px 12px', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer', border:'1px solid', transition:'all 0.15s', fontFamily:",sans-serif",
                  background: field === f ? '#6366f1' : 'rgba(255,255,255,0.04)',
                  borderColor: field === f ? '#6366f1' : 'rgba(255,255,255,0.1)',
                  color: field === f ? '#fff' : '#94a3b8',
                }}>
                  {f}
                </button>
              ))}
            </div>

            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginLeft:'auto' }}>
              <div onClick={() => setStemOnly(p => !p)} style={{
                width:18, height:18, borderRadius:5, border:`1.5px solid ${stemOnly ? '#6366f1' : 'rgba(255,255,255,0.2)'}`,
                background: stemOnly ? '#6366f1' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
              }}>
                {stemOnly && <Icon d="M20 6L9 17l-5-5" size={11} className="" style={{ color:'#fff' }} />}
              </div>
              <span style={{ fontSize:13, color:'#94a3b8' }}>STEM only</span>
            </label>
          </div>

          {/* Results */}
          {loading ? (
            <div style={CENTER}><Spinner /></div>
          ) : filtered.length === 0 ? (
            <div style={{ ...CENTER, flexDirection:'column', gap:8 }}>
              <span style={{ fontSize:32 }}>🔍</span>
              <p style={{ color:'#475569', fontSize:14 }}>No majors found. Try different filters.</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize:11, color:'#475569', marginBottom:14 }}>{filtered.length} majors found</p>
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

// ─────────────────────────────────────────────────────────────────────────────
// MajorDetail
// ─────────────────────────────────────────────────────────────────────────────
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
  if (!major)  return <><style>{STYLES}</style><div style={{ ...PAGE, ...CENTER, color:'#475569' }}>Major not found.</div></>;

  const demand = DEMAND[major.job_demand];

  // Deduplicate universities from programs
  const universities = [...new Map(
    (major.Programs || []).filter(p => p.University).map(p => [p.University.id, p.University])
  ).values()];

  return (
    <>
      <style>{STYLES}</style>
      <div style={PAGE}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>

          <Link to="/majors" style={{ textDecoration:'none', color:'#64748b', fontSize:13, display:'inline-flex', alignItems:'center', gap:6, marginBottom:28, transition:'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color='#818cf8'} onMouseLeave={e => e.currentTarget.style.color='#64748b'}>
            ← Back to Majors
          </Link>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>

            {/* ── Main ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Hero */}
              <Card style={{ padding:24 }}>
                <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
                  <div style={{ width:60, height:60, borderRadius:18, background:'rgba(99,102,241,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 }}>
                    {major.icon || '📚'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                      {major.is_stem        && <Badge color="blue">STEM</Badge>}
                      {major.is_featured    && <Badge color="amber">Featured</Badge>}
                      {major.field_of_study && <Badge color="purple">{major.field_of_study}</Badge>}
                    </div>
                    <h1 style={{ fontSize:24, fontWeight:800, color:'#f1f5f9', margin:'0 0 4px', fontFamily:"'sans-serif" }}>{major.name}</h1>
                    {major.name_km && <p style={{ fontSize:13, color:'#475569', margin:0 }}>{major.name_km}</p>}
                  </div>
                </div>
                {major.description && (
                  <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.8, marginTop:18, paddingTop:18, borderTop:'1px solid rgba(255,255,255,0.06)', marginBottom:0 }}>
                    {major.description}
                  </p>
                )}
              </Card>

              {/* Career Paths */}
              {major.career_paths?.length > 0 && (
                <Card style={{ padding:20 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ color:'#818cf8' }}>💼</span> Career Paths
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {major.career_paths.map(c => (
                      <span key={c} style={{ padding:'6px 12px', borderRadius:8, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', fontSize:12, color:'#a5b4fc', fontWeight:500 }}>{c}</span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Skills */}
              {major.skills_gained?.length > 0 && (
                <Card style={{ padding:20 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ color:'#fbbf24' }}>⚡</span> Skills You'll Gain
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {major.skills_gained.map(s => (
                      <span key={s} style={{ padding:'6px 12px', borderRadius:8, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', fontSize:12, color:'#fcd34d', fontWeight:500 }}>{s}</span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Programs */}
              {major.Programs?.length > 0 && (
                <Card style={{ padding:20 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ color:'#34d399' }}>🎓</span> Programs Offering This Major
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {major.Programs.map(prog => (
                      <div key={prog.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <Badge color="blue">{prog.degree_level}</Badge>
                          <div>
                            <p style={{ fontSize:13, color:'#e2e8f0', margin:'0 0 2px', fontWeight:500 }}>{prog.name}</p>
                            {prog.University && (
                              <Link to={`/universities/${prog.University.slug}`} style={{ fontSize:11, color:'#818cf8', textDecoration:'none' }}>
                                {prog.University.name}
                              </Link>
                            )}
                          </div>
                        </div>
                        {prog.duration_years && <span style={{ fontSize:11, color:'#475569' }}>{prog.duration_years} yrs</span>}
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
                <p style={{ fontSize:12, fontWeight:700, color:'#e2e8f0', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.08em' }}>Overview</p>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {major.average_salary && (
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                      <span style={{ color:'#64748b' }}>Avg. Salary</span>
                      <span style={{ color:'#34d399', fontWeight:700 }}>{formatSalary(major.average_salary)}/yr</span>
                    </div>
                  )}
                  {demand && (
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13 }}>
                        <span style={{ color:'#64748b' }}>Job Demand</span>
                        <span style={{ fontWeight:700, color:demand.color }}>{demand.label}</span>
                      </div>
                      <div style={{ height:6, background:'rgba(255,255,255,0.08)', borderRadius:4 }}>
                        <div style={{ height:'100%', width:`${demand.pct}%`, background:demand.color, borderRadius:4, transition:'width 0.6s ease' }} />
                      </div>
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                    <span style={{ color:'#64748b' }}>STEM</span>
                    <span style={{ color: major.is_stem ? '#93c5fd' : '#475569', fontWeight:600 }}>{major.is_stem ? 'Yes ✓' : 'No'}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                    <span style={{ color:'#64748b' }}>Field</span>
                    <span style={{ color:'#e2e8f0' }}>{major.field_of_study || '—'}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                    <span style={{ color:'#64748b' }}>Programs</span>
                    <span style={{ color:'#e2e8f0', fontWeight:600 }}>{major.Programs?.length || 0}</span>
                  </div>
                </div>
              </Card>

              {/* Related universities */}
              {universities.length > 0 && (
                <Card style={{ padding:18 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:'#e2e8f0', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.08em' }}>Universities Offering This</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {universities.slice(0, 5).map(uni => (
                      <Link key={uni.id} to={`/universities/${uni.slug}`} style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <div style={{ width:28, height:28, borderRadius:8, background:'rgba(99,102,241,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🎓</div>
                        <span style={{ fontSize:12, color:'#94a3b8' }}>{uni.name}</span>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Related majors */}
              {major.related_majors?.length > 0 && (
                <Card style={{ padding:18 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:'#e2e8f0', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.08em' }}>Related Majors</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {major.related_majors.map(m => (
                      <span key={m} style={{ padding:'5px 10px', borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', fontSize:11, color:'#94a3b8' }}>{m}</span>
                    ))}
                  </div>
                </Card>
              )}

              {/* CTA */}
              <div style={{ padding:16, borderRadius:14, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', textAlign:'center' }}>
                <p style={{ fontSize:12, color:'#64748b', marginBottom:10 }}>Find universities offering {major.name}</p>
                <Link to={`/universities?major=${major.slug}`} style={{ textDecoration:'none' }}>
                  <Btn style={{ width:'100%', justifyContent:'center' }}>Browse Universities</Btn>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MajorQuiz
// ─────────────────────────────────────────────────────────────────────────────
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

  const total    = questions.length;
  const current  = questions[step];
  const isLast   = step === total - 1;
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

          <Link to="/majors" style={{ textDecoration:'none', color:'#64748b', fontSize:13, display:'inline-flex', alignItems:'center', gap:6, marginBottom:28, transition:'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color='#818cf8'} onMouseLeave={e => e.currentTarget.style.color='#64748b'}>
            ← Back to Majors
          </Link>

          {results ? (
            /* ── Results ── */
            <div style={{ animation:'fadeUp 0.4s ease-out' }}>
              <div style={{ textAlign:'center', marginBottom:32 }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🎯</div>
                <h1 style={{ fontSize:26, fontWeight:800, color:'#f1f5f9', margin:'0 0 8px', fontFamily:"sans-serif" }}>Your Recommended Majors</h1>
                <p style={{ fontSize:13, color:'#64748b' }}>Based on your answers, here are your best matches</p>
              </div>

              {results.length === 0 ? (
                <div style={{ ...CENTER, flexDirection:'column', gap:8 }}>
                  <span style={{ fontSize:32 }}>😅</span>
                  <p style={{ color:'#475569', fontSize:14 }}>No matches found. Try again!</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
                  {results.map((m, i) => (
                    <Card key={m.id} style={{ padding:18, display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ fontSize:28, width:48, height:48, borderRadius:14, background:'rgba(99,102,241,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {m.icon || '📚'}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                          <span style={{ fontSize:11, fontWeight:700, color:'#818cf8' }}>#{i + 1}</span>
                          <span style={{ fontSize:14, fontWeight:700, color:'#f1f5f9' }}>{m.name}</span>
                          {m.is_stem && <Badge color="blue">STEM</Badge>}
                        </div>
                        <p style={{ fontSize:12, color:'#64748b', margin:'0 0 6px', lineHeight:1.5 }}>
                          {m.description?.slice(0, 80)}{m.description?.length > 80 ? '...' : ''}
                        </p>
                        <div style={{ display:'flex', gap:12, fontSize:11 }}>
                          {m.average_salary && <span style={{ color:'#34d399', fontWeight:600 }}>{formatSalary(m.average_salary)}/yr</span>}
                          {m.job_demand     && <span style={{ color: DEMAND[m.job_demand]?.color }}>{DEMAND[m.job_demand]?.label} demand</span>}
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
                <h1 style={{ fontSize:26, fontWeight:800, color:'#f1f5f9', margin:'0 0 8px', fontFamily:"sans-serif" }}>Find Your Perfect Major</h1>
                <p style={{ fontSize:13, color:'#64748b' }}>Answer {total} quick questions for personalized recommendations</p>
              </div>

              {/* Progress */}
              <div style={{ marginBottom:28 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#64748b', marginBottom:8 }}>
                  <span>Question {Math.min(step + 1, total)} of {total}</span>
                  <span>{Math.round(progress)}% done</span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'linear-gradient(90deg,#6366f1,#818cf8)', borderRadius:4, width:`${progress}%`, transition:'width 0.4s ease' }} />
                </div>
              </div>

              {/* Step dots */}
              <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:28 }}>
                {questions.map((_, i) => (
                  <div key={i} style={{
                    height:6, borderRadius:4, transition:'all 0.3s',
                    width: i === step ? 24 : 6,
                    background: i < step ? '#6366f1' : i === step ? '#818cf8' : 'rgba(255,255,255,0.12)',
                  }} />
                ))}
              </div>

              {/* Question */}
              {current && (
                <div>
                  <Card style={{ padding:24, marginBottom:14 }}>
                    <h2 style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', marginBottom:20, lineHeight:1.6 }}>
                      {current.question}
                    </h2>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {(current.options || []).map((opt, i) => {
                        const sel = answers[current.id] === opt.value;
                        return (
                          <button key={i} onClick={() => pick(current.id, opt.value)}
                            style={{
                              width:'100%', textAlign:'left', padding:'12px 16px', borderRadius:10, fontSize:13, fontWeight:500,
                              cursor:'pointer', transition:'all 0.15s', fontFamily:"sans-serif",
                              background: sel ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.03)',
                              border: `1.5px solid ${sel ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                              color: sel ? '#a5b4fc' : '#cbd5e1',
                            }}
                            onMouseEnter={e => { if (!sel) { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.16)'; } }}
                            onMouseLeave={e => { if (!sel) { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; } }}>
                            <span style={{ marginRight:10, color: sel ? '#818cf8' : '#475569', fontWeight:700 }}>
                              {String.fromCharCode(65 + i)}.
                            </span>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Nav buttons */}
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
