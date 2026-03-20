import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Building2, CircleDollarSign, Globe2, Mail, MapPin, MessagesSquare, MapPinned, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const useInView = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.12 });
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

const TIMELINE = [
  { year: '2025', title: 'The Idea',       desc: 'Seven AUPP students noticed how hard it was to find reliable university info in Cambodia and decided to build the solution.' },
  { year: 'Jun 2025', title: 'Development Begins', desc: 'The team started designing and building UniSites as part of the INFO 251-001 course at AUPP.' },
  { year: 'Nov 2025', title: 'Beta Launch',  desc: 'First version launched with 10 universities, basic search, and campus updates. Early users provided valuable feedback.' },
  { year: 'Mar 2026', title: 'Full Launch',  desc: 'UniSites launched publicly with 50+ universities, scholarship finder, Major Quiz, and complete owner dashboards.' },
];

const VALUES = [
  { icon: CircleDollarSign, title: 'Always Free',       desc: 'Every feature — search, quiz, feed, scholarships — is completely free for students. No paywalls, ever.',     color: '#1B3A6B' },
  { icon: BadgeCheck, title: 'Verified Data',      desc: 'University profiles are reviewed and kept up to date. We work directly with institutions to ensure accuracy.',  color: '#3DAE6B' },
  { icon: MapPinned, title: 'Cambodia First',     desc: 'Every decision we make is guided by what\'s best for Cambodian students navigating higher education.',          color: '#F47B20' },
  { icon: Globe2, title: 'Open & Transparent', desc: 'We show you everything — tuition, ratings, reviews, contact info — with no hidden agendas or paid rankings.',   color: '#4AAEE0' },
];

const TEAM = [
  { name: 'Panhaseth SUY', role: 'Project Lead & Backend', avatar: 'PS', color: '#1B3A6B', image: 'src/assets/images/avatars/panhaseth.JPG' },
  { name: 'Taiseng LAI', role: 'Frontend Developer', avatar: 'TL', color: '#3DAE6B', image: 'src/assets/images/avatars/taiseng.jpeg' },
  { name: 'Narithtithya PANG', role: 'UI/UX Designer', avatar: 'NP', color: '#F47B20', image: 'src/assets/images/avatars/tithya.JPG' },
  { name: 'Vireakpanha CHAMROEUN', role: 'Backend Developer', avatar: 'VC', color: '#4AAEE0', image: 'src/assets/images/avatars/panha.png' },
  { name: 'Chansonaza PAN', role: 'Database & API', avatar: 'CP', color: '#8b5cf6', image: 'src/assets/images/avatars/naza.jpg' },
  { name: 'Chumsomary LOEUNG', role: 'Frontend Developer', avatar: 'CL', color: '#ec4899', image: 'src/assets/images/avatars/mary.jpg' },
  { name: 'Kimhorng PRAK', role: 'QA & Documentation', avatar: 'KP', color: '#f59e0b', image: 'src/assets/images/avatars/kimhorng.jpeg' },
];

const FAQS = [
  { q: 'Is UniSites free to use?',              a: 'Yes — 100% free for students. All features including search, Major Quiz, feed, and scholarship finder are completely free.' },
  { q: 'How do I list my university?',          a: 'Register as a university owner, complete your profile, and submit for verification. Our team reviews and publishes within 3 business days.' },
  { q: 'How accurate is the university data?',  a: 'We work directly with universities to verify information. Profiles are reviewed regularly and owners can update their info anytime.' },
  { q: 'Can I trust the student reviews?',      a: 'Reviews are moderated by our admin team before publishing. We verify student status where possible to ensure authenticity.' },
];

