import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import { useIndicadorHistory } from '@/hooks/useIndicadorHistory';

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );
}

// Ancla en junio 2026: el hook debe pedir el historico de 2026 (anio ancla) y
// 2025 (anio anterior), ya que cualquier rango de hasta 12 meses hacia atras
// desde el ancla puede caer en cualquiera de esos dos anios calendario.
const fechaAncla = new Date('2026-06-15T00:00:00.000Z');

describe('useIndicadorHistory', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('empieza en estado de carga sin datos', () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useIndicadorHistory('uf', fechaAncla), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('combina y ordena descendente la serie de ambos anios cuando el fetch es exitoso', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/uf/2026')) {
        return {
          ok: true,
          json: async () => ({
            codigo: 'uf',
            nombre: 'UF',
            unidad_medida: 'Pesos',
            serie: [{ fecha: '2026-03-01T00:00:00.000Z', valor: 2 }],
          }),
        } as Response;
      }
      if (url.includes('/uf/2025')) {
        return {
          ok: true,
          json: async () => ({
            codigo: 'uf',
            nombre: 'UF',
            unidad_medida: 'Pesos',
            serie: [{ fecha: '2025-12-01T00:00:00.000Z', valor: 1 }],
          }),
        } as Response;
      }
      throw new Error(`URL inesperada en el test: ${url}`);
    });

    const { result } = renderHook(() => useIndicadorHistory('uf', fechaAncla), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([
      { fecha: '2026-03-01T00:00:00.000Z', valor: 2 },
      { fecha: '2025-12-01T00:00:00.000Z', valor: 1 },
    ]);
    expect(result.current.error).toBeUndefined();
  });

  it('recupera datos parciales si un solo anio falla (error aislado)', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/euro/2026')) {
        return { ok: false, status: 502, json: async () => ({ error: 'sin datos' }) } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          codigo: 'euro',
          nombre: 'Euro',
          unidad_medida: 'Pesos',
          serie: [{ fecha: '2025-12-01T00:00:00.000Z', valor: 1080 }],
        }),
      } as Response;
    });

    const { result } = renderHook(() => useIndicadorHistory('euro', fechaAncla), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{ fecha: '2025-12-01T00:00:00.000Z', valor: 1080 }]);
    expect(result.current.error).toBeUndefined();
  });

  it('retorna error solo cuando ambos anios fallan', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ error: 'mindicador.cl no responde' }),
    } as Response);

    const { result } = renderHook(() => useIndicadorHistory('uf', fechaAncla), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
