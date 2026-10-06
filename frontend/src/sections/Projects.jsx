import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../components/Spinner';
import ProjectCard from '../components/ProjectCard';
import api from '../api';

const FILTERS = [
  { id: 'all', label: 'projects_all' },
  { id: 'backend', label: 'projects_backend' },
  { id: 'frontend', label: 'projects_frontend' },
  { id: 'fullstack', label: 'projects_fullstack' },
  { id: 'simple', label: 'projects_simple' },
];

export default function Projects() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data } = await api.get('/api/projects');
        if (data.success) {
          setProjects(data.data);
        } else {
          setError(data.message || t('error_fetch_projects'));
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(t('common_network_error'));
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [t]);

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter((p) => p.category === activeFilter);

  if (loading) {
    return (
      <section id="projects" className="py-24 sm:py-32 flex justify-center">
        <Spinner size="lg" />
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="py-24 sm:py-32 flex justify-center">
        <div className="text-center p-8 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 text-sm text-red-500 underline hover:text-red-600"
          >
            {t('common_try_again')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-mono text-sm text-(--primary)">
            {'// '}{t('section_projects')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mt-2 text-(--text-main)">
            {t('section_projects')}
          </h2>
          <p className="mt-4 text-(--text-muted) max-w-2xl leading-relaxed">
            {t('projects_subtitle')}
          </p>
        </motion.div>

        {/* Filter Tabs with Sliding Pill */}
        <div className="mt-10 flex flex-wrap gap-2 p-1.5 bg-(--bg-surface-muted) w-fit rounded-2xl border border-(--border-main)">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            const count = filter.id === 'all' 
              ? projects.length 
              : projects.filter((p) => p.category === filter.id).length;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200 z-10 flex items-center gap-2 ${
                  isActive 
                    ? 'text-(--primary) font-semibold' 
                    : 'text-(--text-muted) hover:text-(--text-main)'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="projectFilterPill"
                    className="absolute inset-0 bg-(--bg-surface) rounded-xl shadow-xs border border-emerald-500/30 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span>{t(filter.label)}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-(--primary)/10 text-(--primary) font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <motion.div 
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <ProjectCard key={project._id || `proj-${idx}`} project={project} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && (
          <div className="mt-20 text-center py-20 border-2 border-dashed border-(--border-main) rounded-3xl">
            <p className="text-(--text-muted)">{t('projects_empty')}</p>
          </div>
        )}
      </div>
    </section>
  );
}
