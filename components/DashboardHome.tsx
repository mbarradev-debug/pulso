'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Converter } from '@/components/Converter';
import { HistoryChart } from '@/components/HistoryChart';
import { IndicatorCard } from '@/components/IndicatorCard';
import { Skeleton } from '@/components/Skeleton';
import { Spinner } from '@/components/Spinner';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useIndicadores } from '@/hooks/useIndicadores';
import { formatFecha } from '@/lib/format';
import { INDICADOR_CODIGOS, type IndicadorCodigo } from '@/types/indicador';

export function DashboardHome() {
  const { data, isLoading, isValidating, error } = useIndicadores();
  const { favoritos } = useFavoritos();
  const [indicadorSeleccionado, setIndicadorSeleccionado] = useState<IndicadorCodigo>('dolar');
  const [mostrarConversor, setMostrarConversor] = useState(false);
  const [soloFavoritos, setSoloFavoritos] = useState(false);

  const codigosOrdenados = useMemo(() => {
    const favSet = new Set(favoritos);
    const favs = INDICADOR_CODIGOS.filter((codigo) => favSet.has(codigo));
    const resto = INDICADOR_CODIGOS.filter((codigo) => !favSet.has(codigo));
    return [...favs, ...resto];
  }, [favoritos]);

  const codigosVisibles = useMemo(
    () =>
      soloFavoritos
        ? codigosOrdenados.filter((codigo) => favoritos.includes(codigo))
        : codigosOrdenados,
    [soloFavoritos, codigosOrdenados, favoritos],
  );

  const totalIndicadores = soloFavoritos ? codigosVisibles.length : INDICADOR_CODIGOS.length;

  const [soloFavoritosAnterior, setSoloFavoritosAnterior] = useState(soloFavoritos);
  if (soloFavoritos !== soloFavoritosAnterior) {
    setSoloFavoritosAnterior(soloFavoritos);
    if (
      soloFavoritos &&
      codigosVisibles.length > 0 &&
      !codigosVisibles.includes(indicadorSeleccionado)
    ) {
      setIndicadorSeleccionado(codigosVisibles[0]);
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Indicadores Chile
          </h1>
          <p className="mono text-xs text-foreground-secondary">Banco Central de Chile</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="mono flex items-center gap-1.5 text-2xs text-foreground-secondary">
            Actualizado:{' '}
            {data ? (
              formatFecha(data.fecha)
            ) : isLoading ? (
              <Skeleton className="inline-block h-3 w-24 align-middle" />
            ) : (
              '—'
            )}
            {isValidating && <Spinner />}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none"
              aria-pressed={soloFavoritos}
              onClick={() => setSoloFavoritos((prev) => !prev)}
            >
              Favoritos
            </Button>
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none"
              aria-pressed={mostrarConversor}
              onClick={() => setMostrarConversor((prev) => !prev)}
            >
              Conversor
            </Button>
          </div>
        </div>
      </header>

      <section className="mb-8">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Indicador destacado</h2>
          <p className="text-xs text-foreground-secondary">
            Selecciona un indicador de la grilla para ver su evolucion
          </p>
        </div>
        {soloFavoritos && codigosVisibles.length === 0 ? (
          <div className="rounded border border-border bg-surface p-6 text-sm text-foreground-secondary">
            Marca un indicador como favorito para ver su evolucion aqui.
          </div>
        ) : (
          <HistoryChart
            codigo={indicadorSeleccionado}
            fechaReferencia={data?.[indicadorSeleccionado]?.fecha}
            unidadMedida={data?.[indicadorSeleccionado]?.unidad_medida}
          />
        )}
      </section>

      {mostrarConversor && (
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Conversor</h2>
          </div>
          <Converter />
        </section>
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">
            {soloFavoritos ? 'Favoritos' : 'Todos los indicadores'}
          </h2>
          <p className="text-xs text-foreground-secondary">
            {totalIndicadores} indicador{totalIndicadores === 1 ? '' : 'es'}
          </p>
        </div>

        {error && !data ? (
          <p className="rounded border border-border bg-surface p-4 text-sm text-foreground-secondary">
            No se pudieron cargar los indicadores. Intenta recargar la pagina en unos momentos.
          </p>
        ) : soloFavoritos && codigosVisibles.length === 0 ? (
          <p className="rounded border border-border bg-surface p-4 text-sm text-foreground-secondary">
            Aun no marcaste ningun indicador como favorito. Usa la estrella de una tarjeta para
            agregarla aqui.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
            {codigosVisibles.map((codigo) => (
              <IndicatorCard
                key={codigo}
                codigo={codigo}
                indicador={data?.[codigo]}
                error={!!data && !data[codigo]}
                isLoading={isLoading && !data}
                seleccionado={codigo === indicadorSeleccionado}
                onSelect={() => setIndicadorSeleccionado(codigo)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
