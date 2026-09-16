'use client';

import { useAvisoExtension } from '@/hooks/useAvisoExtension';

const EXTENSION_URL =
  'https://chromewebstore.google.com/detail/pulso-uf-y-d%C3%B3lar/opakpmmcepebnccjjkhkgioopeadgihp';

export function ExtensionBanner() {
  const { cerrado, cerrarAviso } = useAvisoExtension();

  if (cerrado) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded border border-accent/30 bg-accent-soft px-4 py-3 sm:flex-nowrap">
      <p className="text-sm text-foreground">
        ¿Prefieres ver el dólar y la UF sin abrir el navegador? Instala la extensión{' '}
        <a
          href={EXTENSION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent underline underline-offset-2 hover:text-accent-strong focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Pulso UF y Dólar
        </a>
        .
      </p>
      <button
        type="button"
        onClick={cerrarAviso}
        aria-label="Cerrar aviso"
        title="Cerrar aviso"
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-pill text-foreground-secondary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
