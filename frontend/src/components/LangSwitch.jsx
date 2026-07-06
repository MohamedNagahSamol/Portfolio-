import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LangSwitch() {
  const { i18n } = useTranslation();

  const isAr = i18n.language.startsWith('ar');

  const toggle = () => {
    i18n.changeLanguage(isAr ? 'en' : 'ar');
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-(--border-main) bg-(--bg-surface) text-(--text-main) hover:bg-(--bg-surface-muted) transition-colors"
      aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <Globe size={14} />
      <span>{isAr ? 'EN' : 'AR'}</span>
    </button>
  );
}
