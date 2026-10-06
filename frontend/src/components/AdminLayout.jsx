import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LangSwitch from './LangSwitch';
import ThemeToggle from './ThemeToggle';
import api from '../api';
import { 
  LayoutDashboard, FolderKanban, Code2, Briefcase, Award, 
  FileText, MessageSquare, LogOut, Menu, X, ChevronLeft
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', labelKey: 'admin_nav_dashboard', icon: LayoutDashboard },
  { to: '/admin/projects', labelKey: 'admin_nav_projects', icon: FolderKanban },
  { to: '/admin/skills', labelKey: 'admin_nav_skills', icon: Code2 },
  { to: '/admin/experience', labelKey: 'admin_nav_experience', icon: Briefcase },
  { to: '/admin/certificates', labelKey: 'admin_nav_certificates', icon: Award },
  { to: '/admin/blog', labelKey: 'admin_nav_blog', icon: FileText },
  { to: '/admin/messages', labelKey: 'admin_nav_messages', icon: MessageSquare },
];

export default function AdminLayout({ children }) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/api/admin/messages');
        if (data.success && isMounted) {
          const unread = (data.data || []).filter(m => !m.read).length;
          setUnreadCount(unread);
        }
      } catch {
        try {
          const { data } = await api.get('/api/contact/admin/messages');
          if (data.success && isMounted) {
            const unread = (data.data || []).filter(m => !m.read).length;
            setUnreadCount(unread);
          }
        } catch {
          // ignore error if unauthenticated or offline
        }
      }
    };

    fetchUnread();
    const handleUpdate = () => fetchUnread();
    window.addEventListener('messages-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('messages-updated', handleUpdate);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-(--bg-base) text-(--text-main)">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 start-0 z-50 w-64 bg-(--bg-surface) border-e border-(--border-main) transform transition-transform duration-200 flex flex-col justify-between ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0 rtl:lg:translate-x-0'
      }`}>
        <div>
          <div className="flex items-center justify-between p-4 border-b border-(--border-main)">
            <Link to="/" className="text-lg font-heading font-bold text-emerald-600 dark:text-emerald-400">
              {t('admin_brand')}
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)} 
              aria-label={t('admin_close_sidebar')}
              className="lg:hidden p-1.5 rounded-lg hover:bg-(--bg-surface-muted) text-(--text-muted) hover:text-(--text-main)"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link 
                  key={to} 
                  to={to} 
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold shadow-xs' 
                      : 'text-(--text-muted) hover:text-(--text-main) hover:bg-(--bg-surface-muted)'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{t(labelKey)}</span>
                  {to === '/admin/messages' && unreadCount > 0 && (
                    <span className="ms-auto px-2 py-0.5 text-[11px] font-mono font-bold rounded-full bg-emerald-500 text-white shadow-xs shadow-emerald-500/30 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-3 border-t border-(--border-main)">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={18} /> {t('admin_logout')}
          </button>
          <Link 
            to="/" 
            className="mt-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-(--text-muted) hover:text-(--text-main) hover:bg-(--bg-surface-muted) transition-all"
          >
            <ChevronLeft size={18} className="rtl:rotate-180 transition-transform" /> {t('admin_back_to_site')}
          </Link>
          <div className="flex items-center justify-between px-3 py-2 mt-2 pt-2 border-t border-(--border-main)">
            <LangSwitch />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden flex items-center justify-between p-4 bg-(--bg-surface) border-b border-(--border-main)">
          <span className="font-heading font-bold text-emerald-600 dark:text-emerald-400">{t('admin_title')}</span>
          <button 
            onClick={() => setSidebarOpen(true)} 
            aria-label={t('admin_open_sidebar')}
            className="p-1.5 rounded-lg hover:bg-(--bg-surface-muted) text-(--text-muted) hover:text-(--text-main)"
          >
            <Menu size={22} />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
