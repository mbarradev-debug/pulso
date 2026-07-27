interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className = '', label = 'Actualizando' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block h-3 w-3 animate-spin rounded-full border-2 border-border-strong border-t-accent ${className}`}
    />
  );
}
