import type { Metadata } from 'next';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import { INDICADOR_CODIGOS } from '@/types/indicador';

export const metadata: Metadata = {
  title: 'Dashboard mindicador.cl — Vista general',
  description: 'Vista general de los indicadores economicos de Chile en tiempo real.',
};

export default function Home() {
  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Indicadores Chile
          </h1>
          <p className="mono text-xs text-foreground-muted">mindicador.cl</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono text-2xs text-foreground-muted">Actualizado: —</span>
          <Button variant="secondary">Favoritos</Button>
          <Button variant="secondary">Conversor</Button>
        </div>
      </header>

      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Todos los indicadores</h2>
          <p className="text-xs text-foreground-muted">
            {INDICADOR_CODIGOS.length} indicadores · datos de prueba estaticos
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
          {INDICADOR_CODIGOS.map((codigo) => (
            <div
              key={codigo}
              className="rounded border border-border bg-surface p-4"
              aria-label={`placeholder-${codigo}`}
            >
              <Skeleton className="mb-3 h-3 w-16" />
              <Skeleton className="h-7 w-24" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
