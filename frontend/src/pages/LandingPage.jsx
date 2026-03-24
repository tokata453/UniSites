import { useState, useEffect, useRef } from 'react';
import { ArrowRight, BookOpen, Building2, ChevronDown, Clock3, GraduationCap, MapPin, School, Search, Star, Globe2} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { universityApi, majorApi } from '@/api';
import { TYPES } from '@/constants/filter'
import { BG_SLIDES, SCHOLARSHIPS, HOW_IT_WORKS, TESTIMONIALS, FUN_FACTS, PLACEHOLDER_MAJORS, PLACEHOLDER_UNIS, TYPE_COLORS, TYPE_BG } from '../constants/landingPage';

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, y = 24 }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : `translateY(${y}px)`, transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

function SectionHeader({ tag, title, subtitle }) {
  return (
    <div className="text-center mb-10">
      {tag && (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
          style={{ background: '#1B3A6B0f', color: '#1B3A6B' }}>{tag}</span>
      )}
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 max-w-xl mx-auto">{subtitle}</p>}
    </div>
  );
}

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

export default function LandingPage() {
  const [search, setSearch] = useState('');
  const [type,   setType]   = useState('All');
  const [typeOpen, setTypeOpen] = useState(false);
  const [slide,  setSlide]  = useState(0);
  const [featuredUnis,   setFeaturedUnis]   = useState([]);
  const [featuredMajors, setFeaturedMajors] = useState([]);
  const [uniLoading,     setUniLoading]     = useState(true);
  const [majorLoading,   setMajorLoading]   = useState(true);
  const timerRef = useRef(null);
  const typeRef  = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    universityApi.getFeatured()
      .then(r => setFeaturedUnis(r.data?.universities || r.data?.data || []))
      .catch(() => {})
      .finally(() => setUniLoading(false));
    majorApi.getFeatured()
      .then(r => setFeaturedMajors(r.data?.majors || r.data?.data || []))
      .catch(() => {})
      .finally(() => setMajorLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!typeRef.current?.contains(e.target)) setTypeOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide(p => {
        const next = (p + 1) % BG_SLIDES.length;
        return next;
      });
    }, 4500);
  };

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, []);

  const goSlide = (idx) => { setSlide(idx); startTimer(); };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/universities?search=${encodeURIComponent(search)}&type=${type !== 'All' ? type.toLowerCase() : ''}`);
  };

  return (
    <div className="bg-white">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative px-6 pt-24 pb-24 text-center overflow-hidden min-h-[520px] flex items-center">
        {/* Slider */}
        {BG_SLIDES.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${s.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === slide ? 1 : 0,
              transform: i === slide ? 'scale(1.04)' : 'scale(1)',
              filter: 'saturate(1.08) contrast(1.02) brightness(0.92)',
              transition: 'opacity 0.8s ease, transform 5s ease',
              zIndex: 0,
            }}
          />
        ))}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.56) 0%, rgba(255,255,255,0.66) 45%, rgba(255,255,255,0.84) 100%)',
          }}
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: 'radial-gradient(circle at center, rgba(27,58,107,0.06) 0%, rgba(27,58,107,0.14) 100%)',
          }}
        />
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {BG_SLIDES.map((s, i) => (
            <button key={i} onClick={() => goSlide(i)} title={s.label}
              style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, border: 'none', background: i === slide ? '#F47B20' : 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
          ))}
        </div>
        <div className="relative z-[2] max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-6"
            style={{ background: '#1B3A6B08', borderColor: '#1B3A6B25', color: '#1B3A6B' }}>
            <GraduationCap size={14} /> Discover Universities in Cambodia
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-slate-800">
            Find Your Perfect<br /><span style={{ color: '#F47B20' }}>University</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Explore universities, programs, scholarships, and opportunities across Cambodia — all in one place.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-md focus-within:border-[#1B3A6B] focus-within:ring-2 focus-within:ring-[#1B3A6B]/10 transition-all">
              <span className="text-slate-400 shrink-0"><Search size={18} /></span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search university name..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
            </div>

            {/* ── Custom type dropdown (replaces native <select>) ── */}
            <div ref={typeRef} className="relative sm:w-36 w-full" style={{ zIndex: 50 }}>
              <button
                type="button"
                onClick={() => setTypeOpen(o => !o)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 shadow-md hover:border-slate-300 transition-all"
              >
                <span>{type}</span>
                <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${typeOpen ? 'rotate-180' : ''}`} />
              </button>
              {typeOpen && (
                <div
                  className="absolute left-0 right-0 rounded-2xl border border-slate-200 bg-white p-1 shadow-lg"
                  style={{ top: 'calc(100% + 6px)', zIndex: 9999 }}
                >
                  {TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setType(t); setTypeOpen(false); }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        type === t ? 'bg-[#1B3A6B] text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      <span>{t}</span>
                      {type === t && <CheckIcon />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-md hover:opacity-90 active:scale-95 transition-all" style={{ background: '#1B3A6B' }}>
              Search
            </button>
          </form>
          <p className="mt-6 text-xs text-slate-400 font-medium tracking-wide uppercase">{BG_SLIDES[slide].label}</p>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section className="px-6 py-10 border-y border-slate-100 bg-slate-50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '50+',     label: 'Universities',    color: '#1B3A6B' },
            { value: '500+',    label: 'Programs',        color: '#4AAEE0' },
            { value: '100+',    label: 'Scholarships',    color: '#F47B20' },
            { value: '10,000+', label: 'Students Helped', color: '#3DAE6B' },
          ].map(({ value, label, color }) => (
            <div key={label}>
              <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ BROWSE BY TYPE ══════════════ */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal><SectionHeader title="Browse by Type" subtitle="Find the right university for your goals" /></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: 'public',        label: 'Public Universities',        desc: 'Government-funded institutions with affordable tuition', icon: Building2 },
              { type: 'private',       label: 'Private Universities',       desc: 'Privately funded with diverse program offerings',        icon: GraduationCap },
              { type: 'international', label: 'International Universities', desc: 'Globally accredited with international programs',         icon: Globe2 },
            ].map((item, i) => (
              <Reveal key={item.type} delay={i * 80}>
                <Link
                  to={`/universities?type=${item.type}`}
                  className="block h-full min-h-[210px] rounded-xl border p-6 transition-all hover:scale-[1.02]"
                  style={{
                    background: '#f8fafc',
                    borderColor: '#e2e8f0',
                    boxShadow: '0 10px 26px rgba(15, 23, 42, 0.06)',
                  }}
                >
                  <div className="flex h-full flex-col">
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border"
                      style={{
                        color: '#1B3A6B',
                        background: '#ffffffcc',
                        borderColor: '#dbe4f0',
                        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
                      }}
                    >
                      <item.icon size={24} strokeWidth={2.1} />
                    </div>
                    <h3 className="text-base font-semibold mb-1" style={{ color: '#1B3A6B' }}>{item.label}</h3>
                    <p className="text-sm text-slate-500 mb-4 max-w-[28ch]">{item.desc}</p>
                    <div className="mt-auto">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#1B3A6B' }}>
                        Explore <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURED UNIVERSITIES ══════════════ */}
      <section className="px-6 py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ background: '#1B3A6B10', color: '#1B3A6B' }}>Top Picks</span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Featured Universities</h2>
                <p className="text-sm text-slate-500 mt-1">Highly rated institutions trusted by thousands of students</p>
              </div>
              <Link to="/universities" className="hidden md:flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1B3A6B' }}>
                View all <ArrowRight />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(uniLoading ? PLACEHOLDER_UNIS : (featuredUnis.length > 0 ? featuredUnis : PLACEHOLDER_UNIS)).slice(0, 4).map((uni, i) => {
              const tc = uni.color || TYPE_COLORS[uni.university_type] || '#1B3A6B';
              const tbg = TYPE_BG[uni.university_type] || '#eff6ff';
              return (
                <Reveal key={uni.id || i} delay={i * 80}>
                  <Link to={`/universities/${uni.slug}`} className="group block h-full bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                    <div className="h-36 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${tc}15, ${tc}08)` }}>
                      {uni.cover_url
                        ? <img src={uni.cover_url} alt={uni.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => e.target.style.display="none"} />
                        : <div className="w-full h-full flex items-center justify-center text-slate-500">{uni.icon ? <uni.icon size={52} /> : <School size={52} />}</div>
                      }
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold capitalize"
                        style={{ background: tbg, color: tc, border: `1px solid ${tc}30` }}>
                        {uni.university_type}
                      </span>
                    </div>
                    <div className="flex min-h-[118px] flex-col p-4">
                      <div className="flex items-start gap-2.5">
                        {uni.logo_url && <img src={uni.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-100 shrink-0 mt-0.5" onError={e => e.target.style.display="none"} />}
                        <div className="min-w-0">
                          <h3 className="min-h-[44px] text-sm font-bold text-slate-800 leading-snug group-hover:text-[#1B3A6B] transition-colors line-clamp-2">{uni.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1"><MapPin size={12} /> {uni.province}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500"><BookOpen size={12} /> {uni.program_count || 0} programs</span>
                        {uni.rating_avg > 0 && <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#F47B20' }}><Star size={12} className="fill-current" /> {Number(uni.rating_avg).toFixed(1)}</span>}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={200}>
            <div className="mt-6 text-center">
              <Link to="/universities">
                <button className="px-6 py-3 rounded-xl text-sm font-semibold border-2 hover:opacity-80 transition-all" style={{ borderColor: '#1B3A6B', color: '#1B3A6B' }}>
                  <span className="inline-flex items-center gap-1">Explore all 50+ universities <ArrowRight size={15} /></span>
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ FEATURED MAJORS ══════════════ */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ background: '#4AAEE010', color: '#4AAEE0' }}>Explore Fields</span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Popular Majors</h2>
                <p className="text-sm text-slate-500 mt-1">Discover programs that match your passion and career goals</p>
              </div>
              <Link to="/majors" className="hidden md:flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: '#4AAEE0' }}>
                View all <ArrowRight />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(majorLoading ? PLACEHOLDER_MAJORS : (featuredMajors.length > 0 ? featuredMajors : PLACEHOLDER_MAJORS)).slice(0, 6).map((major, i) => {
              const mc = major.color || '#1B3A6B';
              return (
                <Reveal key={major.id || i} delay={i * 60}>
                  <Link to={`/majors/${major.slug}`} className="group flex flex-col items-center text-center p-5 bg-white rounded-2xl border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110"
                      style={{ background: `${mc}12`, border: `1.5px solid ${mc}25`, color: mc }}>
                      {major.icon || "📚"}
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 leading-snug mb-1 group-hover:text-[#1B3A6B] transition-colors">{major.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${mc}10`, color: mc }}>
                      {major.category}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={150}>
            <div className="mt-8 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">🚀 Popular Career Paths</p>
              <div className="flex flex-wrap gap-2">
                {['Software Engineer','Data Scientist','Business Analyst','Civil Engineer','Doctor','Lawyer','Hotel Manager','Marketing Manager','Financial Analyst','UX Designer','Teacher','Entrepreneur'].map(job => (
                  <span key={job} className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors cursor-default">{job}</span>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-6 text-center">
              <Link to="/majors/quiz">
                <button className="px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all mr-3" style={{ background: '#4AAEE0' }}>
                  🎯 Take Major Quiz
                </button>
              </Link>
              <Link to="/majors">
                <button className="px-6 py-3 rounded-xl text-sm font-semibold border-2 hover:opacity-80 transition-all" style={{ borderColor: '#4AAEE0', color: '#4AAEE0' }}>
                  Browse all majors →
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="px-6 py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <Reveal><SectionHeader tag="Simple Process" title="How UniSites Works" subtitle="From exploration to enrollment — we guide you every step of the way" /></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#1B3A6B] via-[#4AAEE0] to-[#3DAE6B] opacity-20 z-0" />
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.step} delay={i * 100}>
                <div className="relative z-10 flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm"
                    style={{ background: `${step.color}12`, border: `1.5px solid ${step.color}25`, color: step.color }}
                  >
                    <step.icon size={24} strokeWidth={2.2} />
                  </div>
                  <span className="text-xs font-bold tracking-widest mb-2" style={{ color: step.color }}>STEP {step.step}</span>
                  <h3 className="text-sm font-bold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURED SCHOLARSHIPS ══════════════ */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3" style={{ background: '#F47B2010', color: '#F47B20' }}>Funding</span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Featured Scholarships</h2>
                <p className="text-sm text-slate-500 mt-1">Top opportunities available for Cambodian students right now</p>
              </div>
              <Link to="/opportunities" className="hidden md:flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: '#F47B20' }}>
                View all <ArrowRight />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCHOLARSHIPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <Link
                  to={s.link}
                  className="group flex h-full min-h-[156px] items-start gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: '#f8fafc', borderColor: '#e2e8f0', boxShadow: '0 10px 26px rgba(15, 23, 42, 0.06)' }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-slate-200/80">
                    {s.emoji}
                  </div>
                  <div className="flex min-h-full flex-1 flex-col min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:underline leading-snug">{s.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">{s.org}</p>
                    <div className="mt-auto flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#eff6ff', color: '#1B3A6B' }}>{s.type}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Clock3 size={12} /> Deadline: {s.deadline}</span>
                    </div>
                  </div>
                  <span className="mt-1 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500"><ArrowRight /></span>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="mt-6 text-center">
              <Link to="/opportunities">
                <button className="px-6 py-3 rounded-xl text-sm font-semibold border-2 hover:opacity-80 transition-all" style={{ borderColor: '#F47B20', color: '#F47B20' }}>
                  <span className="inline-flex items-center gap-1">Browse all 100+ opportunities <ArrowRight size={15} /></span>
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ STUDENT TESTIMONIALS ══════════════ */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal><SectionHeader tag="Real Students" title="What Students Are Saying" subtitle="Hear from Cambodian students who found their university through UniSites" /></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} className="text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">"{t.content}"</p>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ background: `${t.color}15`, border: `1.5px solid ${t.color}25` }}>
                      <t.avatar size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                    <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: `${t.color}10`, color: t.color }}>
                      {t.uni}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FUN FACTS / INTERESTING ══════════════ */}
      <section className="px-6 py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <Reveal><SectionHeader tag="Did You Know?" title="Why Students Choose UniSites" subtitle="Built specifically for Cambodian students, by people who understand the journey" /></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FUN_FACTS.map((f, i) => (
              <Reveal key={f.stat} delay={i * 80}>
                <div className="p-5 rounded-2xl border text-center hover:scale-[1.02] transition-all"
                  style={{ background: 'white', borderColor: `${f.color}25` }}>
                  <div className="mb-3" style={{ color: f.color }}><f.icon size={28} strokeWidth={2} /></div>
                  <div className="text-xl font-bold mb-1" style={{ color: f.color }}>{f.stat}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
