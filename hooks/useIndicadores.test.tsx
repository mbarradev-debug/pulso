import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import { useIndicadores } from '@/hooks/useIndicadores';

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );
}

describe('useIndicadores', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('empieza en estado de carga sin datos', () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useIndicadores(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('retorna el snapshot cuando el fetch es exitoso', async () => {
    const snapshot = {
      version: '1.0',
      autor: 'mindicador.cl',
      fecha: '2026-07-25T00:00:00.000Z',
      uf: {
        codigo: 'uf',
        nombre: 'Unidad de fomento (UF)',
        unidad_medida: 'Pesos',
        fecha: '2026-07-25T00:00:00.000Z',
        valor: 40845,
      },
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => snapshot,
    } as Response);

    const { result } = renderHook(() => useIndicadores(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(snapshot);
    expect(result.current.error).toBeUndefined();
  });

  it('retorna un error aislado cuando el fetch falla', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ error: 'mindicador.cl no responde' }),
    } as Response);

    const { result } = renderHook(() => useIndicadores(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe('mindicador.cl no responde');
  });
});
