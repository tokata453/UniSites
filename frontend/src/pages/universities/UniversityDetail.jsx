import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { universityApi } from '@/api';
import { Badge, Spinner, Button, Card, Empty } from '@/components/common';
import { coverUrl, logoUrl, galleryUrl, formatCurrency } from '@/utils';
import { useAuth, useToast } from '@/hooks';

const TABS = ['Overview', 'Programs', 'Gallery', 'News', 'Events', 'FAQs', 'Reviews'];

export default function UniversityDetail() {
  const { slug }  = useParams();
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const [uni,     setUni]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('Overview');
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await universityApi.getBySlug(slug);
        setUni(res.data.university);
      } catch (_) {
        error('University not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!uni)    return <div className="text-center py-32 text-slate-400">University not found.</div>;

  const typeColor = { public: 'blue', private: 'green', international: 'purple' };

  return (
    <div>
      {/* ── Cover ── */}
      <div className="relative h-56 md:h-72 bg-gradient-to-br from-indigo-900/40 to-slate-900 overflow-hidden">
        {uni.cover_url && <img src={coverUrl(uni.cover_url)} alt="" className="w-full h-full object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent" />
      </div>

      {/* ── Header ── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-5 -mt-12 mb-8 relative z-10">
          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl bg-[#1a1f2e] border border-white/10 flex items-center justify-center text-4xl overflow-hidden shrink-0">
            {uni.logo_url ? <img src={logoUrl(uni.logo_url)} alt="" className="w-full h-full object-cover" /> : '🎓'}
          </div>

          <div className="flex-1 pt-6 md:pt-14">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge color={typeColor[uni.type] || 'blue'}>{uni.type}</Badge>
              {uni.is_verified  && <Badge color="green">Verified</Badge>}
              {uni.scholarship_available && <Badge color="yellow">Scholarship</Badge>}
              {uni.dormitory_available   && <Badge color="purple">Dormitory</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{uni.name}</h1>
            {uni.name_km && <p className="text-slate-400 mt-0.5">{uni.name_km}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
              {uni.province     && <span>📍 {uni.province}</span>}
              {uni.founded_year && <span>🗓 Est. {uni.founded_year}</span>}
              {uni.student_count && <span>👥 {uni.student_count?.toLocaleString()} students</span>}
              {uni.rating_avg   && <span>⭐ {uni.rating_avg} ({uni.review_count} reviews)</span>}
            </div>
          </div>

          <div className="flex gap-2 items-start pt-14">
            {uni.website_url && (
              <a href={uni.website_url} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="sm">🌐 Website</Button>
              </a>
            )}
            {isAuthenticated && (
              <Button variant={saved ? 'primary' : 'secondary'} size="sm"
                onClick={() => setSaved((p) => !p)}>
                {saved ? '🔖 Saved' : '+ Save'}
              </Button>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 overflow-x-auto mb-8 border-b border-white/[0.07] pb-px">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px ${tab === t ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="pb-16">
          {tab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {uni.description && (
                  <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-200 mb-3">About</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{uni.description}</p>
                  </Card>
                )}
                {uni.accreditation && (
                  <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-200 mb-2">Accreditation</h3>
                    <p className="text-sm text-slate-400">{uni.accreditation}</p>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                {/* Quick stats */}
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">Quick Info</h3>
                  <div className="space-y-2.5 text-sm">
                    {[
                      ['Type',     uni.type],
                      ['Province', uni.province],
                      ['Programs', uni.program_count],
                      ['Faculties',uni.faculty_count],
                      ['Tuition',  uni.tuition_min && `${formatCurrency(uni.tuition_min)} – ${formatCurrency(uni.tuition_max)}/yr`],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}</span>
                        <span className="text-slate-200 capitalize">{v}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Contact */}
                {(uni.email || uni.phone || uni.facebook_url) && (
                  <Card className="p-5">
                    <h3 className="text-sm font-semibold text-slate-200 mb-3">Contact</h3>
                    <div className="space-y-2 text-sm text-slate-400">
                      {uni.email       && <p>✉️ {uni.email}</p>}
                      {uni.phone       && <p>📞 {uni.phone}</p>}
                      {uni.facebook_url && <a href={uni.facebook_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">🔗 Facebook</a>}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {tab === 'Programs' && (
            <div className="space-y-4">
              {(uni.Faculties || []).map((faculty) => (
                <Card key={faculty.id} className="p-5">
                  <h3 className="font-semibold text-slate-200 mb-3">{faculty.name}</h3>
                  <div className="space-y-2">
                    {(faculty.Programs || []).map((prog) => (
                      <div key={prog.id} className="flex items-center justify-between py-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <Badge color="blue">{prog.degree_level}</Badge>
                          <span className="text-sm text-slate-200">{prog.name}</span>
                        </div>
                        <span className="text-sm text-slate-400">{prog.duration_years} yrs</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
              {!uni.Faculties?.length && <Empty title="No programs listed yet." />}
            </div>
          )}

          {tab === 'Gallery' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(uni.Gallery || []).map((img) => (
                <div key={img.id} className="aspect-video rounded-xl overflow-hidden bg-white/5">
                  <img src={galleryUrl(img.public_id || img.url)} alt={img.caption} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
              {!uni.Gallery?.length && <Empty title="No gallery images yet." />}
            </div>
          )}

          {tab === 'News' && (
            <div className="space-y-3">
              {(uni.News || []).map((item) => (
                <Card key={item.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{item.title}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge color="blue">{item.category}</Badge>
                      {item.published_at && <span className="text-xs text-slate-500">{item.published_at}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{item.views_count} views</span>
                </Card>
              ))}
              {!uni.News?.length && <Empty title="No news yet." />}
            </div>
          )}

          {tab === 'Events' && (
            <div className="space-y-3">
              {(uni.Events || []).map((ev) => (
                <Card key={ev.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{ev.title}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge color="purple">{ev.type}</Badge>
                      {ev.event_date && <span className="text-xs text-slate-500">{ev.event_date}</span>}
                    </div>
                  </div>
                  {ev.is_featured && <Badge color="yellow">Featured</Badge>}
                </Card>
              ))}
              {!uni.Events?.length && <Empty title="No upcoming events." />}
            </div>
          )}

          {tab === 'FAQs' && (
            <div className="space-y-3 max-w-3xl">
              {(uni.FAQs || []).map((faq, i) => (
                <Card key={faq.id} className="p-4">
                  <p className="text-sm font-semibold text-indigo-400 mb-1">Q{i + 1}. {faq.question}</p>
                  <p className="text-sm text-slate-400">{faq.answer}</p>
                </Card>
              ))}
              {!uni.FAQs?.length && <Empty title="No FAQs yet." />}
            </div>
          )}

          {tab === 'Reviews' && (
            <div className="space-y-3 max-w-3xl">
              {(uni.Reviews || []).filter(r => r.is_approved).map((rev) => (
                <Card key={rev.id} className="p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">{rev.User?.name || 'Anonymous'}</span>
                    <span className="text-sm text-amber-400">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                  </div>
                  <p className="text-sm text-slate-400">{rev.comment}</p>
                </Card>
              ))}
              {!uni.Reviews?.filter(r => r.is_approved).length && <Empty title="No reviews yet." />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
