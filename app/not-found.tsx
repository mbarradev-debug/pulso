import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md rounded border border-border bg-surface p-8">
        <h2 className="text-lg font-semibold text-foreground">Pagina no encontrada</h2>
        <p className="mt-2 text-sm text-foreground-secondary">
          La ruta que buscas no existe o fue movida.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
