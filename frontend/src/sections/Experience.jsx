import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Briefcase, Calendar } from 'lucide-react';
import Spinner from '../components/Spinner';
import { formatMonthYear } from '../utils/date';
import api from '../api';

export default function Experience() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    async function fetchExperience() {
      try {
        const { data } = await api.get('/api/experience');
        if (data.success) {
          setExperiences(data.data);
        } else {
          setError(data.message || t('error_fetch_experience'));
        }
      } catch (err) {
        console.error('Error fetching experience:', err);
        setError(t('common_network_error'));
      } finally {
        setLoading(false);
      }
    }
    fetchExperience();
  }, [t]);

  if (loading) {
    return (
      <section id="experience" className="py-24 sm:py-32 flex justify-center">
        <Spinner size="lg" />
      </section>
    );
  }

  if (error) {
    return (
      <section id="experience" className="py-24 sm:py-32 flex justify-center">
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
    <section id="experience" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-mono text-sm text-(--primary)">
            {'// '}{t('section_experience')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mt-2 text-(--text-main)">
            {t('section_experience')}
          </h2>
          <p className="mt-4 text-(--text-muted) max-w-2xl leading-relaxed">
            {t('experience_subtitle')}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="mt-16 relative">
          {/* Central Gradient Line */}
          <motion.div 
            className={`absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-indigo-500 to-emerald-500/20 ${
              isRTL 
                ? 'right-6 sm:right-8 translate-x-1/2 lg:right-auto lg:left-1/2 lg:-translate-x-1/2' 
                : 'left-6 sm:left-8 -translate-x-1/2 lg:left-1/2 lg:-translate-x-1/2'
            }`}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{ originY: 0 }}
          />

          <div className="space-y-12 relative">
            {experiences.map((exp, index) => {
              const isEven = index % 2 === 0;
              const techStack = Array.isArray(exp.technologies) && exp.technologies.length > 0
                ? exp.technologies
                : Array.isArray(exp.stack) && exp.stack.length > 0
                ? exp.stack
                : ['React', 'Node.js', 'Express', 'MongoDB'];

              const cardContent = (
                <div className="p-6 rounded-2xl border border-(--border-main) bg-(--bg-surface) dark:bg-stone-900/60 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    {/* Company Avatar / Badge */}
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Briefcase size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-heading font-bold text-(--text-main) group-hover:text-(--primary) transition-colors">
                        {exp.title?.[lang] || exp.title?.en || ''}
                      </h3>
                      <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {exp.organization?.[lang] || exp.organization?.en || ''}
                      </div>

                      {/* Locale-Aware Date Range */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-(--bg-surface-muted) text-(--text-muted) border border-(--border-main) mt-2">
                        <Calendar size={12} className="shrink-0 text-emerald-500" />
                        <span>
                          {formatMonthYear(exp.startDate, i18n.language)} — {exp.endDate ? formatMonthYear(exp.endDate, i18n.language) : t('experience_present')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-(--text-muted) leading-relaxed">
                    {exp.description?.[lang] || exp.description?.en || ''}
                  </p>

                  {/* Role Tech Stack Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-(--border-main)/60">
                    {techStack.map((tech, idx) => (
                      <span
                        key={`${exp._id}-${tech}-${idx}`}
                        className="px-2.5 py-0.5 text-xs font-mono rounded-md bg-(--bg-surface-muted) text-(--text-muted) border border-(--border-main) group-hover:border-emerald-500/30 group-hover:text-(--primary) transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );

              return (
                <motion.div 
                  key={exp._id} 
                  className={`relative flex items-center justify-between gap-8 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Slot 1: Starts on start side */}
                  {isEven ? (
                    <div className="w-full ms-14 sm:ms-16 lg:ms-0 lg:w-[calc(50%-2.5rem)] text-start">
                      {cardContent}
                    </div>
                  ) : (
                    <div className="hidden lg:block lg:w-[calc(50%-2.5rem)]" />
                  )}

                  {/* Center Glowing Milestone Beacon */}
                  <div className={`absolute top-8 -translate-y-1/2 z-20 ${
                    isRTL 
                      ? 'right-6 sm:right-8 translate-x-1/2 lg:right-auto lg:left-1/2 lg:-translate-x-1/2' 
                      : 'left-6 sm:left-8 -translate-x-1/2 lg:left-1/2 lg:-translate-x-1/2'
                  }`}>
                    <div className="relative flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-(--bg-surface) border-2 border-emerald-500 dark:border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.45)] flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      </div>
                    </div>
                  </div>

                  {/* Slot 2: Ends on end side */}
                  {!isEven ? (
                    <div className="w-full ms-14 sm:ms-16 lg:ms-0 lg:w-[calc(50%-2.5rem)] text-start">
                      {cardContent}
                    </div>
                  ) : (
                    <div className="hidden lg:block lg:w-[calc(50%-2.5rem)]" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {experiences.length === 0 && (
            <div className="mt-12 text-center py-12 border-2 border-dashed border-(--border-main) rounded-2xl">
              <p className="text-(--text-muted)">{t('experience_empty')}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
