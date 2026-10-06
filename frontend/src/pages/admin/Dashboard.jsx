import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { Spinner } from '../../components';
import { 
  FolderKanban, Code2, Briefcase, Award, FileText, MessageSquare, Activity 
} from 'lucide-react';

const STAT_CARDS = [
  { labelKey: 'admin_dashboard_stat_projects', key: 'projects', icon: FolderKanban, color: 'bg-blue-500', to: '/admin/projects' },
  { labelKey: 'admin_dashboard_stat_skills', key: 'skills', icon: Code2, color: 'bg-emerald-500', to: '/admin/skills' },
  { labelKey: 'admin_dashboard_stat_experience', key: 'experience', icon: Briefcase, color: 'bg-amber-500', to: '/admin/experience' },
  { labelKey: 'admin_dashboard_stat_certificates', key: 'certificates', icon: Award, color: 'bg-purple-500', to: '/admin/certificates' },
  { labelKey: 'admin_dashboard_stat_blog', key: 'blog', icon: FileText, color: 'bg-rose-500', to: '/admin/blog' },
  { labelKey: 'admin_dashboard_stat_messages', key: 'messages', icon: MessageSquare, color: 'bg-cyan-500', to: '/admin/messages' },
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const fetchMessages = async () => {
          try {
            return await api.get('/api/admin/messages');
          } catch {
            return await api.get('/api/contact/admin/messages');
          }
        };

        const endpoints = [
          api.get('/api/projects'),
          api.get('/api/skills'),
          api.get('/api/experience'),
          api.get('/api/certificates'),
          api.get('/api/blog'),
          fetchMessages(),
        ];
        const results = await Promise.all(endpoints);
        const messages = results[5].data?.data || [];
        const unreadCount = messages.filter(m => !m.read).length;

        setStats({
          projects: results[0].data?.data?.length || 0,
          skills: results[1].data?.data?.length || 0,
          experience: results[2].data?.data?.length || 0,
          certificates: results[3].data?.data?.length || 0,
          blog: results[4].data?.data?.length || 0,
          messages: messages.length,
          unreadMessages: unreadCount,
        });
      } catch {
        setError(t('admin_dashboard_error'));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [t]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="text-center py-12 text-red-500">{error}</div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-(--text-main)">
          {t('admin_dashboard_title')}
        </h1>
        <p className="text-(--text-muted) mt-1 text-sm">
          {t('admin_dashboard_subtitle')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map(({ labelKey, key, icon: Icon, color, to }) => (
          <Link 
            key={key} 
            to={to}
            className="bg-(--bg-surface) rounded-2xl border border-(--border-main) p-5 hover:shadow-lg hover:border-emerald-500/40 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono font-medium text-(--text-muted)">{t(labelKey)}</p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-3xl font-heading font-extrabold text-(--text-main)">
                    {stats?.[key] ?? 0}
                  </span>
                  {key === 'messages' && (stats?.unreadMessages ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {stats.unreadMessages} {t('messages_unread_badge')}
                    </span>
                  )}
                </div>
              </div>
              <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-sm`}>
                <Icon size={22} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-(--bg-surface) rounded-2xl border border-(--border-main) p-6">
        <h2 className="text-base font-heading font-semibold text-(--text-main) mb-4 flex items-center gap-2">
          <Activity size={18} className="text-emerald-500" />
          {t('admin_dashboard_quick_actions')}
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {STAT_CARDS.slice(0, -1).map(({ labelKey, key, icon: Icon, to }) => (
            <Link 
              key={key} 
              to={to}
              className="flex items-center gap-2 px-3.5 py-2 bg-(--bg-surface-muted) rounded-xl text-xs font-mono font-medium text-(--text-main) hover:bg-emerald-500/10 hover:text-(--primary) border border-(--border-main) hover:border-emerald-500/30 transition-all"
            >
              <Icon size={15} />
              {t('admin_dashboard_manage', { label: t(labelKey) })}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
