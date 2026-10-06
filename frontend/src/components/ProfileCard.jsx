import { useTranslation } from 'react-i18next';

export default function ProfileCard() {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-stone-900/60 backdrop-blur-xl border border-stone-200/80 dark:border-emerald-500/20 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-500">
      {/* ── Ambient Card Aurora ── */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* ── Card Header: Availability & Location ── */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          {t('about_status_available')}
        </div>
        <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500 font-medium">
          {t('about_profile_location')}
        </span>
      </div>

      {/* ── Center Stage: Layered Dual Orbit Avatar ── */}
      <div className="relative flex items-center justify-center my-8 py-6 select-none">
        {/* Outer Orbit (Dashed Emerald) */}
        <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-full border border-dashed border-emerald-500/30 dark:border-emerald-500/40 animate-[spin_25s_linear_infinite] absolute pointer-events-none" />

        {/* Inner Counter Orbit (Dotted Indigo) */}
        <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-dotted border-indigo-500/30 dark:border-indigo-400/30 animate-[spin_18s_linear_infinite_reverse] absolute pointer-events-none" />

        {/* Central Monogram Core */}
        <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-(--bg-surface) to-indigo-500/15 border-2 border-emerald-500/40 dark:border-emerald-400/50 backdrop-blur-xl shadow-lg shadow-emerald-500/10 flex flex-col items-center justify-center group-hover:scale-105 group-hover:border-emerald-400 transition-all duration-300">
          <span className="text-4xl sm:text-5xl font-heading font-extrabold bg-gradient-to-br from-emerald-600 via-teal-500 to-indigo-600 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300 bg-clip-text text-transparent tracking-wider">
            MN
          </span>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold tracking-widest mt-0.5">
            DEV.ENG
          </span>
        </div>

        {/* ── Floating Micro Tech Chips ── */}
        <span className="absolute top-0 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-stone-100/95 dark:bg-stone-800/95 border border-emerald-500/30 text-stone-700 dark:text-stone-300 shadow-sm animate-bounce [animation-duration:3s]">
          React 19
        </span>
        <span className="absolute bottom-0 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-stone-100/95 dark:bg-stone-800/95 border border-indigo-500/30 text-stone-700 dark:text-stone-300 shadow-sm animate-bounce [animation-duration:3.6s]">
          Node.js
        </span>
        <span className="absolute top-2 left-0 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-stone-100/95 dark:bg-stone-800/95 border border-sky-500/30 text-stone-700 dark:text-stone-300 shadow-sm animate-bounce [animation-duration:4.2s]">
          TypeScript
        </span>
        <span className="absolute bottom-2 right-0 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-stone-100/95 dark:bg-stone-800/95 border border-emerald-500/30 text-stone-700 dark:text-stone-300 shadow-sm animate-bounce [animation-duration:4.8s]">
          MongoDB
        </span>
      </div>

      {/* ── Card Footer: Identity & Subtitle ── */}
      <div className="text-center mt-2 relative z-10">
        <h3 className="text-lg font-heading font-bold text-(--text-main)">
          {t('hero_name')}
        </h3>
        <p className="text-xs font-mono text-(--text-muted) mt-0.5">
          {t('about_profile_role')}
        </p>
      </div>

      {/* ── Card Status Bar (Bottom) ── */}
      <div className="mt-5 pt-3 border-t border-stone-200 dark:border-stone-800/80 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400 relative z-10">
        <span>stack: mern+ts</span>
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          git: active
        </span>
      </div>
    </div>
  );
}
