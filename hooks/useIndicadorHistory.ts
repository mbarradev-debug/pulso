'use client';

import useSWR from 'swr';
import type { IndicadorCodigo, SerieHistorica } from '@/types/indicador';

async function fetcher(url: string): Promise<SerieHistorica> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Error al consultar ${url}: estado ${response.status}`);
  }
  return response.json();
}

export function useIndicadorHistory(codigo: IndicadorCodigo, anio: number) {
  const { data, error, isLoading } = useSWR<SerieHistorica>(
    `/api/indicadores/${codigo}/${anio}`,
    fetcher,
  );

  return { data, isLoading, error };
}
