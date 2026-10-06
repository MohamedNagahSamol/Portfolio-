import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Terminal, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import HeroTerminal from '../components/HeroTerminal';

/* ─── Framer Motion Variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function Hero() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleScroll = (e, id) => {
    e.preventDefault();
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const coreStack = ['React 19', 'Node.js', 'Express', 'MongoDB', 'Prisma', 'Socket.io', 'TypeScript'];

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden pt-20 pb-16 lg:py-24"
    >
      {/* ── Ambient Radial Aurora Glow Mesh ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
        {/* Emerald Aura Orb (Top-Start) */}
        <div className="absolute -top-24 -start-24 sm:-start-32 w-80 sm:w-96 lg:w-[32rem] h-80 sm:h-96 lg:h-[32rem] rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 blur-3xl animate-pulse" />
        
        {/* Indigo Aura Orb (Center-End) */}
        <div className="absolute top-1/3 -end-24 sm:-end-32 w-72 sm:w-96 lg:w-[28rem] h-72 sm:h-96 lg:h-[28rem] rounded-full bg-indigo-500/15 dark:bg-indigo-500/20 blur-3xl animate-pulse delay-1000" />
        
        {/* Cyber Dot Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.09]"
          style={{
            backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-(--bg-base)/50 to-(--bg-base) pointer-events-none" />
      </div>

      {/* ── 12-Column Responsive Layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 xl:gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ── Left Column: Narrative & CTAs (7 cols) ── */}
          <motion.div className="lg:col-span-7 flex flex-col justify-center text-start">
            {/* Eyebrow & Live Availability Badge */}
            <motion.div variants={itemVariants} className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
                <Terminal size={14} className="text-emerald-500 shrink-0" />
                {t('hero_badge_portfolio')}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-stone-100 dark:bg-stone-900/90 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {t('hero_status_available')}
              </span>
            </motion.div>

            {/* Developer Name */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-extrabold tracking-tight leading-none text-(--text-main)"
            >
              {t('hero_name')}
            </motion.h1>

            {/* Gradient Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-3 sm:mt-4 text-2xl sm:text-3xl lg:text-4xl font-heading font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-400 bg-clip-text text-transparent"
            >
              {t('hero_title')}
            </motion.p>

            {/* Tagline */}
            <motion.p
              variants={itemVariants}
              className="mt-5 text-base sm:text-lg text-(--text-muted) max-w-xl leading-relaxed"
            >
              {t('hero_tagline')}
            </motion.p>

            {/* Core Stack Micro Chips */}
            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-mono text-(--text-muted) me-1 font-medium">
                {t('hero_quick_stack')}:
              </span>
              {coreStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-(--bg-surface-muted) text-(--text-muted) border border-(--border-main) hover:border-emerald-500/40 hover:text-(--text-main) transition-colors"
                >
                  {tech}
                </span>
              ))}
            </motion.div>

            {/* Action CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap gap-4 items-center"
            >
              <Button
                variant="primary"
                onClick={(e) => handleScroll(e, '#projects')}
                className="gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
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

          {/* ── Right Column: Interactive HeroTerminal (5 cols) ── */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 w-full flex justify-center lg:justify-end"
          >
            <HeroTerminal />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
