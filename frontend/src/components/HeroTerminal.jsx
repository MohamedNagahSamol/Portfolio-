import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, GitBranch, Terminal as TerminalIcon } from 'lucide-react';

const CODE_SNIPPETS = {
  developer: `interface SoftwareEngineer {
  name: string;
  role: string;
  location: string;
  availability: string;
  focus: string[];
}

const developer: SoftwareEngineer = {
  name: "Mohamed Nagah",
  role: "Full-Stack Software Engineer",
  location: "Menoufia, Egypt (Remote)",
  availability: "Available for projects",
  focus: [
    "Scalable MERN Architecture",
    "Real-Time Systems & WebSockets",
    "Prisma ORM & PostgreSQL/MongoDB",
    "Type-Safe Clean APIs"
  ]
};`,
  stack: `{
  "frontend": [
    "React 19",
    "Tailwind CSS v4",
    "Vite",
    "Framer Motion",
    "i18next"
  ],
  "backend": [
    "Node.js",
    "Express.js",
    "RESTful Architecture",
    "JWT Authentication"
  ],
  "database": [
    "MongoDB & Mongoose",
    "Prisma ORM",
    "Data Modeling"
  ],
  "realtime": [
    "Socket.io",
    "Bi-directional Events"
  ]
}`,
  terminal: `$ mohamed-cli --status
✔ System Kernel: Online
✔ Architecture: MERN Stack + TypeScript
✔ Databases: MongoDB / Prisma Synchronized
✔ Test Suite: 100% Green Automation
✔ Git Working Tree: Clean

$ echo "Let's build something extraordinary together."`
};

