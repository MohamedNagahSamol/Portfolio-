import { useTranslation } from 'react-i18next';
import { Server, Layout, Terminal, Sparkles, Database, Cpu } from 'lucide-react';

export default function ProjectMockup({ category = 'fullstack', title = 'Project Mockup' }) {
  const { t } = useTranslation();
  const cat = String(category || '').toLowerCase();

  return (
    <div className="w-full h-full relative overflow-hidden bg-linear-to-br from-slate-900 via-stone-900 to-emerald-950/70 select-none flex flex-col justify-between p-3 border border-white/5 group-hover:border-emerald-500/30 transition-colors">
      {/* Ambient background glow & cyber grid */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '12px 12px'
        }}
      />

      {/* Top Header / Status Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400/80 shadow-xs" />
          <span className="w-2 h-2 rounded-full bg-yellow-400/80 shadow-xs" />
          <span className="w-2 h-2 rounded-full bg-emerald-400/80 shadow-xs" />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-semibold tracking-wider uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          {cat === 'backend' ? t('mockup_api_engine') : cat === 'frontend' ? t('mockup_client_ui') : cat === 'simple' ? t('mockup_micro_app') : t('mockup_full_stack')}
        </div>
      </div>

      {/* Architecture / Wireframe Body */}
      <div className="relative z-10 my-auto py-1">
        {cat === 'backend' && (
          <div className="space-y-1 font-mono text-[10px]">
            <div className="flex items-center gap-1.5 text-emerald-400/90">
              <Server size={12} className="text-emerald-400 shrink-0" />
              <span className="text-white/60">GET</span>
              <span className="truncate">/api/v1/resource</span>
              <span className="ml-auto text-[9px] px-1 py-0.2 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-500/30">200 OK</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-400">
              <Database size={12} className="text-cyan-400 shrink-0" />
              <span className="truncate text-white/50">pool.query(&quot;SELECT * FROM data&quot;)</span>
              <span className="ml-auto text-[9px] text-stone-500">2ms</span>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <div className="h-1 flex-1 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-4/5" />
              </div>
              <span className="text-[9px] text-emerald-400/70">{t('mockup_uptime')}</span>
            </div>
          </div>
        )}

        {cat === 'frontend' && (
          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="flex items-center justify-between text-cyan-400/90">
              <span className="flex items-center gap-1">
                <Layout size={12} className="text-cyan-400 shrink-0" />
                <span className="text-white/80">&lt;Layout /&gt;</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-cyan-950/80 text-cyan-300 rounded border border-cyan-500/30">Vite + React</span>
            </div>
            {/* UI Mockup Blocks */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/[0.03] border border-white/5 rounded-md">
              <div className="h-4 rounded bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[8px] text-cyan-300">{t('mockup_wireframe_nav')}</div>
              <div className="h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[8px] text-white/40">{t('mockup_wireframe_hero')}</div>
              <div className="h-4 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[8px] text-emerald-300">{t('mockup_wireframe_grid')}</div>
            </div>
          </div>
        )}

        {cat === 'fullstack' && (
          <div className="space-y-1 font-mono text-[10px]">
            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-1.5">
                <Cpu size={12} className="text-emerald-400 shrink-0" />
                <span className="text-white/80 font-medium">{t('mockup_pipeline')}</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950/60 text-emerald-300 rounded border border-emerald-500/30">{t('mockup_synced')}</span>
            </div>
            <div className="flex items-center justify-between gap-1 text-[9px] text-white/60 py-0.5">
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{t('mockup_client_ui')}</span>
              <span className="text-emerald-400 font-bold">⇄</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">{t('mockup_api_gateway')}</span>
              <span className="text-emerald-400 font-bold">⇄</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">MongoDB</span>
            </div>
          </div>
        )}

        {cat !== 'backend' && cat !== 'frontend' && cat !== 'fullstack' && (
          <div className="space-y-1 font-mono text-[10px]">
            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-1.5">
                <Terminal size={12} className="text-emerald-400 shrink-0" />
                <span className="text-white/80">core.service.ts</span>
              </span>
              <Sparkles size={11} className="text-emerald-400" />
            </div>
            <div className="p-1.5 rounded bg-black/40 border border-white/5 text-[9px] text-emerald-300/80">
              <code>$ build --optimized &amp;&amp; deploy</code>
            </div>
          </div>
        )}
      </div>

      {/* Footer Title Pill */}
      <div className="relative z-10 flex items-center justify-between pt-1 border-t border-white/5">
        <span className="text-[10px] font-mono font-medium text-stone-300 truncate max-w-[75%]">
          {title}
        </span>
        <span className="text-[9px] font-mono text-emerald-400/70 tracking-tight">
          v1.0.0
        </span>
      </div>
    </div>
  );
}
