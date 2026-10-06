import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Code2, Cpu, Wrench } from 'lucide-react';
import Spinner from '../components/Spinner';
import TechIcon from '../components/TechIcon';
import api from '../api';

function techLabel(t, tech) {
  const key = 'tech_' + tech.toLowerCase().replace(/[^a-z0-9]/g, '');
  return t(key) !== key ? t(key) : tech;
}

const CATEGORIES = [
  { id: 'all', label: 'skills_all', icon: Layers },
  { id: 'frontend', label: 'skills_cat_frontend', icon: Code2 },
  { id: 'backend', label: 'skills_cat_backend', icon: Cpu },
  { id: 'tools', label: 'skills_cat_tools', icon: Wrench },
];

export default function Skills() {
  const { t } = useTranslation();
  const [skills, setSkills] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const { data } = await api.get('/api/skills');
        if (data.success) {
          setSkills(data.data);
        } else {
          setError(data.message || t('error_fetch_skills'));
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError(t('common_network_error'));
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, [t]);

  const filteredSkills = activeTab === 'all'
    ? skills
    : skills.filter((s) => s.category === activeTab);

  if (loading) {
    return (
      <section id="skills" className="py-24 sm:py-32 flex justify-center">
        <Spinner size="lg" />
      </section>
    );
  }

  if (error) {
    return (
      <section id="skills" className="py-24 sm:py-32 flex justify-center">
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
    <section id="skills" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-mono text-sm text-(--primary)">
            {'// '}{t('section_skills')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mt-2 text-(--text-main)">
            {t('section_skills')}
          </h2>
          <p className="mt-4 text-(--text-muted) max-w-2xl leading-relaxed">
            {t('skills_subtitle')}
          </p>
        </motion.div>

        {/* Filter Tabs with Sliding Pill */}
        <div className="mt-10 flex flex-wrap items-center gap-2 p-1.5 bg-(--bg-surface-muted) w-fit rounded-2xl border border-(--border-main)">
          {CATEGORIES.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === 'all' 
              ? skills.length 
              : skills.filter((s) => s.category === tab.id).length;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200 flex items-center gap-2 z-10 ${
                  isActive 
                    ? 'text-(--primary) font-semibold' 
                    : 'text-(--text-muted) hover:text-(--text-main)'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="skillFilterTab"
                    className="absolute inset-0 bg-(--bg-surface) rounded-xl shadow-xs border border-emerald-500/30 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <Icon size={16} />
                <span>{t(tab.label)}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-(--primary)/10 text-(--primary) font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Skills Responsive Cyber Grid */}
        <motion.div 
          layout
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill, idx) => (
              <motion.div
                layout
                key={skill._id || `skill-${skill.name}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -4 }}
                className="group relative p-4 rounded-2xl border border-(--border-main) bg-(--bg-surface)/80 dark:bg-stone-900/50 backdrop-blur-sm hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.18)] transition-all duration-300 flex items-center gap-3.5"
              >
                {/* Brand SVG Icon Box */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-(--bg-surface-muted) border border-(--border-main) group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 group-hover:scale-105 transition-all duration-300 shrink-0">
                  <TechIcon name={skill.icon || skill.name} className="w-6 h-6" />
                </div>

                {/* Info & Category Tag */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-mono text-sm font-semibold text-(--text-main) group-hover:text-(--primary) transition-colors truncate">
                      {techLabel(t, skill.name)}
                    </h3>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-(--text-muted)">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-(--bg-surface-muted) border border-(--border-main) text-(--text-muted)">
                      {t('skills_cat_' + skill.category)}
                    </span>
                    <span className="text-[10px] text-(--primary)/70 opacity-0 group-hover:opacity-100 transition-opacity">
                      // {skill.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
