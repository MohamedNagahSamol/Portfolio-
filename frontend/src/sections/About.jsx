import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

/* ─── Stat data ─── */
const STATS = [
  { valueKey: 'about_stat_1_value', labelKey: 'about_stat_1_label' },
  { valueKey: 'about_stat_2_value', labelKey: 'about_stat_2_label' },
  { valueKey: 'about_stat_3_value', labelKey: 'about_stat_3_label' },
  { valueKey: 'about_stat_4_value', labelKey: 'about_stat_4_label' },
];

/* ─── Variants ─── */
const headerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const monogramVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.1 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
};

const statsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const statItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

export default function About() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Code‑comment header ── */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <span className="font-mono text-sm text-(--primary)">
            {'// '}{t('section_about')}
          </span>
        </motion.div>

        {/* ── Two‑column layout ── */}
        {/**
         * Desktop (lg+): 5‑column grid
         *   LTR → Content (cols 1‑3 / order-2) | Monogram (cols 4‑5 / order-1)
         *   RTL → Content (cols 1‑3 / order-1) | Monogram (cols 4‑5 / order-2)
         * Mobile (< lg): stacks in DOM order — Content first, Monogram second
         */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Content — first in DOM for mobile priority */}
          <motion.div
            className={`col-span-3 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}
            variants={contentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-(--text-main)">
              {t('about_heading')}
            </h2>
            <div className="mt-6 space-y-4 text-(--text-muted) leading-relaxed">
              <p>{t('about_bio_p1')}</p>
              <p>{t('about_bio_p2')}</p>
            </div>
          </motion.div>

          {/* Monogram — decorative */}
          <motion.div
            className={`col-span-2 flex justify-center ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}
            variants={monogramVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-linear-to-br from-(--primary)/15 to-(--secondary)/15 border-2 border-(--primary)/30 flex items-center justify-center">
              <span className="text-5xl sm:text-6xl font-heading font-bold text-(--primary)">
                MN
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── Stat counters ── */}
        <motion.div
          className="mt-16 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
          variants={statsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {STATS.map(({ valueKey, labelKey }) => (
            <motion.div
              key={valueKey}
              variants={statItemVariants}
              className="rounded-xl border border-(--border-main) bg-(--bg-surface) p-5 text-center transition-shadow hover:shadow-sm"
            >
              <div className="text-3xl sm:text-4xl font-heading font-bold text-(--primary)">
                {t(valueKey)}
              </div>
              <div className="mt-1.5 text-sm text-(--text-muted)">
                {t(labelKey)}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
