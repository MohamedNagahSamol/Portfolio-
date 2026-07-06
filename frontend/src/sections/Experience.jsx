import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Spinner } from '../components';
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
          setError(data.message || 'Failed to fetch experience');
        }
      } catch (err) {
        console.error('Error fetching experience:', err);
        setError('Network error while fetching experience');
      } finally {
        setLoading(false);
      }
    }
    fetchExperience();
  }, []);

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
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="experience" className="py-24 sm:py-32">
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
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mt-2">
            {t('section_experience')}
          </h2>
          <p className="mt-4 text-(--text-muted) max-w-2xl leading-relaxed">
            {t('experience_subtitle')}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="mt-16 relative">
          {/* Vertical Line */}
          <motion.div 
            className={`absolute top-0 bottom-0 w-px bg-(--border-main) ${isRTL ? 'right-8 lg:right-1/2' : 'left-8 lg:left-1/2'}`}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{ originY: 0 }}
          />

          <div className="space-y-12 relative">
            {experiences.map((exp, index) => (
              <motion.div 
                key={exp._id} 
                className={`relative flex items-center justify-between gap-8 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Content Block */}
                <div className={`w-full lg:w-5/12 p-6 rounded-2xl border border-(--border-main) bg-(--bg-surface) shadow-sm transition-shadow hover:shadow-md ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-heading font-bold text-(--text-main)">
                      {exp.title[lang]}
                    </h3>
                    <div className="text-sm font-medium text-(--primary)">
                      {exp.organization[lang]}
                    </div>
                    <div className="text-xs font-mono text-(--text-muted) mt-1">
                      {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} — {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : t('experience_present')}
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-(--text-muted) leading-relaxed">
                    {exp.description[lang]}
                  </p>
                </div>

                {/* Timeline Point */}
                <div className={`absolute ${isRTL ? 'right-8 lg:right-1/2' : 'left-8 lg:left-1/2'} ${isRTL ? '-translate-x-1/2' : 'translate-x-1/2'} translate-y-1/2 z-10`}>
                  <div className="w-4 h-4 rounded-full bg-(--bg-base) border-4 border-(--primary)" />
                </div>

                {/* Empty space for the other side of the timeline in desktop */}
                <div className="hidden lg:block lg:w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
