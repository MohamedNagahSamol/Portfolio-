import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ProfileCard from '../components/ProfileCard';
import CounterCard from '../components/CounterCard';

/* ─── Stat data with icon definitions ─── */
const STATS = [
  { valueKey: 'about_stat_1_value', labelKey: 'about_stat_1_label', icon: 'Calendar' },
  { valueKey: 'about_stat_2_value', labelKey: 'about_stat_2_label', icon: 'FolderGit2' },
  { valueKey: 'about_stat_3_value', labelKey: 'about_stat_3_label', icon: 'Cpu' },
  { valueKey: 'about_stat_4_value', labelKey: 'about_stat_4_label', icon: 'Sparkles' },
];

/* ─── Framer Motion Animation Variants ─── */
const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.1 } },
};

export default function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header (Code-comment Style) ── */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <span className="font-mono text-sm text-(--primary) tracking-wide">
            {'// '}{t('section_about')}
          </span>
        </motion.div>

        {/* ── 2-Column Responsive Layout: Bio & Profile Card ── */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Bio Narrative Column (7 cols) */}
          <motion.div
            className="lg:col-span-7 lg:order-1"
            variants={contentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-(--text-main)">
              {t('about_heading')}
            </h2>
            <div className="mt-6 space-y-4 text-base sm:text-lg text-(--text-muted) leading-relaxed">
              <p>{t('about_bio_p1')}</p>
              <p>{t('about_bio_p2')}</p>
            </div>

            {/* Architectural Highlights */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-(--border-main) bg-(--bg-surface) flex items-start gap-3 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <div>
                  <h4 className="font-heading font-semibold text-sm text-(--text-main)">
                    {t('about_highlight_clean_code')}
                  </h4>
                  <p className="text-xs text-(--text-muted) mt-0.5 leading-normal">
                    {t('about_highlight_clean_code_desc')}
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-(--border-main) bg-(--bg-surface) flex items-start gap-3 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                <div>
                  <h4 className="font-heading font-semibold text-sm text-(--text-main)">
                    {t('about_highlight_realtime')}
                  </h4>
                  <p className="text-xs text-(--text-muted) mt-0.5 leading-normal">
                    {t('about_highlight_realtime_desc')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Interactive Profile Card Column (5 cols) */}
          <motion.div
            className="lg:col-span-5 flex justify-center lg:justify-end lg:order-2"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <ProfileCard />
          </motion.div>
        </div>

        {/* ── Animated Counter Cards Grid ── */}
        <div className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((stat, idx) => (
            <CounterCard
              key={stat.valueKey}
              value={t(stat.valueKey)}
              label={t(stat.labelKey)}
              icon={stat.icon}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
