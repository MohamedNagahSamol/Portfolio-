import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import LangSwitch from './LangSwitch';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { key: 'nav_home', href: '#home' },
  { key: 'nav_about', href: '#about' },
  { key: 'nav_skills', href: '#skills' },
  { key: 'nav_projects', href: '#projects' },
  { key: 'nav_experience', href: '#experience' },
  { key: 'nav_certificates', href: '#certificates' },
  { key: 'nav_blog', href: '#blog' },
  { key: 'nav_contact', href: '#contact' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu when language changes
const prevLang = useRef(i18n.language);

useEffect(() => {
  if (prevLang.current !== i18n.language) {
    setMobileOpen(false);
    prevLang.current = i18n.language;
  }
}, [i18n.language]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-(--bg-base)/90 backdrop-blur-md shadow-sm border-b border-(--border-main)'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="text-xl font-heading font-bold tracking-tight text-(--text-main) hover:text-(--primary) transition-colors"
          >
            Portfolio
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className="px-3 py-2 text-sm font-medium text-(--text-muted) hover:text-(--text-main) transition-colors rounded-lg hover:bg-(--bg-surface-muted)"
              >
                {t(key)}
              </a>
            ))}
          </div>

          {/* Right group */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <LangSwitch />
              <ThemeToggle />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-(--text-muted) hover:text-(--text-main) hover:bg-(--bg-surface-muted) transition-colors"
              aria-label={mobileOpen ? t('nav_close') : t('nav_menu')}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-(--border-main) bg-(--bg-base)">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-1">
            {NAV_LINKS.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className="block px-3 py-2 text-sm font-medium text-(--text-muted) hover:text-(--text-main) hover:bg-(--bg-surface-muted) rounded-lg transition-colors"
              >
                {t(key)}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-3 border-t border-(--border-main)">
              <LangSwitch />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
