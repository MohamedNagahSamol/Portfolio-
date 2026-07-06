import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Cpu, Layers } from 'lucide-react';
import { Badge, Spinner } from '../components';
import api from '../api';

const CATEGORIES = [
  { id: 'frontend', label: 'skills_cat_frontend', icon: Code2 },
  { id: 'backend', label: 'skills_cat_backend', icon: Cpu },
  { id: 'tools', label: 'skills_cat_tools', icon: Layers },
];

export default function Skills() {
  const { t } = useTranslation();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const { data } = await api.get('/api/skills');
        if (data.success) {
          setSkills(data.data);
        } else {
          setError(data.message || 'Failed to fetch skills');
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError('Network error while fetching skills');
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

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
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-mono text-sm text-(--primary)">
            {'// '}{t('section_skills')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mt-2">
            {t('section_skills')}
          </h2>
          <p className="mt-4 text-(--text-muted) max-w-2xl leading-relaxed">
            {t('skills_subtitle')}
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="mt-16 space-y-12">
          {CATEGORIES.map((cat) => {
            const catSkills = skills.filter((s) => s.category === cat.id);
            if (catSkills.length === 0) return null;

            const Icon = cat.icon;

            return (
              <div key={cat.id} className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-(--border-main)">
                  <Icon size={20} className="text-(--primary)" />
                  <h3 className="text-xl font-heading font-semibold">
                    {t(cat.label)}
                  </h3>
                </div>

                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                  <AnimatePresence>
                    {catSkills.map((skill) => (
                      <motion.div
                        key={skill._id}
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          visible: { opacity: 1, scale: 1 }
                        }}
                        whileHover={{ y: -5, borderColor: 'var(--primary)' }}
                        className="p-4 rounded-xl border border-(--border-main) bg-(--bg-surface) transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-medium text-(--text-main) group-hover:text-(--primary) transition-colors">
                            {skill.name}
                          </span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {skill.category}
                          </Badge>
                        </div>
                        {/* Subtle code-style detail */}
                        <div className="mt-2 text-[10px] font-mono text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity">
                          const skill = '{skill.name}';
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
