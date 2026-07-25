'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md rounded border border-border bg-surface p-8">
        <h2 className="text-lg font-semibold text-foreground">Algo salio mal</h2>
        <p className="mt-2 text-sm text-foreground-secondary">
          Ocurrio un error inesperado al cargar esta pagina. Puedes intentar nuevamente.
        </p>
        {error.digest && (
          <p className="mono mt-3 text-2xs text-foreground-secondary">Codigo: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 rounded bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none hover:bg-accent-strong"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
