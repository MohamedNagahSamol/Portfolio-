import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { Calendar, FolderGit2, Cpu, Sparkles } from 'lucide-react';

const ICON_MAP = {
  Calendar,
  FolderGit2,
  Cpu,
  Sparkles,
};

export default function CounterCard({ value = '0', label = '', icon = 'Sparkles', index = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayCount, setDisplayCount] = useState(0);

  // Extract numeric portion and suffix (e.g., '14+' -> target: 14, suffix: '+')
  const numericTarget = parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0;
  const suffix = String(value).replace(/[0-9]/g, '');

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, numericTarget, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayCount(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [isInView, numericTarget]);

  const IconComponent = ICON_MAP[icon] || Sparkles;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative p-6 rounded-2xl bg-white/70 dark:bg-stone-900/60 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-300 shadow-sm hover:shadow-xl group overflow-hidden"
    >
      {/* ── Top Gradient Accent Border ── */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* ── Metric Icon Container ── */}
      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
        <IconComponent size={20} />
      </div>

      {/* ── Animated Counter Number ── */}
      <div className="text-3xl sm:text-4xl font-heading font-extrabold text-(--text-main) tracking-tight">
        <span>{displayCount}</span>
        <span className="text-emerald-600 dark:text-emerald-400 ms-0.5">{suffix}</span>
      </div>

      {/* ── Metric Label ── */}
      <div className="mt-1.5 text-xs sm:text-sm font-medium text-(--text-muted)">
        {label}
      </div>
    </motion.div>
  );
}
