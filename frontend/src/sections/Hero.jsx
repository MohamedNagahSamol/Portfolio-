import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Terminal, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

/* ─── Framer Motion Variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/* ─── Stat Variant ─── */

export default function Hero() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleScroll = (e, id) => {
    e.preventDefault();
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col pt-16"
    >
      {/* ── Main Content ── */}
      <motion.div
        className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow — code-file badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-(--primary)/10 text-(--primary) border border-(--primary)/20">
            <Terminal size={14} />
            portfolio
          </span>
        </motion.div>

        {/* Name — identity data, not translatable */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-none text-(--text-main)"
        >
          {lang === 'ar' ? 'محمد نجاح' : 'Mohamed Nagah'}
        </motion.h1>

        {/* Title — gradient for visual distinction */}
        <motion.p
          variants={itemVariants}
          className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-heading font-bold tracking-tight bg-linear-to-r from-(--primary) to-(--secondary) bg-clip-text text-transparent"
        >
          {t('hero_title')}
        </motion.p>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-lg text-(--text-muted) max-w-2xl leading-relaxed"
        >
          {t('hero_tagline')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Button
            variant="primary"
            onClick={(e) => handleScroll(e, '#projects')}
            className="gap-2"
          >
            {t('hero_cta_projects')}
            <ArrowIcon size={18} />
          </Button>
          <Button
            variant="outline"
            onClick={(e) => handleScroll(e, '#contact')}
            className="gap-2"
          >
            {t('hero_cta_contact')}
          </Button>
        </motion.div>
      </motion.div>

      {/* ── Signature Element: VS Code‑style Status Bar ── */}

    </section>
  );
}
