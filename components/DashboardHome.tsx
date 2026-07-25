'use client';

import { Button } from '@/components/Button';
import { IndicatorCard } from '@/components/IndicatorCard';
import { Skeleton } from '@/components/Skeleton';
import { useIndicadores } from '@/hooks/useIndicadores';
import { formatFecha } from '@/lib/format';
import { INDICADOR_CODIGOS } from '@/types/indicador';

export function DashboardHome() {
  const { data, isLoading, error } = useIndicadores();

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
          <span className="mono text-2xs text-foreground-muted">
            Actualizado: {data ? formatFecha(data.fecha) : '—'}
          </span>
          <Button variant="secondary">Favoritos</Button>
          <Button variant="secondary">Conversor</Button>
        </div>
      </header>

      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Todos los indicadores</h2>
          <p className="text-xs text-foreground-muted">{INDICADOR_CODIGOS.length} indicadores</p>
        </div>

        {error && !data ? (
          <p className="rounded border border-border bg-surface p-4 text-sm text-foreground-secondary">
            No se pudieron cargar los indicadores. Intenta recargar la pagina en unos momentos.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
            {INDICADOR_CODIGOS.map((codigo) =>
              isLoading && !data ? (
                <div key={codigo} className="rounded border border-border bg-surface p-4">
                  <Skeleton className="mb-3 h-3 w-16" />
                  <Skeleton className="h-7 w-24" />
                </div>
              ) : (
                <IndicatorCard
                  key={codigo}
                  codigo={codigo}
                  indicador={data?.[codigo]}
                  error={!data?.[codigo]}
                />
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}
