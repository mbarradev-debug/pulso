'use client';

import useSWR from 'swr';
import type { IndicadoresSnapshot } from '@/types/indicador';

// Exportado para que app/page.tsx use la misma key al armar el `fallback` de
// SWRConfig con el snapshot obtenido en el servidor.
export const ENDPOINT_INDICADORES = '/api/indicadores';

async function fetcher(url: string): Promise<IndicadoresSnapshot> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Error al consultar ${url}: estado ${response.status}`);
  }
  return response.json();
}

export function useIndicadores() {
  const { data, error, isLoading, isValidating } = useSWR<IndicadoresSnapshot>(
    ENDPOINT_INDICADORES,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60_000,
    },
  );

  return { data, isLoading, isValidating, error };
}