const SectionLabel = ({ children, color = '#1B3A6B' }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
    style={{ background: `${color}10`, color, border: `1px solid ${color}25` }}>
    {children}
  </div>
);

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="bg-white text-slate-700 overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative px-6 py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #fff7ed 50%, #f0fdf4 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #4AAEE030 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: '#F47B2020' }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <Reveal>
            <SectionLabel>Our Story</SectionLabel>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Syne',sans-serif", color: '#1B3A6B' }}>
              We built the platform<br />
              <span style={{ color: '#F47B20' }}>we wished existed</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Seven AUPP students. One shared frustration. Finding the right university in Cambodia
              shouldn't take weeks of scattered research — so we built UniSites to fix that.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex gap-3 justify-center mt-8 flex-wrap">
              <a href="#team">
                <button className="px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm" style={{ background: '#1B3A6B' }}>
                  Meet the Team
                </button>
              </a>
              <a href="#contact">
                <button className="px-6 py-3 rounded-xl text-sm font-semibold border-2 hover:opacity-80 transition-all" style={{ borderColor: '#F47B20', color: '#F47B20' }}>
                  Get In Touch
                </button>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Course info bar ── */}
      <section className="px-6 py-8 border-y border-slate-100 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '7',          label: 'Team Members',      color: '#1B3A6B' },
            { value: 'AUPP',       label: 'University',         color: '#4AAEE0' },
            { value: 'INFO 251',   label: 'Course',             color: '#F47B20' },
            { value: '2026',       label: 'Year Built',         color: '#3DAE6B' },
          ].map(({ value, label, color }, i) => (
            <Reveal key={label} delay={i * 60}>
              <div className="font-bold text-2xl mb-0.5" style={{ color }}>{value}</div>
              <div className="text-xs text-slate-500 font-medium">{label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Our Story / Timeline ── */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <SectionLabel color="#4AAEE0">Timeline</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800" style={{ fontFamily: "'Syne',sans-serif" }}>
                How UniSites came to life
              </h2>
            </div>
          </Reveal>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />
            <div className="space-y-10">
              {TIMELINE.map((item, i) => (
                <Reveal key={item.year} delay={i * 80}>
                  <div className={`relative flex gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Content */}
                    <div className={`flex-1 ml-12 md:ml-0 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all inline-block w-full">
                        <span className="text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: '#F47B20' }}>{item.year}</span>
                        <h3 className="text-sm font-bold text-slate-800 mb-1">{item.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    {/* Dot */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm top-5" style={{ background: '#1B3A6B' }} />
                    {/* Empty side for alternating layout */}
                    <div className="hidden md:block flex-1" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <SectionLabel color="#3DAE6B">What We Stand For</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800" style={{ fontFamily: "'Syne',sans-serif" }}>
                Our core values
              </h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
                Everything we build is guided by these principles
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="group p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <div className="mb-4" style={{ color: v.color }}>
                    <v.icon size={28} strokeWidth={2} />
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: v.color }}>{v.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section id="team" className="px-6 py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <SectionLabel color="#F47B20">The People</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800" style={{ fontFamily: "'Syne',sans-serif" }}>
                Meet the team
              </h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
                INFO 251-001 · American University of Phnom Penh · Class of 2025
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TEAM.map((member, i) => (
              <Reveal key={member.name} delay={i * 60}>
                <div className="group text-center p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <div className="w-14 h-14 overflow-hidden rounded-2xl mx-auto mb-3 transition-transform group-hover:scale-105">
                    {member.image?.trim() ? (
                      <img
                        src={member.image}
                        alt={`${member.name} profile`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-base font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}bb)` }}
                      >
                        {member.avatar}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800 mb-0.5">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <SectionLabel color="#4AAEE0">FAQ</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800" style={{ fontFamily: "'Syne',sans-serif" }}>
                Common questions
              </h2>
            </div>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-all">
                    <span className="text-sm font-semibold text-slate-800">{faq.q}</span>
                    <span className="text-slate-400 shrink-0 ml-4 transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>
                      <Plus size={16} strokeWidth={2} />
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100">
                      <div className="pt-3">{faq.a}</div>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="px-6 py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <SectionLabel color="#1B3A6B">Get In Touch</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800" style={{ fontFamily: "'Syne',sans-serif" }}>
                We'd love to hear from you
              </h2>
              <p className="text-sm text-slate-500 mt-2">Questions, suggestions, or want to list your university?</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Mail, label: 'Email', value: 'hello@unisites.kh', href: 'mailto:hello@unisites.kh', color: '#1B3A6B' },
              { icon: MessagesSquare, label: 'Facebook', value: 'UniSites Cambodia', href: 'https://facebook.com', color: '#4AAEE0' },
              { icon: MapPin, label: 'Location', value: 'Phnom Penh, Cambodia', href: null, color: '#3DAE6B' },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 80}>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: `${item.color}10`, color: item.color }}>
                    <item.icon size={18} strokeWidth={2} />
                  </div>
                  <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-semibold transition-colors hover:underline" style={{ color: item.color }}>{item.value}</a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-700">{item.value}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          {/* Bottom CTA — unique to about page */}
          <Reveal delay={200}>
            <div className="text-center p-10 rounded-3xl border-2 border-dashed border-slate-200 bg-white">
              <p className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Syne',sans-serif" }}>
                Want to be part of UniSites?
              </p>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                Whether you're a university wanting to reach more students, or a student with feedback — we want to hear from you.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a href="mailto:hello@unisites.kh">
                  <button className="px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm" style={{ background: '#1B3A6B' }}>
                    <span className="inline-flex items-center gap-2">
                      <Mail size={16} strokeWidth={2} />
                      <span>Email Us</span>
                    </span>
                  </button>
                </a>
                <Link to="/register?role=owner">
                  <button className="px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm" style={{ background: '#F47B20' }}>
                    <span className="inline-flex items-center gap-2">
                      <Building2 size={16} strokeWidth={2} />
                      <span>List Your University</span>
                    </span>
                  </button>
                </Link>
                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  <button className="px-6 py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                    <span className="inline-flex items-center gap-2">
                      <MessagesSquare size={16} strokeWidth={2} />
                      <span>Follow Us</span>
                    </span>
                  </button>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
