import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = 'Mohamed Nagah — Full Stack Developer',
  description = 'Full stack developer portfolio showcasing projects, skills, and experience in building scalable web applications.',
  path = '/'
}) {
  const siteUrl = 'https://mohamednagah.dev';
  const fullUrl = `${siteUrl}${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content="Mohamed Nagah" />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Mohamed Nagah Portfolio" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}
