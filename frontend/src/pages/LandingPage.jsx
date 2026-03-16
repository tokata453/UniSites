import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { universityApi, majorApi } from '@/api';

const TYPES = ['All', 'Public', 'Private', 'International'];

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const BG_SLIDES = [
  { url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80',  label: 'Universities'  },
  { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=80', label: 'Graduation'   },
  { url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80', label: 'Scholarships' },
  { url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&q=80', label: 'Student Life' },
];

const SCHOLARSHIPS = [
  { emoji: '🇯🇵', title: 'MEXT Japanese Government Scholarship', org: 'Government of Japan', type: 'Full Funding', deadline: 'Apr 30, 2026', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', link: '/opportunities/japanese-government-mext-scholarship-2026' },
  { emoji: '🇰🇷', title: 'Korean Government Scholarship (GKS)', org: 'Government of Korea', type: 'Full Funding', deadline: 'Mar 31, 2026', color: '#1D4ED8', bg: '#eff6ff', border: '#bfdbfe', link: '/opportunities/korean-government-gks-scholarship-2026' },
  { emoji: '🏛️', title: 'RUPP Excellence Scholarship 2026',      org: 'Royal Univ. of Phnom Penh', type: 'Full Funding', deadline: 'Jun 30, 2026', color: '#15803D', bg: '#f0fdf4', border: '#bbf7d0', link: '/opportunities/rupp-excellence-scholarship-2026' },
  { emoji: '⚙️', title: 'ITC STEM Full Scholarship 2026',        org: 'Institute of Tech. Cambodia', type: 'Full Funding', deadline: 'Jul 15, 2026', color: '#F47B20', bg: '#fff7ed', border: '#fed7aa', link: '/opportunities/itc-stem-scholarship-2026' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🔍', title: 'Search & Explore',    desc: 'Browse 50+ universities filtered by type, province, tuition range, and available scholarships.',     color: '#1B3A6B' },
  { step: '02', icon: '🎯', title: 'Take the Major Quiz', desc: 'Answer 5 quick questions and get personalized major recommendations that match your interests.',       color: '#4AAEE0' },
  { step: '03', icon: '💰', title: 'Find Scholarships',   desc: 'Discover funding opportunities from local universities, government programs, and international bodies.', color: '#F47B20' },
  { step: '04', icon: '🎓', title: 'Apply & Succeed',     desc: 'Connect with universities directly, get guidance from the community forum, and start your journey.',    color: '#3DAE6B' },
];

const TESTIMONIALS = [
  { name: 'Srey Leak Heng', role: 'CS Graduate · RUPP 2024',          avatar: '👩‍💻', content: 'UniSites helped me discover RUPP\'s computer science program and apply for their excellence scholarship. I landed a tech job within 3 months of graduating!',                    rating: 5, uni: 'RUPP',   color: '#1B3A6B' },
  { name: 'Dara Pich',      role: 'Electrical Eng. Graduate · ITC',   avatar: '👨‍🔧', content: 'Found ITC through UniSites and used the Major Quiz to confirm engineering was right for me. The scholarship finder saved me hours of research.',                           rating: 5, uni: 'ITC',    color: '#4AAEE0' },
  { name: 'Channary Ros',   role: 'Tourism Student · PUC',            avatar: '👩‍🎓', content: 'The forum connected me with seniors who shared real insights about PUC\'s hospitality program. I got my internship placement through advice from the community!',           rating: 5, uni: 'PUC',    color: '#3DAE6B' },
  { name: 'Kevin Phon',     role: 'Business Graduate · AUPP 2024',    avatar: '👨‍💼', content: 'UniSites made comparing AUPP vs other universities so easy. The detailed program info and student reviews helped me make a confident decision.',                             rating: 5, uni: 'AUPP',   color: '#F47B20' },
];

const FUN_FACTS = [
  { icon: '🌏', stat: '#1',      desc: 'Platform for Cambodian university discovery',        color: '#1B3A6B', bg: '#eff6ff' },
  { icon: '⚡', stat: '< 5 min', desc: 'Average time to find and compare top universities',  color: '#F47B20', bg: '#fff7ed' },
  { icon: '🎯', stat: '94%',     desc: 'Students found their match using our Major Quiz',    color: '#3DAE6B', bg: '#f0fdf4' },
  { icon: '💬', stat: '10,000+', desc: 'Students helped and counting across Cambodia',       color: '#4AAEE0', bg: '#f0f9ff' },
];

const PLACEHOLDER_UNIS = [
  { id: '1', slug: 'royal-university-of-phnom-penh',        name: 'Royal University of Phnom Penh',        university_type: 'public',        province: 'Phnom Penh', program_count: 80,  rating_avg: 4.2, icon: '🏛️', color: '#1B3A6B' },
  { id: '2', slug: 'institute-of-technology-of-cambodia',   name: 'Institute of Technology of Cambodia',   university_type: 'public',        province: 'Phnom Penh', program_count: 35,  rating_avg: 4.5, icon: '⚙️', color: '#4AAEE0' },
  { id: '3', slug: 'norton-university',                     name: 'Norton University',                     university_type: 'private',       province: 'Phnom Penh', program_count: 45,  rating_avg: 4.1, icon: '🎓', color: '#3DAE6B' },
  { id: '4', slug: 'american-university-of-phnom-penh',     name: 'American University of Phnom Penh',     university_type: 'international', province: 'Phnom Penh', program_count: 20,  rating_avg: 4.6, icon: '🌏', color: '#F47B20' },
];

const PLACEHOLDER_MAJORS = [
  { id: '1', slug: 'computer-science',      name: 'Computer Science',      icon: '💻', category: 'Technology',  color: '#1B3A6B', jobs: 'Software Engineer, Data Scientist, DevOps' },
  { id: '2', slug: 'business-administration', name: 'Business Administration', icon: '📊', category: 'Business',   color: '#F47B20', jobs: 'Manager, Entrepreneur, Consultant' },
  { id: '3', slug: 'civil-engineering',     name: 'Civil Engineering',     icon: '🏗️', category: 'Engineering', color: '#4AAEE0', jobs: 'Structural Engineer, Project Manager' },
  { id: '4', slug: 'medicine',              name: 'Medicine',              icon: '🏥', category: 'Health',      color: '#ef4444', jobs: 'Doctor, Surgeon, Medical Researcher' },
  { id: '5', slug: 'law',                   name: 'Law',                   icon: '⚖️', category: 'Law',         color: '#8b5cf6', jobs: 'Lawyer, Judge, Legal Consultant' },
  { id: '6', slug: 'hospitality-tourism',   name: 'Hospitality & Tourism', icon: '✈️', category: 'Tourism',     color: '#3DAE6B', jobs: 'Hotel Manager, Tour Guide, Event Planner' },
];

const TYPE_COLORS = { public: '#1B3A6B', private: '#3DAE6B', international: '#F47B20' };
const TYPE_BG     = { public: '#eff6ff',  private: '#f0fdf4',  international: '#fff7ed'  };


function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
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

export default function LandingPage() {
  const [search, setSearch] = useState('');
  const [type,   setType]   = useState('All');
  const [slide,  setSlide]  = useState(0);
  const [fading, setFading] = useState(false);
  const [featuredUnis,   setFeaturedUnis]   = useState([]);
  const [featuredMajors, setFeaturedMajors] = useState([]);
  const [uniLoading,     setUniLoading]     = useState(true);
  const [majorLoading,   setMajorLoading]   = useState(true);
  const timerRef = useRef(null);
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

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide(p => {
        const next = (p + 1) % BG_SLIDES.length;
        setFading(true);
        setTimeout(() => setFading(false), 700);
        return next;
      });
    }, 4500);
  };

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, []);

  const goSlide = (idx) => { setSlide(idx); setFading(true); setTimeout(() => setFading(false), 700); startTimer(); };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/universities?search=${encodeURIComponent(search)}&type=${type !== 'All' ? type.toLowerCase() : ''}`);
  };

  return (
    <div className="bg-white">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative px-6 pt-24 pb-24 text-center overflow-hidden min-h-[520px] flex items-center">
        {BG_SLIDES.map((s, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${s.url})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: i === slide ? 1 : 0, transition: 'opacity 0.8s ease', zIndex: 0 }} />
        ))}
        <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.88) 60%, rgba(255,255,255,0.97) 100%)' }} />
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {BG_SLIDES.map((s, i) => (
            <button key={i} onClick={() => goSlide(i)} title={s.label}
              style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, border: 'none', background: i === slide ? '#F47B20' : 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
          ))}
        </div>
        <div className="relative z-[2] max-w-4xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-6"
            style={{ background: '#1B3A6B08', borderColor: '#1B3A6B25', color: '#1B3A6B' }}>
            🎓 Discover Universities in Cambodia
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-slate-800">
            Find Your Perfect<br /><span style={{ color: '#F47B20' }}>University</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Explore universities, programs, scholarships, and opportunities across Cambodia — all in one place.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-md focus-within:border-[#1B3A6B] focus-within:ring-2 focus-within:ring-[#1B3A6B]/10 transition-all">
              <span className="text-slate-400 shrink-0"><SearchIcon /></span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search university name..."
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400" />
            </div>
            <select value={type} onChange={e => setType(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 outline-none shadow-md sm:w-36 cursor-pointer">
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
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
              { type: 'public',        label: 'Public Universities',        desc: 'Government-funded institutions with affordable tuition', icon: '🏛️', bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', accent: '#3B82F6' },
              { type: 'private',       label: 'Private Universities',       desc: 'Privately funded with diverse program offerings',        icon: '🎓', bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', accent: '#22C55E' },
              { type: 'international', label: 'International Universities', desc: 'Globally accredited with international programs',         icon: '🌏', bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C', accent: '#F97316' },
            ].map((item, i) => (
              <Reveal key={item.type} delay={i * 80}>
                <Link to={`/universities?type=${item.type}`} className="p-6 rounded-xl border hover:scale-[1.02] hover:shadow-md transition-all block" style={{ background: item.bg, borderColor: item.border }}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-base font-semibold mb-1" style={{ color: item.text }}>{item.label}</h3>
                  <p className="text-sm text-slate-500 mb-4">{item.desc}</p>
                  <span className="text-xs font-semibold" style={{ color: item.accent }}>Explore →</span>
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
                  <Link to={`/universities/${uni.slug}`} className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                    <div className="h-36 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${tc}15, ${tc}08)` }}>
                      {uni.cover_url
                        ? <img src={uni.cover_url} alt={uni.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => e.target.style.display="none"} />
                        : <div className="w-full h-full flex items-center justify-center text-5xl">{uni.icon || "🏛️"}</div>
                      }
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold capitalize"
                        style={{ background: tbg, color: tc, border: `1px solid ${tc}30` }}>
                        {uni.university_type}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-2.5">
                        {uni.logo_url && <img src={uni.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-100 shrink-0 mt-0.5" onError={e => e.target.style.display="none"} />}
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-[#1B3A6B] transition-colors line-clamp-2">{uni.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">📍 {uni.province}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-500">📚 {uni.program_count || 0} programs</span>
                        {uni.rating_avg > 0 && <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#F47B20' }}>★ {Number(uni.rating_avg).toFixed(1)}</span>}
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
                  Explore all 50+ universities →
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
                      style={{ background: `${mc}12`, border: `1.5px solid ${mc}25` }}>
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
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm"
                    style={{ background: `${step.color}12`, border: `1.5px solid ${step.color}25` }}>
                    {step.icon}
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
                <Link to={s.link} className="flex items-start gap-4 p-5 rounded-2xl border hover:shadow-md transition-all group"
                  style={{ background: s.bg, borderColor: s.border }}>
                  <div className="text-3xl shrink-0">{s.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:underline leading-snug">{s.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">{s.org}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${s.color}15`, color: s.color }}>{s.type}</span>
                      <span className="text-xs text-slate-400">⏰ Deadline: {s.deadline}</span>
                    </div>
                  </div>
                  <span className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1"><ArrowRight /></span>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="mt-6 text-center">
              <Link to="/opportunities">
                <button className="px-6 py-3 rounded-xl text-sm font-semibold border-2 hover:opacity-80 transition-all" style={{ borderColor: '#F47B20', color: '#F47B20' }}>
                  Browse all 100+ opportunities →
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
                      <span key={j} style={{ color: '#F47B20', fontSize: 14 }}>★</span>
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">"{t.content}"</p>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ background: `${t.color}15`, border: `1.5px solid ${t.color}25` }}>
                      {t.avatar}
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
                  style={{ background: f.bg, borderColor: `${f.color}25` }}>
                  <div className="text-3xl mb-3">{f.icon}</div>
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