import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { Spinner } from '../../components';
import { 
  FolderKanban, Code2, Briefcase, Award, FileText, MessageSquare, Activity 
} from 'lucide-react';

const STAT_CARDS = [
  { label: 'Projects', key: 'projects', icon: FolderKanban, color: 'bg-blue-500', to: '/admin/projects' },
  { label: 'Skills', key: 'skills', icon: Code2, color: 'bg-emerald-500', to: '/admin/skills' },
  { label: 'Experience', key: 'experience', icon: Briefcase, color: 'bg-amber-500', to: '/admin/experience' },
  { label: 'Certificates', key: 'certificates', icon: Award, color: 'bg-purple-500', to: '/admin/certificates' },
  { label: 'Blog Posts', key: 'blog', icon: FileText, color: 'bg-rose-500', to: '/admin/blog' },
  { label: 'Messages', key: 'messages', icon: MessageSquare, color: 'bg-cyan-500', to: '/admin/messages' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoints = [
          api.get('/api/projects'),
          api.get('/api/skills'),
          api.get('/api/experience'),
          api.get('/api/certificates'),
          api.get('/api/blog'),
          api.get('/api/contact/admin/messages'),
        ];
        const results = await Promise.all(endpoints);
        setStats({
          projects: results[0].data.data.length,
          skills: results[1].data.data.length,
          experience: results[2].data.data.length,
          certificates: results[3].data.data.length,
          blog: results[4].data.data.length,
          messages: results[5].data.data.length,
        });
      } catch {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
        <h1 className="text-2xl font-heading font-bold text-stone-900 dark:text-white">Dashboard</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1">Overview of your portfolio content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map(({ label, key, icon: Icon, color, to }) => (
          <Link key={key} to={to}
            className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-800 p-5 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
                <p className="text-3xl font-bold text-stone-900 dark:text-white mt-1">
                  {stats?.[key] ?? 0}
                </p>
              </div>
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-heading font-semibold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity size={20} className="text-emerald-500" />
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {STAT_CARDS.slice(0, -1).map(({ label, key, icon: Icon, to }) => (
            <Link key={key} to={to}
              className="flex items-center gap-2 px-4 py-2 bg-stone-50 dark:bg-slate-800 rounded-lg text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">
              <Icon size={16} />
              Manage {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
