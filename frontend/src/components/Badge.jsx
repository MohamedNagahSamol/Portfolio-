const variantClasses = {
  primary:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  secondary:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  success:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  danger:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function Badge({ variant = 'primary', children }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant] || variantClasses.primary}`}
    >
      {children}
    </span>
  );
}
