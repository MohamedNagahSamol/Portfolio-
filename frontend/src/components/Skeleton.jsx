export default function Skeleton({ width = '100%', height = '20px', rounded = true, className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${rounded ? 'rounded-md' : ''} ${className}`}
      style={{ width, height }}
    />
  );
}
