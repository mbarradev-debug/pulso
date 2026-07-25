interface VariationBadgeProps {
  value: number;
  size?: 'default' | 'lg';
  className?: string;
}

export function VariationBadge({ value, size = 'default', className = '' }: VariationBadgeProps) {
  const trend = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const arrow = value > 0 ? '↑' : value < 0 ? '↓' : '–';
  const magnitude = Math.abs(value).toFixed(2);

  const trendClasses: Record<typeof trend, string> = {
    up: 'bg-up-bg text-up',
    down: 'bg-down-bg text-down',
    flat: 'bg-flat-bg text-flat',
  };

  const sizeClasses = size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`mono inline-flex items-center gap-1 rounded-pill font-semibold ${trendClasses[trend]} ${sizeClasses} ${className}`}
    >
      {arrow} {magnitude}%
    </span>
  );
}
