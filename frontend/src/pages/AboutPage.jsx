import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// ── Animation hook — fade in when element enters viewport ─────────────────────
const useInView = () => {
  const ref  = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const Reveal = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '50+',    label: 'Universities Listed'   },
  { value: '500+',   label: 'Programs Available'    },
  { value: '100+',   label: 'Scholarships'          },
  { value: '10,000+',label: 'Students Helped'       },
];

const FEATURES = [
  {
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    title: 'Discover Universities',
    desc:  'Search and filter from 50+ universities across Cambodia by type, province, tuition, and available scholarships.',
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    title: 'Compare Programs',
    desc:  'Explore faculties, programs, and degree levels side by side to find the right fit for your career goals.',
  },
  {
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Find Scholarships',
    desc:  'Browse curated scholarships, grants, and financial aid opportunities from universities and organizations.',
  },
  {
    icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
    title: 'Community Forum',
    desc:  'Connect with other students, ask questions, share experiences, and get advice from the UniSites community.',
  },
  {
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    title: 'Major Quiz',
    desc:  'Not sure what to study? Take our quiz and get personalized major recommendations based on your interests.',
  },
  {
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    title: 'University Analytics',
    desc:  'University owners get detailed analytics on profile views, program interest, and student engagement.',
  },
];

const TEAM = [
  { name: 'Dara Sok',       role: 'Project Lead & Backend',   avatar: 'DS', color: '#6366f1' },
  { name: 'Sreymom Chan',   role: 'Frontend Developer',        avatar: 'SC', color: '#10b981' },
  { name: 'Bopha Lim',      role: 'UI/UX Designer',            avatar: 'BL', color: '#f59e0b' },
  { name: 'Piseth Kem',     role: 'Backend Developer',         avatar: 'PK', color: '#ec4899' },
  { name: 'Channary Ros',   role: 'Database & API',            avatar: 'CR', color: '#8b5cf6' },
  { name: 'Sokha Meas',     role: 'Frontend Developer',        avatar: 'SM', color: '#06b6d4' },
  { name: 'Virak Phan',     role: 'QA & Documentation',        avatar: 'VP', color: '#84cc16' },
];

// ── Shared SVG icon ───────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

// ── Section label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-4">
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Instrument+Serif:ital@0;1&display=swap');
        .about-serif { font-family: 'Instrument Serif', serif; }
        .about-sans  { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="about-sans bg-[#080c14] text-slate-300 overflow-x-hidden">

        {/* ── Hero ── */}
        <section className="relative min-h-[70vh] flex items-center justify-center px-6 py-28 overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'800px', height:'600px', background:'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 65%)' }} />
            <div style={{ position:'absolute', bottom:0, right:0, width:'400px', height:'400px', background:'radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 65%)' }} />
            {/* Grid */}
            <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)', backgroundSize:'60px 60px' }} />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <Reveal>
              <SectionLabel>About UniSites</SectionLabel>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="about-serif text-5xl md:text-7xl text-white mb-6 leading-tight">
                Helping every Cambodian<br />
                <span className="italic text-indigo-400">student find their path</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                UniSites was built by students, for students. We believe every young Cambodian deserves 
                access to clear, honest information about higher education — in one place, for free.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="px-6 py-16 border-y border-white/[0.06]">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="text-center">
                  <div className="about-serif text-4xl md:text-5xl text-white mb-2">{s.value}</div>
                  <div className="text-sm text-slate-500 tracking-wide">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Mission & Vision ── */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <Reveal>
                  <SectionLabel>Our Mission</SectionLabel>
                  <h2 className="about-serif text-4xl md:text-5xl text-white mt-2 mb-6 leading-snug">
                    Making university discovery <span className="italic text-indigo-400">accessible</span> to all
                  </h2>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Navigating higher education in Cambodia is hard. Information is scattered, outdated, 
                    or simply unavailable. Students spend weeks searching for the right university, 
                    comparing tuition, and finding scholarships they qualify for.
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    UniSites solves this by bringing everything together — verified university profiles, 
                    program details, scholarship listings, and a community of students who've been 
                    through the same journey.
                  </p>
                </Reveal>
              </div>

              <Reveal delay={150}>
                <div className="space-y-4">
                  {[
                    { icon: 'M5 13l4 4L19 7', title: 'Free forever for students', desc: 'No paywalls, no hidden fees. Every feature is free for students.' },
                    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Verified information', desc: 'University profiles are verified and kept up to date.' },
                    { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064', title: 'Built for Cambodia', desc: 'Designed specifically for Cambodian students and universities.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/20 transition-all">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                        <Icon d={item.icon} size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200 mb-0.5">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="px-6 py-24 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center mb-16">
                <SectionLabel>How It Works</SectionLabel>
                <h2 className="about-serif text-4xl md:text-5xl text-white mt-2">
                  Everything you need,<br /><span className="italic text-indigo-400">in one platform</span>
                </h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 60}>
                  <div className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/25 hover:bg-white/[0.04] transition-all duration-300 h-full">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-500/20 transition-all">
                      <Icon d={f.icon} size={20} />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="px-6 py-24 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center mb-16">
                <SectionLabel>The Team</SectionLabel>
                <h2 className="about-serif text-4xl md:text-5xl text-white mt-2">
                  Built by students at<br />
                  <span className="italic text-indigo-400">AUPP</span>
                </h2>
                <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
                  UniSites is an INFO 251-001 course project by a team of 7 students at the 
                  American University of Phnom Penh.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {TEAM.map((member, i) => (
                <Reveal key={member.name} delay={i * 60}>
                  <div className="group text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-lg font-bold text-white transition-transform group-hover:scale-105"
                      style={{ background: `linear-gradient(135deg, ${member.color}40, ${member.color}20)`, border: `1px solid ${member.color}30` }}>
                      <span style={{ color: member.color }}>{member.avatar}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200 mb-1">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="px-6 py-24 border-t border-white/[0.06]">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <div className="text-center mb-12">
                <SectionLabel>Contact</SectionLabel>
                <h2 className="about-serif text-4xl md:text-5xl text-white mt-2">
                  Get in <span className="italic text-indigo-400">touch</span>
                </h2>
                <p className="text-slate-400 mt-4 text-sm">
                  Have a question, suggestion, or want to list your university? We'd love to hear from you.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {[
                { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Email', value: 'hello@unisites.kh', href: 'mailto:hello@unisites.kh' },
                { icon: 'M17 8l4 4m0 0l-4 4m4-4H3',                                                                                   label: 'Facebook', value: 'UniSites Cambodia',  href: 'https://facebook.com' },
                { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', label: 'Location', value: 'Phnom Penh, Cambodia', href: null },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 80}>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/20 transition-all text-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mx-auto mb-3">
                      <Icon d={item.icon} size={18} />
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-slate-200 hover:text-indigo-400 transition-colors font-medium">{item.value}</a>
                    ) : (
                      <p className="text-sm text-slate-200 font-medium">{item.value}</p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>

            {/* CTA */}
            <Reveal delay={200}>
              <div className="text-center p-10 rounded-2xl bg-gradient-to-br from-indigo-500/8 to-violet-500/5 border border-indigo-500/15">
                <h3 className="about-serif text-3xl text-white mb-3">
                  Ready to find your university?
                </h3>
                <p className="text-slate-400 text-sm mb-6">Join thousands of students already using UniSites.</p>
                <div className="flex gap-3 justify-center">
                  <Link to="/universities"
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20">
                    Browse Universities
                  </Link>
                  <Link to="/register"
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-semibold transition-all">
                    Sign up free
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

      </div>
    </>
  );
}
