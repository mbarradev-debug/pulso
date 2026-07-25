'use client';

import { useMemo } from 'react';
import { Button } from '@/components/Button';
import { IndicatorCard } from '@/components/IndicatorCard';
import { Skeleton } from '@/components/Skeleton';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useIndicadores } from '@/hooks/useIndicadores';
import { formatFecha } from '@/lib/format';
import { INDICADOR_CODIGOS } from '@/types/indicador';

export function DashboardHome() {
  const { data, isLoading, error } = useIndicadores();
  const { favoritos } = useFavoritos();

  const codigosOrdenados = useMemo(() => {
    const favSet = new Set(favoritos);
    const favs = INDICADOR_CODIGOS.filter((codigo) => favSet.has(codigo));
    const resto = INDICADOR_CODIGOS.filter((codigo) => !favSet.has(codigo));
    return [...favs, ...resto];
  }, [favoritos]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Indicadores Chile
          </h1>
          <p className="mono text-xs text-foreground-muted">mindicador.cl</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="mono text-2xs text-foreground-muted">
            Actualizado: {data ? formatFecha(data.fecha) : '—'}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 sm:flex-none">
              Favoritos
            </Button>
            <Button variant="secondary" className="flex-1 sm:flex-none">
              Conversor
            </Button>
          </div>
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
          <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
            {codigosOrdenados.map((codigo) =>
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