export default function HeroTerminal() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('developer');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(CODE_SNIPPETS[activeTab]);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      dir="ltr"
      className="w-full max-w-lg lg:max-w-none rounded-2xl border border-stone-200 dark:border-emerald-500/25 bg-white/80 dark:bg-stone-950/90 backdrop-blur-xl shadow-2xl shadow-stone-200/50 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden font-mono text-xs transition-all duration-300"
    >
      {/* ── macOS Window Chrome Header ── */}
      <div className="h-10 px-4 bg-stone-100/90 dark:bg-stone-900/90 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between select-none">
        {/* Traffic Light Window Dots */}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors shadow-xs" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors shadow-xs" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors shadow-xs" />
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-stone-200/60 dark:bg-stone-800/60 p-0.5 rounded-lg border border-stone-300/40 dark:border-stone-700/40">
          <button
            type="button"
            onClick={() => setActiveTab('developer')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'developer'
                ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            {t('hero_terminal_tab_dev')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stack')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'stack'
                ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            {t('hero_terminal_tab_stack')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'terminal'
                ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            {t('hero_terminal_tab_sh')}
          </button>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? t('hero_terminal_copied') : t('hero_terminal_copy')}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-stone-500 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-400 transition-colors"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-500 font-semibold">{t('hero_terminal_copied')}</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span className="text-[10px] hidden sm:inline">{t('hero_terminal_copy')}</span>
            </>
          )}
        </button>
      </div>

      {/* ── Syntax-Highlighted Code Viewer ── */}
      <div className="p-4 sm:p-5 overflow-x-auto text-[11px] sm:text-xs leading-relaxed max-h-80 min-h-64 flex flex-col justify-between">
        {activeTab === 'developer' && (
          <pre className="font-mono text-stone-800 dark:text-stone-200">
            <code>
              <span className="text-purple-600 dark:text-purple-400">interface</span> <span className="text-sky-600 dark:text-sky-400 font-semibold">SoftwareEngineer</span> &#123;{'\n'}
              {'  '}<span className="text-stone-700 dark:text-stone-300">name</span>: <span className="text-purple-600 dark:text-purple-400">string</span>;{'\n'}
              {'  '}<span className="text-stone-700 dark:text-stone-300">role</span>: <span className="text-purple-600 dark:text-purple-400">string</span>;{'\n'}
              {'  '}<span className="text-stone-700 dark:text-stone-300">location</span>: <span className="text-purple-600 dark:text-purple-400">string</span>;{'\n'}
              {'  '}<span className="text-stone-700 dark:text-stone-300">availability</span>: <span className="text-purple-600 dark:text-purple-400">string</span>;{'\n'}
              {'  '}<span className="text-stone-700 dark:text-stone-300">focus</span>: <span className="text-purple-600 dark:text-purple-400">string</span>[];{'\n'}
              &#125;{'\n\n'}
              <span className="text-purple-600 dark:text-purple-400">const</span> <span className="text-amber-600 dark:text-amber-400">developer</span>: <span className="text-sky-600 dark:text-sky-400">SoftwareEngineer</span> = &#123;{'\n'}
              {'  '}name: <span className="text-emerald-600 dark:text-emerald-400">&quot;Mohamed Nagah&quot;</span>,{'\n'}
              {'  '}role: <span className="text-emerald-600 dark:text-emerald-400">&quot;Full-Stack Software Engineer&quot;</span>,{'\n'}
              {'  '}location: <span className="text-emerald-600 dark:text-emerald-400">&quot;Egypt (Remote)&quot;</span>,{'\n'}
              {'  '}availability: <span className="text-emerald-600 dark:text-emerald-400">&quot;Available for projects&quot;</span>,{'\n'}
              {'  '}focus: [{'\n'}
              {'    '}<span className="text-emerald-600 dark:text-emerald-400">&quot;Scalable MERN Architecture&quot;</span>,{'\n'}
              {'    '}<span className="text-emerald-600 dark:text-emerald-400">&quot;Real-Time Systems &amp; WebSockets&quot;</span>,{'\n'}
              {'    '}<span className="text-emerald-600 dark:text-emerald-400">&quot;Type-Safe Clean Code&quot;</span>{'\n'}
              {'  '}]{'\n'}
              &#125;;
            </code>
          </pre>
        )}

        {activeTab === 'stack' && (
          <pre className="font-mono text-stone-800 dark:text-stone-200">
            <code>
              &#123;{'\n'}
              {'  '}<span className="text-indigo-600 dark:text-indigo-400">&quot;frontend&quot;</span>: [<span className="text-emerald-600 dark:text-emerald-400">&quot;React 19&quot;</span>, <span className="text-emerald-600 dark:text-emerald-400">&quot;Tailwind v4&quot;</span>, <span className="text-emerald-600 dark:text-emerald-400">&quot;Vite&quot;</span>],{'\n'}
              {'  '}<span className="text-indigo-600 dark:text-indigo-400">&quot;backend&quot;</span>: [<span className="text-emerald-600 dark:text-emerald-400">&quot;Node.js&quot;</span>, <span className="text-emerald-600 dark:text-emerald-400">&quot;Express&quot;</span>, <span className="text-emerald-600 dark:text-emerald-400">&quot;JWT Auth&quot;</span>],{'\n'}
              {'  '}<span className="text-indigo-600 dark:text-indigo-400">&quot;databases&quot;</span>: [<span className="text-emerald-600 dark:text-emerald-400">&quot;MongoDB&quot;</span>, <span className="text-emerald-600 dark:text-emerald-400">&quot;Prisma ORM&quot;</span>],{'\n'}
              {'  '}<span className="text-indigo-600 dark:text-indigo-400">&quot;realtime&quot;</span>: [<span className="text-emerald-600 dark:text-emerald-400">&quot;Socket.io&quot;</span>, <span className="text-emerald-600 dark:text-emerald-400">&quot;WebSockets&quot;</span>],{'\n'}
              {'  '}<span className="text-indigo-600 dark:text-indigo-400">&quot;testing&quot;</span>: [<span className="text-emerald-600 dark:text-emerald-400">&quot;Postman&quot;</span>, <span className="text-emerald-600 dark:text-emerald-400">&quot;Jest&quot;</span>, <span className="text-emerald-600 dark:text-emerald-400">&quot;Automation&quot;</span>]{'\n'}
              &#125;
            </code>
          </pre>
        )}

        {activeTab === 'terminal' && (
          <div className="font-mono space-y-1.5 text-stone-800 dark:text-stone-200">
            <div className="flex items-center gap-1.5 text-stone-500">
              <TerminalIcon size={12} className="text-emerald-500" />
              <span>mohamed-cli --status</span>
            </div>
            <div className="ps-4 space-y-1 text-[11px]">
              <p className="text-emerald-600 dark:text-emerald-400">✔ Kernel: Node.js + Express Online</p>
              <p className="text-emerald-600 dark:text-emerald-400">✔ Architecture: MERN + Prisma Sync</p>
              <p className="text-emerald-600 dark:text-emerald-400">✔ Test Suite: 100% Green Automation</p>
              <p className="text-emerald-600 dark:text-emerald-400">✔ Git Tree: Clean (0 uncommitted)</p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span>$ echo &quot;Ready to collaborate.&quot;</span>
              <span className="w-1.5 h-3.5 bg-emerald-500 inline-block animate-pulse align-middle" />
            </div>
          </div>
        )}
      </div>

      {/* ── Status Bar (Bottom) ── */}
      <div className="h-8 px-4 bg-stone-100/90 dark:bg-stone-900/90 border-t border-stone-200 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 select-none">
        <div className="flex items-center gap-2">
          <GitBranch size={12} className="text-emerald-500" />
          <span>git:({t('hero_terminal_branch')})</span>
          <span className="text-stone-300 dark:text-stone-700">|</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {t('hero_terminal_status')}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span>UTF-8</span>
          <span className="hidden sm:inline">TypeScript</span>
        </div>
      </div>
    </div>
  );
}
