import { Routes, Route } from 'react-router-dom';
import { Navbar, Footer, ScrollToTop } from './components';
import SEO from './components/SEO';
import { Hero, About, Skills, Projects, Experience, Certificates, Blog, Contact } from './sections';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ContentManager from './pages/admin/ContentManager';
import AdminMessages from './pages/admin/Messages';

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
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />

      {/* Admin Login (no layout) */}
      <Route path="/admin/login" element={<>
        <SEO title="Admin Login — Mohamed Nagah" description="Sign in to manage portfolio content." />
        <AdminLogin />
      </>} />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <SEO title="Dashboard — Portfolio Admin" description="Portfolio admin dashboard." />
          <AdminLayout><AdminDashboard /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/messages" element={
        <ProtectedRoute>
          <SEO title="Messages — Portfolio Admin" description="Contact messages inbox." />
          <AdminLayout><AdminMessages /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/:type" element={
        <ProtectedRoute>
          <SEO title="Content Manager — Portfolio Admin" description="Manage portfolio content." />
          <AdminLayout><ContentManager /></AdminLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
