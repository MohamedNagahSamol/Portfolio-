import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Spinner from './components/Spinner';
import SEO from './components/SEO';
import { Hero, About, Skills, Projects, Experience, Certificates, Blog, Contact } from './sections';
import ProtectedRoute from './components/ProtectedRoute';

const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ContentManager = lazy(() => import('./pages/admin/ContentManager'));
const AdminMessages = lazy(() => import('./pages/admin/Messages'));

/* ── Home Page Layout ── */
function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Certificates />
        <Blog />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}

/* ── App ── */
function App() {
  const { t } = useTranslation();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />

      {/* Admin Login (no layout) */}
      <Route path="/admin/login" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-(--bg-base)"><Spinner size="lg" /></div>}>
          <SEO title={t('admin_seo_login_title')} description={t('admin_seo_login_desc')} />
          <AdminLogin />
        </Suspense>
      } />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-(--bg-base)"><Spinner size="lg" /></div>}>
            <SEO title={t('admin_seo_dashboard_title')} description={t('admin_seo_dashboard_desc')} />
            <AdminLayout><AdminDashboard /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/admin/messages" element={
        <ProtectedRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-(--bg-base)"><Spinner size="lg" /></div>}>
            <SEO title={t('admin_seo_messages_title')} description={t('admin_seo_messages_desc')} />
            <AdminLayout><AdminMessages /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/admin/:type" element={
        <ProtectedRoute>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-(--bg-base)"><Spinner size="lg" /></div>}>
            <SEO title={t('admin_seo_cm_title')} description={t('admin_seo_cm_desc')} />
            <AdminLayout><ContentManager /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
