'use client';

interface FavoritesToggleProps {
  activo: boolean;
  onToggle: () => void;
  className?: string;
}

export function FavoritesToggle({ activo, onToggle, className = '' }: FavoritesToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={activo}
      aria-label={activo ? 'Quitar de favoritos' : 'Marcar como favorito'}
      title={activo ? 'Quitar de favoritos' : 'Marcar como favorito'}
      className={`flex min-h-11 min-w-11 items-center justify-center rounded-pill transition-colors ${
        activo ? 'text-accent' : 'text-foreground-muted hover:text-foreground-secondary'
      } ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={activo ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z" />
      </svg>
    </button>
  );
}
