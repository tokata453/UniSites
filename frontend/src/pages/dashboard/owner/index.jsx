// Owner dashboard pages — each route renders a focused section.
// The full combined dashboard is at OwnerDashboard.jsx (already built).

import { universityApi } from '@/api';
import { useState, useEffect } from 'react';
import { Spinner } from '@/components/common';
import { useAuth } from '@/hooks';

// Lazy-load the section components from the master dashboard file
// In a real app these would be their own files; here we re-use the logic
// from the combined OwnerDashboard for clarity.

const useMyUniversity = () => {
  const [university, setUniversity] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    universityApi.getMine()
      .then((res) => setUniversity(res.data.universities?.[0] || null))
      .finally(() => setLoading(false));
  }, []);

  return { university, loading };
};

export function OwnerOverview() {
  const { university, loading } = useMyUniversity();
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Analytics Overview</h2>
        <p className="text-slate-400 text-sm mt-0.5">{university?.name || 'No university registered yet'}</p>
      </div>
      {university ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Views',    value: university.views_count || 0 },
            { label: 'Rating',         value: `${university.rating_avg || 0} ★` },
            { label: 'Reviews',        value: university.review_count || 0 },
            { label: 'Programs',       value: university.program_count || 0 },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <p className="mb-4">You haven't registered a university yet.</p>
        </div>
      )}
    </div>
  );
}

// Stub pages — implement full UI as needed
const StubPage = ({ title }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <p className="text-slate-400 text-sm">This section is ready for implementation.</p>
  </div>
);

export const OwnerProfile    = () => <StubPage title="University Profile" />;
export const OwnerGallery    = () => <StubPage title="Gallery" />;
export const OwnerFaculties  = () => <StubPage title="Faculties & Programs" />;
export const OwnerNews       = () => <StubPage title="News & Events" />;
export const OwnerFAQ        = () => <StubPage title="FAQs & Contact" />;
