'use client';

import useSWR from 'swr';
import type { IndicadorCodigo, SerieHistorica, SerieHistoricaPunto } from '@/types/indicador';

async function fetchSerieAnio(codigo: IndicadorCodigo, anio: number): Promise<SerieHistoricaPunto[]> {
  const response = await fetch(`/api/indicadores/${codigo}/${anio}`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error ?? `Error al consultar historico de ${codigo} (${anio}): estado ${response.status}`,
    );
  }
  const data: SerieHistorica = await response.json();
  return data.serie;
}

async function fetchSerieAnioSeguro(codigo: IndicadorCodigo, anio: number): Promise<SerieHistoricaPunto[]> {
  try {
    return await fetchSerieAnio(codigo, anio);
  } catch {
    return [];
  }
}

// Se traen el anio de la fecha ancla y el anterior: cualquier rango de hasta 12 meses
// hacia atras desde el ancla cae siempre dentro de esos dos anios calendario.
export function useIndicadorHistory(codigo: IndicadorCodigo, fechaAncla: Date) {
  const anioAncla = fechaAncla.getFullYear();
  const anioPrevio = anioAncla - 1;

  const { data, error, isLoading } = useSWR(['historico', codigo, anioAncla], async () => {
    const [actual, previo] = await Promise.all([
      fetchSerieAnioSeguro(codigo, anioAncla),
      fetchSerieAnioSeguro(codigo, anioPrevio),
    ]);

    if (actual.length === 0 && previo.length === 0) {
      throw new Error(`No se pudo obtener el historico de ${codigo}`);
    }

    return [...actual, ...previo].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
  });

  return { data, isLoading, error };
}
