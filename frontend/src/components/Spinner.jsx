const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-(--primary) border-t-transparent ${sizeClasses[size] || sizeClasses.md} ${className}`}
    />
  );
}

export function SpinnerPage({ size = 'lg', className = '' }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size={size} className={className} />
    </div>
  );
}
