'use client';

import { formatCLP, formatPorcentaje } from '@/lib/format';
import { FavoritesToggle } from '@/components/FavoritesToggle';
import { Skeleton } from '@/components/Skeleton';
import { VariationBadge } from '@/components/VariationBadge';
import { useFavoritos } from '@/hooks/useFavoritos';
import type { Indicador, IndicadorCodigo } from '@/types/indicador';

interface IndicatorCardProps {
  codigo: IndicadorCodigo;
  indicador?: Indicador;
  variacion?: number;
  error?: boolean;
  isLoading?: boolean;
  seleccionado?: boolean;
  onSelect?: () => void;
}

function formatValor(indicador: Indicador): string {
  // Solo existen formatCLP/formatPorcentaje (MDI-010): los indicadores con
  // unidad "Dolar" (bitcoin, libra_cobre) se muestran con formatCLP por ahora.
  if (indicador.unidad_medida === 'Porcentaje') {
    return formatPorcentaje(indicador.valor);
  }
  return formatCLP(indicador.valor);
}

export function IndicatorCard({
  codigo,
  indicador,
  variacion,
  error,
  isLoading,
  seleccionado,
  onSelect,
}: IndicatorCardProps) {
  const noDisponible = !isLoading && (error || !indicador);
  const { esFavorito, toggleFavorito } = useFavoritos();

  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? `Ver historico de ${codigo}` : undefined}
      aria-pressed={onSelect ? seleccionado : undefined}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      className={`rounded border bg-surface p-4 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none ${
        seleccionado ? 'border-accent' : 'border-border'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="mono flex min-w-0 items-center gap-1 text-2xs tracking-wide text-foreground-secondary uppercase">
          {isLoading ? (
            <Skeleton className="h-3 w-14" />
          ) : (
            <>
              <span className="truncate">{codigo}</span>
              {codigo === 'dolar_intercambio' && (
                <span
                  className="flex-none text-accent"
                  title="Historico, sin actualizacion desde 2014"
                >
                  †
                </span>
              )}
            </>
          )}
        </div>
        <FavoritesToggle
          activo={esFavorito(codigo)}
          onToggle={() => toggleFavorito(codigo)}
          className="flex-none"
        />
      </div>

      {isLoading ? (
        <div className="mt-3">
          <Skeleton className="mb-2 h-4 w-24" />
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-5 w-14 rounded-pill" />
          </div>
        </div>
      ) : noDisponible ? (
        <p className="mt-3 text-sm text-foreground-secondary">Dato no disponible</p>
      ) : (
        <div className="animate-fade-in">
          <p className="mt-1 truncate text-sm text-foreground">{indicador!.nombre}</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="mono text-lg font-semibold text-foreground">
              {formatValor(indicador!)}
            </span>
            <VariationBadge value={variacion ?? 0} />
          </div>
        </div>
      )}
    </div>
  );
}
