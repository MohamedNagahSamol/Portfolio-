import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GitBranch, Database, Settings, ExternalLink } from 'lucide-react';
import ProjectMockup from './ProjectMockup';
import TechIcon from './TechIcon';

function techLabel(t, tech) {
  const key = 'tech_' + tech.toLowerCase().replace(/[^a-z0-9]/g, '');
  return t(key) !== key ? t(key) : tech;
}

export default function ProjectCard({ project }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -6 }}
      className="group rounded-2xl border border-(--border-main) overflow-hidden bg-(--bg-surface) dark:bg-stone-900/60 backdrop-blur-sm shadow-sm hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Window Chrome Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-(--bg-surface-muted) border-b border-(--border-main)">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            <span className="ms-2 text-[11px] font-mono text-(--text-muted)">
              {project.title.en.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.tsx
            </span>
          </div>
          <div className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-(--bg-surface) border border-(--border-main) text-(--text-muted)">
            {t('projects_' + project.category)}
          </div>
        </div>

        {/* Thumbnail or Generative Fallback Mockup */}
        <div className="relative h-40 overflow-hidden bg-slate-950">
          {!project.image || imgError ? (
            <ProjectMockup category={project.category} title={project.title[lang]} />
          ) : (
            <>
              <img 
                src={project.image} 
                alt={project.title[lang]} 
                loading="lazy"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-(--bg-surface) to-transparent opacity-60 pointer-events-none" />
            </>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-lg font-heading font-bold text-(--text-main) group-hover:text-(--primary) transition-colors">
              {project.title[lang]}
            </h3>
            <p className="mt-1.5 text-sm text-(--text-muted) leading-relaxed line-clamp-2">
              {project.description[lang]}
            </p>
          </div>

          {/* Micro Tech Stack Badges with TechIcon */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.stack?.map((s, idx) => (
              <span 
                key={`${project._id || 'proj'}-${s}-${idx}`} 
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded-md bg-(--primary)/10 text-(--primary) border border-(--primary)/20 hover:border-emerald-500/40 transition-colors"
              >
                <TechIcon name={s} className="w-3 h-3 shrink-0" />
                <span>{techLabel(t, s)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Prominent Action Buttons Bar */}
      <div className="p-5 pt-0">
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-(--border-main)/60">
          {project.links?.frontend && (
            <a 
              href={project.links.frontend} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all group/btn" 
              title={t('project_live')}
              aria-label={`${t('project_live')}: ${project.title[lang]}`}
            >
              <ExternalLink size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
              <span>{t('project_live')}</span>
            </a>
          )}
          {project.links?.github && (
            <a 
              href={project.links.github} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-(--border-main) bg-(--bg-surface) hover:bg-(--bg-surface-muted) hover:border-emerald-500/40 text-(--text-main) hover:text-(--primary) shadow-xs hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all" 
              title={t('project_github')}
              aria-label={`${t('project_github')}: ${project.title[lang]}`}
            >
              <GitBranch size={13} />
              <span>{t('project_github')}</span>
            </a>
          )}
          {project.links?.backend && (
            <a 
              href={project.links.backend} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-(--border-main) bg-(--bg-surface)/60 hover:bg-(--bg-surface-muted) hover:border-cyan-500/40 text-(--text-muted) hover:text-cyan-500 transition-all" 
              title={t('project_api')}
              aria-label={`${t('project_api')}: ${project.title[lang]}`}
            >
              <Database size={13} />
              <span>{t('project_api')}</span>
            </a>
          )}
          {project.links?.admin && (
            <a 
              href={project.links.admin} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-(--border-main) bg-(--bg-surface)/60 hover:bg-(--bg-surface-muted) hover:border-purple-500/40 text-(--text-muted) hover:text-purple-500 transition-all" 
              title={t('project_admin')}
              aria-label={`${t('project_admin')}: ${project.title[lang]}`}
            >
              <Settings size={13} />
              <span>{t('project_admin')}</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
