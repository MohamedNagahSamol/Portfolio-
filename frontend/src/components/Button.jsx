const variantClasses = {
  primary:
    'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
  secondary:
    'bg-[var(--secondary)] text-white hover:bg-[var(--secondary-hover)]',
  outline:
    'border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white',
};

const baseClasses =
  'inline-flex items-center justify-center px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 dark:focus:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed';

export default function Button({ variant = 'primary', children, className = '', ...props }) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
