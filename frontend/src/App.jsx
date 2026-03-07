import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layouts
import MainLayout        from '@/components/layout/MainLayout';
import DashboardLayout   from '@/components/layout/DashboardLayout';

// Public pages
import LandingPage       from '@/pages/LandingPage';
import UniversityList    from '@/pages/universities/UniversityList';
import UniversityDetail  from '@/pages/universities/UniversityDetail';
import ForumPage         from '@/pages/forum/ForumPage';
import ForumThreadPage   from '@/pages/forum/ForumThreadPage';
import OpportunitiesPage from '@/pages/opportunities/OpportunitiesPage';
import OpportunityDetail from '@/pages/opportunities/OpportunityDetail';

// Auth pages
import LoginPage         from '@/pages/auth/LoginPage';
import RegisterPage      from '@/pages/auth/RegisterPage';
import OAuthCallback     from '@/pages/auth/OAuthCallback';

// Student dashboard
import StudentOverview   from '@/pages/dashboard/student/StudentOverview';
import StudentSaved      from '@/pages/dashboard/student/StudentSaved';
import StudentProfile    from '@/pages/dashboard/student/StudentProfile';

// Owner dashboard
import OwnerOverview     from '@/pages/dashboard/owner/OwnerOverview';
import OwnerProfile      from '@/pages/dashboard/owner/OwnerProfile';
import OwnerGallery      from '@/pages/dashboard/owner/OwnerGallery';
import OwnerFaculties    from '@/pages/dashboard/owner/OwnerFaculties';
import OwnerNews         from '@/pages/dashboard/owner/OwnerNews';
import OwnerFAQ          from '@/pages/dashboard/owner/OwnerFAQ';

// Guards
const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, role }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.Role?.name !== role) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes with main layout ── */}
        <Route element={<MainLayout />}>
          <Route path="/"                        element={<LandingPage />} />
          <Route path="/universities"            element={<UniversityList />} />
          <Route path="/universities/:slug"      element={<UniversityDetail />} />
          <Route path="/forum"                   element={<ForumPage />} />
          <Route path="/forum/:slug"             element={<ForumThreadPage />} />
          <Route path="/opportunities"           element={<OpportunitiesPage />} />
          <Route path="/opportunities/:slug"     element={<OpportunityDetail />} />
        </Route>

        {/* ── Auth routes (no layout) ── */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/auth/callback"   element={<OAuthCallback />} />

        {/* ── Student dashboard ── */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <RoleRoute role="student">
              <DashboardLayout role="student" />
            </RoleRoute>
          </PrivateRoute>
        }>
          <Route index                 element={<StudentOverview />} />
          <Route path="saved"          element={<StudentSaved />} />
          <Route path="profile"        element={<StudentProfile />} />
        </Route>

        {/* ── Owner dashboard ── */}
        <Route path="/owner" element={
          <PrivateRoute>
            <RoleRoute role="owner">
              <DashboardLayout role="owner" />
            </RoleRoute>
          </PrivateRoute>
        }>
          <Route index                 element={<OwnerOverview />} />
          <Route path="profile"        element={<OwnerProfile />} />
          <Route path="gallery"        element={<OwnerGallery />} />
          <Route path="faculties"      element={<OwnerFaculties />} />
          <Route path="news"           element={<OwnerNews />} />
          <Route path="faq"            element={<OwnerFAQ />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}