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

const PUNTOS_POR_RANGO: Record<Rango, number> = {
  '1M': 30,
  '6M': 183,
  '1A': Infinity,
};

const labelFormatter = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit' });

function getCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

interface HistoryChartProps {
  codigo: IndicadorCodigo;
}

export function HistoryChart({ codigo }: HistoryChartProps) {
  const [rango, setRango] = useState<Rango>('1M');
  const anio = new Date().getFullYear();
  const { data, isLoading, error } = useIndicadorHistory(codigo, anio);

  const serieVisible = useMemo(() => {
    if (!data) return [];
    // mindicador.cl devuelve la serie en orden descendente (mas reciente primero).
    const puntos = PUNTOS_POR_RANGO[rango];
    const recientes = Number.isFinite(puntos) ? data.serie.slice(0, puntos) : data.serie;
    return recientes.slice().reverse();
  }, [data, rango]);

  const tendenciaUp =
    serieVisible.length >= 2
      ? serieVisible[serieVisible.length - 1].valor >= serieVisible[0].valor
      : true;

  return (
    <div className="rounded border border-border bg-surface p-6">
      <div className="mb-4 flex w-fit gap-1 rounded-pill bg-surface-2 p-1">
        {(['1M', '6M', '1A'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRango(r)}
            className={`min-h-11 min-w-11 rounded-pill px-3 py-1 text-xs font-semibold transition-colors ${
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
                  ticks: { color: getCssVar('--foreground-muted', '#6B6862'), maxTicksLimit: 8 },
                },
                y: {
                  grid: { color: getCssVar('--surface-2', '#1C1C1F') },
                  ticks: { color: getCssVar('--foreground-muted', '#6B6862') },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
