import { useTranslation } from 'react-i18next';
import { Globe, ExternalLink, Mail } from 'lucide-react';

const SOCIAL_LINKS = [
  { icon: Globe, href: 'https://github.com/MohamedNagahSamol', label: 'GitHub' },
  { icon: ExternalLink, href: 'https://linkedin.com/in/mohamednagahsamol', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:mohamednagahsamol1@gmail.com', label: 'Email' },
];

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-(--border-main) bg-(--bg-surface)">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Bio / info */}
          <div className="text-center md:text-left">
            <p className="text-sm text-(--text-muted) max-w-md leading-relaxed">
              {t('footer_bio')}
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-(--text-muted) hover:text-(--primary) hover:bg-(--bg-surface-muted) transition-colors"
                aria-label={label}
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-(--border-main) text-center">
          <p className="text-xs text-(--text-muted)">
            &copy; {year} {t('footer_copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
