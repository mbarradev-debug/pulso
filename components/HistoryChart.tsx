'use client';

import { useMemo, useState } from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Skeleton } from '@/components/Skeleton';
import { useIndicadorHistory } from '@/hooks/useIndicadorHistory';
import type { IndicadorCodigo } from '@/types/indicador';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type Rango = '1M' | '6M' | '1A';

const RANGOS: readonly Rango[] = ['1M', '6M', '1A'];

const MESES_POR_RANGO: Record<Rango, number> = {
  '1M': 1,
  '6M': 6,
  '1A': 12,
};

// Indicadores con cadencia mensual o menor (ipc, utm, imacec, tasa_desempleo) pueden
// tener 1-2 puntos en la ventana de 1M o 6M: no es un bug de datos, pero una pestana
// con casi ningun punto se lee como un grafico roto. Se oculta dinamicamente segun
// la cantidad real de puntos en cada rango, sin asumir de antemano que indicadores
// son mensuales.
const MIN_PUNTOS_RANGO = 3;

const labelFormatter = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit' });

function getCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

interface HistoryChartProps {
  codigo: IndicadorCodigo;
  // Fecha del dato mas reciente realmente disponible para este indicador (ej. la
  // "fecha" del snapshot). Sirve de ancla para calcular los rangos 1M/6M/1A en vez
  // de asumir que "hoy" tiene datos: para indicadores descontinuados o con rezago
  // de publicacion, el ancla puede quedar muy atras en el tiempo. Si no se recibe,
  // se usa la fecha actual.
  fechaReferencia?: string | Date;
}

export function HistoryChart({ codigo, fechaReferencia }: HistoryChartProps) {
  const [rango, setRango] = useState<Rango>('1M');
  const fechaAncla = useMemo(
    () => (fechaReferencia ? new Date(fechaReferencia) : new Date()),
    [fechaReferencia],
  );
  const { data, isLoading, error } = useIndicadorHistory(codigo, fechaAncla);

  const rangosVisibles = useMemo(() => {
    if (!data) return RANGOS;
    const contarEnRango = (meses: number) => {
      const corte = new Date(fechaAncla);
      corte.setMonth(corte.getMonth() - meses);
      return data.filter((punto) => new Date(punto.fecha) >= corte).length;
    };
    // "1A" siempre queda visible como respaldo, aunque no alcance el minimo.
    return RANGOS.filter((r) => r === '1A' || contarEnRango(MESES_POR_RANGO[r]) >= MIN_PUNTOS_RANGO);
  }, [data, fechaAncla]);

  const rangosVisiblesKey = rangosVisibles.join(',');
  const [rangosVisiblesKeyAnterior, setRangosVisiblesKeyAnterior] = useState(rangosVisiblesKey);
  if (rangosVisiblesKey !== rangosVisiblesKeyAnterior) {
    setRangosVisiblesKeyAnterior(rangosVisiblesKey);
    if (!rangosVisibles.includes(rango)) {
      setRango(rangosVisibles[0]);
    }
  }

  const serieVisible = useMemo(() => {
    if (!data) return [];
    const corte = new Date(fechaAncla);
    corte.setMonth(corte.getMonth() - MESES_POR_RANGO[rango]);
    const enRango = data.filter((punto) => new Date(punto.fecha) >= corte);
    return enRango.slice().reverse();
  }, [data, rango, fechaAncla]);

  const tendenciaUp =
    serieVisible.length >= 2
      ? serieVisible[serieVisible.length - 1].valor >= serieVisible[0].valor
      : true;

  return (
    <div className="rounded border border-border bg-surface p-6">
      <div className="mb-4 flex w-fit gap-1 rounded-pill bg-surface-2 p-1">
        {rangosVisibles.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRango(r)}
            aria-pressed={rango === r}
            aria-label={`Ver rango ${r}`}
            className={`min-h-11 min-w-11 rounded-pill px-3 py-1 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2 focus-visible:outline-none ${
              rango === r
                ? 'bg-accent text-on-accent'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="relative h-56 sm:h-64">
        {error ? (
          <div className="flex h-full items-center justify-center text-sm text-foreground-secondary">
            No se pudo cargar el historico de {codigo}.
          </div>
        ) : isLoading && !data ? (
          <div className="flex h-full flex-col gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="flex-1" />
          </div>
        ) : serieVisible.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-foreground-secondary">
            Sin datos historicos disponibles para este indicador.
          </div>
        ) : (
          <Line
            className="animate-fade-in"
            data={{
              labels: serieVisible.map((punto) => labelFormatter.format(new Date(punto.fecha))),
              datasets: [
                {
                  data: serieVisible.map((punto) => punto.valor),
                  borderColor: tendenciaUp
                    ? getCssVar('--up', '#34D399')
                    : getCssVar('--down', '#F87171'),
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  pointRadius: 0,
                  pointHoverRadius: 4,
                  tension: 0.3,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { intersect: false, mode: 'index' },
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: getCssVar('--surface-2', '#1C1C1F'),
                  borderColor: getCssVar('--border-strong', '#38383E'),
                  borderWidth: 1,
                  titleColor: getCssVar('--foreground', '#F5F5F4'),
                  bodyColor: getCssVar('--foreground-secondary', '#A8A29E'),
                  padding: 10,
                  cornerRadius: 8,
                },
              },
              scales: {
                x: {
                  grid: { color: getCssVar('--surface-2', '#1C1C1F') },
                  ticks: {
                    color: getCssVar('--foreground-secondary', '#A8A29E'),
                    maxTicksLimit: 8,
                  },
                },
                y: {
                  grid: { color: getCssVar('--surface-2', '#1C1C1F') },
                  ticks: { color: getCssVar('--foreground-secondary', '#A8A29E') },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
