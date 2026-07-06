import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components';
import api from '../api';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
    <section id="contact" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="font-mono text-sm text-(--primary)">{'// '}{t('section_contact')}</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mt-2">{t('section_contact')}</h2>
          <p className="mt-4 text-(--text-muted) max-w-2xl">{t('contact_subtitle')}</p>
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">{t('contact_name')}</label>
              <input
                type="text" name="name" value={form.name} onChange={handleChange} required
                placeholder={t('contact_name_placeholder')}
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-main) bg-(--bg-surface) focus:outline-none focus:ring-2 focus:ring-(--primary) transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('contact_email')}</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder={t('contact_email_placeholder')}
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-main) bg-(--bg-surface) focus:outline-none focus:ring-2 focus:ring-(--primary) transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('contact_message')}</label>
              <textarea
                name="message" value={form.message} onChange={handleChange} required rows={5}
                placeholder={t('contact_message_placeholder')}
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-main) bg-(--bg-surface) focus:outline-none focus:ring-2 focus:ring-(--primary) transition-all resize-none"
              />
            </div>
            <Button type="submit" disabled={sending} className="w-full gap-2">
              {sending ? t('contact_sending') : t('contact_send')}
              {sending ? null : <Send size={18} />}
            </Button>

            {status.type && (
              <div className={`flex items-center gap-2 p-4 rounded-xl text-sm ${
                status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {status.message}
              </div>
            )}
          </motion.form>

          {/* Direct Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-bold">{t('contact_info_title')}</h3>
            <a href={`mailto:${t('contact_info_email')}`}
              className="flex items-center gap-3 p-4 rounded-xl border border-(--border-main) bg-(--bg-surface) hover:border-(--primary) transition-all group">
              <Mail size={20} className="text-(--primary)" />
              <span className="text-sm group-hover:text-(--primary) transition-colors">mohamednagahsamol1@gmail.com</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
