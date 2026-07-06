import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ExternalLink, GraduationCap } from 'lucide-react';
import api from '../api';
import { Spinner } from '../components';

export default function Certificates() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/certificates')
      .then(({ data }) => data.success ? setCertificates(data.data) : setError(data.message))
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <section id="certificates" className="py-24 sm:py-32 flex justify-center"><Spinner size="lg" /></section>;
  if (error) return <section id="certificates" className="py-24 sm:py-32 text-center text-red-500">{error}</section>;

  return (
    <section id="certificates" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="font-mono text-sm text-(--primary)">{'// '}{t('section_certificates')}</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mt-2">{t('section_certificates')}</h2>
          <p className="mt-4 text-(--text-muted) max-w-2xl">{t('certificates_subtitle')}</p>
        </motion.div>

        {/* Academic Background */}
        <div className="mt-16 p-6 rounded-2xl border border-(--border-main) bg-(--bg-surface)">
          <div className="flex items-center gap-3">
            <GraduationCap size={24} className="text-(--primary)" />
            <div>
              <h3 className="text-xl font-heading font-bold">{t('certificates_edu_title')}</h3>
              <p className="text-sm text-(--text-muted)">{t('certificates_edu_degree')}</p>
              <p className="text-sm font-medium text-(--primary)">{t('certificates_edu_school')}</p>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, i) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border border-(--border-main) bg-(--bg-surface) group hover:shadow-md transition-all"
            >
              <h3 className="font-heading font-semibold">{cert.title[lang]}</h3>
              <p className="mt-2 text-sm text-(--text-muted)">{t('certificates_issuer')}: {cert.issuer}</p>
              {cert.date && (
                <p className="mt-1 text-xs font-mono text-(--text-muted)">
                  {new Date(cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </p>
              )}
              {cert.credentialUrl && (
                <a href={cert.credentialUrl} target="_blank" rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-(--primary) hover:underline">
                  <ExternalLink size={14} /> {t('certificates_credential')}
                </a>
              )}
            </motion.div>
          ))}
        </div>
        {certificates.length === 0 && (
          <div className="mt-12 text-center py-12 border-2 border-dashed border-(--border-main) rounded-2xl">
            <p className="text-(--text-muted)">No certificates yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
