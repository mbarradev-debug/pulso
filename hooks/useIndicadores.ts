'use client';

import useSWR from 'swr';
import type { IndicadoresSnapshot } from '@/types/indicador';

const ENDPOINT = '/api/indicadores';

async function fetcher(url: string): Promise<IndicadoresSnapshot> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Error al consultar ${url}: estado ${response.status}`);
  }
  return response.json();
}

export function useIndicadores() {
  const { data, error, isLoading } = useSWR<IndicadoresSnapshot>(ENDPOINT, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 60_000,
  });

  return { data, isLoading, error };
}
