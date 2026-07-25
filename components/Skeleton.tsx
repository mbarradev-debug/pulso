interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function Skeleton({ width, height, className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-surface-2 ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}
