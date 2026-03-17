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
import { ForumNewThreadPage } from '@/pages/forum';
import OpportunitiesPage from '@/pages/opportunities/OpportunitiesPage';
import OpportunityDetail from '@/pages/opportunities/OpportunityDetail';
import AboutPage from '@/pages/AboutPage';
import { MajorsPage, MajorDetail, MajorQuiz } from '@/pages/majors';

// Auth pages
import LoginPage         from '@/pages/auth/LoginPage';
import RegisterPage      from '@/pages/auth/RegisterPage';
import OAuthCallback     from '@/pages/auth/OAuthCallback';
import OAuthErrorPage    from '@/pages/auth/OAuthErrorPage';

// Student dashboard
import StudentOverview   from '@/pages/dashboard/student/StudentOverview';
import StudentSaved      from '@/pages/dashboard/student/StudentSaved';
import StudentProfile    from '@/pages/dashboard/student/StudentProfile';

// Owner dashboard
import OwnerOverview     from '@/pages/dashboard/owner/OwnerOverview';
import OwnerProfile      from '@/pages/dashboard/owner/OwnerProfile';
import OwnerOpportunities from '@/pages/dashboard/owner/OwnerOpportunities';
import OwnerGallery      from '@/pages/dashboard/owner/OwnerGallery';
import OwnerFaculties    from '@/pages/dashboard/owner/OwnerFaculties';
import OwnerNews         from '@/pages/dashboard/owner/OwnerNews';
import OwnerFAQ          from '@/pages/dashboard/owner/OwnerFAQ';
import OrganizationOpportunities from '@/pages/dashboard/organization/OrganizationOpportunities';
import OrganizationProfile from '@/pages/dashboard/organization/OrganizationProfile';

// Admin dashboard
import AdminOverview      from '@/pages/dashboard/admin/AdminOverview';
import AdminUsers         from '@/pages/dashboard/admin/AdminUsers';
import AdminUserDetail    from '@/pages/dashboard/admin/AdminUserDetail';
import AdminUniversities  from '@/pages/dashboard/admin/AdminUniversities';
import AdminOpportunities from '@/pages/dashboard/admin/AdminOpportunities';
import AdminReviews       from '@/pages/dashboard/admin/AdminReviews';
import AdminForum         from '@/pages/dashboard/admin/AdminForum';

// Guards
const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, role }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!allowedRoles.includes(user.Role?.name)) return <Navigate to="/" replace />;
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
          <Route path="/forum/new"               element={<ForumNewThreadPage />} />
          <Route path="/forum/:slug"             element={<ForumThreadPage />} />
          <Route path="/opportunities"           element={<OpportunitiesPage />} />
          <Route path="/opportunities/:slug"     element={<OpportunityDetail />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/majors"          element={<MajorsPage />} />
          <Route path="/majors/quiz"     element={<MajorQuiz />} />   
          <Route path="/majors/:slug"    element={<MajorDetail />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/auth/callback"   element={<OAuthCallback />} />
          <Route path="/auth/error"      element={<OAuthErrorPage />} />
        </Route>

        {/* ── Student dashboard ── */}
        <Route path="/dashboard" element={
          <PrivateRoute>
              <DashboardLayout role="student" />
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
          <Route path="opportunities"  element={<OwnerOpportunities />} />
          <Route path="gallery"        element={<OwnerGallery />} />
          <Route path="faculties"      element={<OwnerFaculties />} />
          <Route path="news"           element={<OwnerNews />} />
          <Route path="faq"            element={<OwnerFAQ />} />
        </Route>

        {/* ── Organization dashboard ── */}
        <Route path="/organization" element={
          <PrivateRoute>
            <RoleRoute role="organization">
              <DashboardLayout role="organization" />
            </RoleRoute>
          </PrivateRoute>
        }>
          <Route index element={<OrganizationProfile />} />
          <Route path="opportunities" element={<OrganizationOpportunities />} />
        </Route>

        {/* ── Admin dashboard ── */}
        <Route path="/admin" element={
          <PrivateRoute>
            <RoleRoute role="admin">
              <DashboardLayout role="admin" />
            </RoleRoute>
          </PrivateRoute>
        }>
          <Route index                  element={<AdminOverview />} />
          <Route path="users"           element={<AdminUsers />} />
          <Route path="users/:id"       element={<AdminUserDetail />} />
          <Route path="universities"    element={<AdminUniversities />} />
          <Route path="opportunities"   element={<AdminOpportunities />} />
          <Route path="reviews"         element={<AdminReviews />} />
          <Route path="forum"           element={<AdminForum />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
