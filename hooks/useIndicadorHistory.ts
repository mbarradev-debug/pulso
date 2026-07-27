'use client';

import useSWR from 'swr';
import type { IndicadorCodigo, SerieHistorica, SerieHistoricaPunto } from '@/types/indicador';

async function fetchSerieAnio(
  codigo: IndicadorCodigo,
  anio: number,
): Promise<SerieHistoricaPunto[]> {
  const response = await fetch(`/api/indicadores/${codigo}/${anio}`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error ??
        `Error al consultar historico de ${codigo} (${anio}): estado ${response.status}`,
    );
  }
  const data: SerieHistorica = await response.json();
  return data.serie;
}

async function fetchSerieAnioSeguro(
  codigo: IndicadorCodigo,
  anio: number,
): Promise<SerieHistoricaPunto[]> {
  try {
    return await fetchSerieAnio(codigo, anio);
  } catch {
    return [];
  }
}

// Se traen el anio de la fecha ancla y los 2 anteriores: el rango mas largo del
// selector es 2A (24 meses), y un rango de hasta 24 meses hacia atras desde el
// ancla puede caer en 3 anios calendario distintos (ej. ancla en enero 2026 ->
// 24 meses atras cae en enero 2024).
const ANIOS_HACIA_ATRAS = 2;

export function useIndicadorHistory(codigo: IndicadorCodigo, fechaAncla: Date) {
  const anioAncla = fechaAncla.getFullYear();
  const anios = Array.from({ length: ANIOS_HACIA_ATRAS + 1 }, (_, i) => anioAncla - i);

  const { data, error, isLoading, isValidating } = useSWR(
    ['historico', codigo, anioAncla],
    async () => {
      const series = await Promise.all(anios.map((anio) => fetchSerieAnioSeguro(codigo, anio)));

      if (series.every((serie) => serie.length === 0)) {
        throw new Error(`No se pudo obtener el historico de ${codigo}`);
      }

      return series
        .flat()
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    },
  );

  return { data, isLoading, isValidating, error };
}
