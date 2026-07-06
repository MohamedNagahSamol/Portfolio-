import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GitBranch, Database, Layout, Settings } from 'lucide-react';


function techLabel(t, tech) {
  const key = 'tech_' + tech.toLowerCase().replace(/[^a-z0-9]/g, '');
  return t(key) !== key ? t(key) : tech;
}

export default function ProjectCard({ project }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8 }}
      className="group rounded-xl border border-(--border-main) overflow-hidden bg-(--bg-surface) shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Window Chrome */}
      <div className="flex items-center justify-between px-3 py-2 bg-(--bg-surface-muted) border-b border-(--border-main)">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-2 text-[11px] font-mono text-(--text-muted)">
            {project.title.en.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.tsx
          </span>
        </div>
        <div className="text-[9px] font-mono text-(--text-muted)">
          {project.category}
        </div>
      </div>

      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title[lang]} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-(--bg-surface) to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-heading font-bold text-(--text-main) group-hover:text-(--primary) transition-colors">
            {project.title[lang]}
          </h3>
          <p className="mt-1.5 text-sm text-(--text-muted) leading-relaxed line-clamp-2">
            {project.description[lang]}
          </p>
        </div>

        {/* Stack Badges */}
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <span key={s} className="px-1.5 py-0.5 text-[9px] rounded bg-[var(--primary)]/10 text-[var(--primary)] font-mono border border-[var(--primary)]/20">
              {techLabel(t, s)}
            </span>
          ))}
        </div>

        {/* Conditional Links */}
        <div className="flex flex-wrap gap-2 pt-3">
          {project.links.github && (
            <a 
              href={project.links.github} 
              target="_blank" 
              rel="noreferrer" 
              className="p-1.5 rounded-lg border border-(--border-main) hover:bg-(--primary) hover:text-white transition-all" 
              title={t('project_github')}
              aria-label={`${t('project_github')} for ${project.title[lang]}`}
            >
              <GitBranch size={16} />
            </a>
          )}
          {project.links.frontend && (
            <a 
              href={project.links.frontend} 
              target="_blank" 
              rel="noreferrer" 
              className="p-1.5 rounded-lg border border-(--border-main) hover:bg-(--primary) hover:text-white transition-all" 
              title={t('project_live')}
              aria-label={`${t('project_live')} for ${project.title[lang]}`}
            >
              <Layout size={16} />
            </a>
          )}
          {project.links.backend && (
            <a 
              href={project.links.backend} 
              target="_blank" 
              rel="noreferrer" 
              className="p-1.5 rounded-lg border border-(--border-main) hover:bg-(--primary) hover:text-white transition-all" 
              title={t('project_api')}
              aria-label={`${t('project_api')} for ${project.title[lang]}`}
            >
              <Database size={16} />
            </a>
          )}
          {project.links.admin && (
            <a 
              href={project.links.admin} 
              target="_blank" 
              rel="noreferrer" 
              className="p-1.5 rounded-lg border border-(--border-main) hover:bg-(--primary) hover:text-white transition-all" 
              title={t('project_admin')}
              aria-label={`${t('project_admin')} for ${project.title[lang]}`}
            >
              <Settings size={16} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
