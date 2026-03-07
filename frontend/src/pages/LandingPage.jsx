import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common';

const TYPES = ['All', 'Public', 'Private', 'International'];

export default function LandingPage() {
  const [search, setSearch] = useState('');
  const [type,   setType]   = useState('All');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/universities?search=${encodeURIComponent(search)}&type=${type !== 'All' ? type.toLowerCase() : ''}`);
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative px-6 pt-24 pb-20 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
            🎓 Discover Universities in Cambodia
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect<br />
            <span className="text-indigo-400">University</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Explore universities, programs, scholarships, and opportunities across Cambodia — all in one place.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search university name..."
              className="flex-1 input-base text-base py-3 px-4"
            />
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="input-base py-3 bg-[#1e2433] sm:w-36">
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <Button type="submit" size="lg">Search</Button>
          </form>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-6 py-10 border-y border-white/[0.07]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '50+',    label: 'Universities'   },
            { value: '500+',   label: 'Programs'       },
            { value: '100+',   label: 'Scholarships'   },
            { value: '10,000+',label: 'Students Helped'},
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold text-white mb-1">{value}</div>
              <div className="text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Browse by Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: 'public',        label: 'Public Universities',        desc: 'Government-funded institutions with affordable tuition', icon: '🏛️', color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20' },
              { type: 'private',       label: 'Private Universities',       desc: 'Privately funded with diverse program offerings',        icon: '🎓', color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20' },
              { type: 'international', label: 'International Universities', desc: 'Globally accredited with international programs',         icon: '🌏', color: 'from-violet-500/10 to-violet-600/5 border-violet-500/20' },
            ].map((item) => (
              <Link key={item.type} to={`/universities?type=${item.type}`}
                className={`p-6 rounded-xl bg-gradient-to-br ${item.color} border hover:scale-[1.02] transition-all`}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-base font-semibold text-white mb-1">{item.label}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Are you a university?</h2>
          <p className="text-slate-400 mb-6">List your institution and reach thousands of Cambodian students actively looking for universities.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/register"><Button size="lg">Register your university</Button></Link>
            <Link to="/universities"><Button variant="secondary" size="lg">Browse first</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
