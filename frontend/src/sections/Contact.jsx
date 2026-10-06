import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock 
} from 'lucide-react';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import TechIcon from '../components/TechIcon';
import api from '../api';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const contactEmail = 'mohamednagahsamol1@gmail.com';

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCopyEmail = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(contactEmail);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ type: null, message: '' });

    try {
      const { data } = await api.post('/api/contact', form);
      if (data.success) {
        setStatus({ type: 'success', message: t('contact_success') });
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.message || t('contact_error') });
      }
    } catch {
      setStatus({ type: 'error', message: t('contact_error') });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-mono text-sm text-(--primary)">{'// '}{t('section_contact')}</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mt-2 text-(--text-main)">
            {t('section_contact')}
          </h2>
          <p className="mt-4 text-(--text-muted) max-w-2xl leading-relaxed">
            {t('contact_subtitle')}
          </p>
        </motion.div>

        {/* 2-Column Responsive Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 items-start mt-12">
          {/* Left Column: Direct Contact Hub (5 cols) */}
          <motion.div 
            className="lg:col-span-5 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Live Availability Beacon Card */}
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {t('contact_status_available')}
                </span>
              </div>
              <p className="mt-2 text-xs text-(--text-muted) leading-relaxed">
                {t('contact_hub_subtitle')}
              </p>
            </div>

            {/* Interactive Email Card */}
            <div className="p-5 rounded-2xl border border-(--border-main) bg-(--bg-surface)/90 dark:bg-stone-900/60 backdrop-blur-md shadow-sm hover:border-emerald-500/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-mono text-(--text-muted) block">
                    {t('contact_quick_reach')}
                  </span>
                  <span className="text-sm font-mono font-medium text-(--text-main) truncate block">
                    {contactEmail}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-(--border-main)/60">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-medium border border-(--border-main) bg-(--bg-surface-muted) hover:border-emerald-500/40 hover:text-(--primary) transition-all"
                  aria-label={copied ? t('contact_email_copied_tooltip') : t('contact_copy_email')}
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t('contact_copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>{t('contact_copy_email')}</span>
                    </>
                  )}
                </button>
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-medium bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm shadow-emerald-500/20 transition-all"
                  title={t('contact_send_direct')}
                >
                  <ExternalLink size={14} />
                  <span>{t('contact_send_direct')}</span>
                </a>
              </div>
            </div>

            {/* Social Profile Cards (GitHub & LinkedIn) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://github.com/MohamedNagahSamol"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl border border-(--border-main) bg-(--bg-surface)/80 dark:bg-stone-900/50 backdrop-blur-sm hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-(--bg-surface-muted) border border-(--border-main) flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <TechIcon name="github" className="w-5 h-5 text-(--text-main)" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-mono font-semibold text-(--text-main) group-hover:text-(--primary) transition-colors truncate">
                    {t('contact_github_profile')}
                  </h4>
                  <span className="text-[11px] font-mono text-(--text-muted) truncate block">
                    @MohamedNagahSamol
                  </span>
                </div>
              </a>

              <a
                href="https://www.linkedin.com/in/mohamed-nagah-7b8971279"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl border border-(--border-main) bg-(--bg-surface)/80 dark:bg-stone-900/50 backdrop-blur-sm hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform shrink-0">
                  <ExternalLink size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-mono font-semibold text-(--text-main) group-hover:text-indigo-500 transition-colors truncate">
                    {t('contact_linkedin_profile')}
                  </h4>
                  <span className="text-[11px] font-mono text-(--text-muted) truncate block">
                    Mohamed Nagah
                  </span>
                </div>
              </a>
            </div>

            {/* 24h SLA Assurance Card */}
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-(--border-main)/60 bg-(--bg-surface)/40 text-xs font-mono text-(--text-muted)">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t('contact_sla_text')}</span>
            </div>
          </motion.div>

          {/* Right Column: Glassmorphic Contact Form (7 cols) */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-6 sm:p-8 lg:p-10 rounded-3xl border border-(--border-main) dark:border-emerald-500/20 bg-(--bg-surface)/80 dark:bg-stone-900/60 backdrop-blur-xl shadow-xl relative overflow-hidden">
              {/* Top Accent Gradient Line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 opacity-70" />

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-mono font-medium text-(--text-muted) mb-1.5">
                    {t('contact_name')}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    placeholder={t('contact_name_placeholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-(--border-main) bg-(--bg-surface) text-(--text-main) placeholder:text-(--text-muted)/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-sans text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-mono font-medium text-(--text-muted) mb-1.5">
                    {t('contact_email')}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    placeholder={t('contact_email_placeholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-(--border-main) bg-(--bg-surface) text-(--text-main) placeholder:text-(--text-muted)/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-sans text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-mono font-medium text-(--text-muted) mb-1.5">
                    {t('contact_message')}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder={t('contact_message_placeholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-(--border-main) bg-(--bg-surface) text-(--text-main) placeholder:text-(--text-muted)/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-none font-sans text-sm"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={sending} 
                  className="w-full gap-2 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
                >
                  {sending ? (
                    <>
                      <Spinner size="sm" />
                      <span>{t('contact_sending')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('contact_send')}</span>
                      <Send size={16} />
                    </>
                  )}
                </Button>

                {status.type && (
                  <div className={`flex items-center gap-2.5 p-4 rounded-xl text-sm ${
                    status.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30' 
                      : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-500/30'
                  }`}>
                    {status.type === 'success' ? <CheckCircle size={18} className="shrink-0 text-emerald-500" /> : <AlertCircle size={18} className="shrink-0 text-red-500" />}
                    <span>{status.message}</span>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
