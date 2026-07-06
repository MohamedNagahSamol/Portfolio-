import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, Tag } from 'lucide-react';
import api from '../api';
import { Spinner } from '../components';

export default function Blog() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/blog')
      .then(({ data }) => data.success ? setPosts(data.data) : setError(data.message))
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <section id="blog" className="py-24 sm:py-32 flex justify-center"><Spinner size="lg" /></section>;
  if (error) return <section id="blog" className="py-24 sm:py-32 text-center text-red-500">{error}</section>;

  return (
    <section id="blog" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="font-mono text-sm text-(--primary)">{'// '}{t('section_blog')}</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight mt-2">{t('section_blog')}</h2>
            <p className="mt-4 text-(--text-muted) max-w-2xl">{t('blog_subtitle')}</p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post, i) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-(--border-main) bg-(--bg-surface) group hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-heading font-bold group-hover:text-(--primary) transition-colors">
                  {post.title[lang]}
                </h3>
                <p className="mt-3 text-sm text-(--text-muted) leading-relaxed">{post.excerpt[lang]}</p>
                
              {post.publishedAt && (
                <div className="mt-4 flex items-center gap-4 text-xs text-(--text-muted)">
                  <Calendar size={14} />
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded bg-(--primary)/10 text-(--primary) font-mono">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              )}

              {post.externalUrl && (
                <a href={post.externalUrl} target="_blank" rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-(--primary) hover:underline">
                  {t('blog_read_more')} <ExternalLink size={14} />
                </a>
              )}
            </motion.article>
          ))}
        </div>
        {posts.length === 0 && (
          <div className="mt-12 text-center py-12 border-2 border-dashed border-(--border-main) rounded-2xl">
            <p className="text-(--text-muted)">No articles yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
