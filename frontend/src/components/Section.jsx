export default function Section({ id, title, subtitle, children, className = '' }) {
  return (
    <section id={id} className={className}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center">{title}</h2>
        {subtitle && (
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-center max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
