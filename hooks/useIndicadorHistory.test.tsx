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

// Ancla en junio 2026: el hook debe pedir el historico de 2026 (anio ancla),
// 2025 y 2024, ya que el rango mas largo del selector es 2A (24 meses) y un
// rango de hasta 24 meses hacia atras desde el ancla puede caer en cualquiera
// de esos 3 anios calendario.
const fechaAncla = new Date('2026-06-15T00:00:00.000Z');

function respuestaSerie(codigo: string, nombre: string, fecha: string, valor: number): Response {
  return {
    ok: true,
    json: async () => ({ codigo, nombre, unidad_medida: 'Pesos', serie: [{ fecha, valor }] }),
  } as Response;
}

function respuestaError(): Response {
  return { ok: false, status: 502, json: async () => ({ error: 'sin datos' }) } as Response;
}

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

  it('combina y ordena descendente la serie de los 3 anios cuando el fetch es exitoso', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/uf/2026')) {
        return respuestaSerie('uf', 'UF', '2026-03-01T00:00:00.000Z', 3);
      }
      if (url.includes('/uf/2025')) {
        return respuestaSerie('uf', 'UF', '2025-12-01T00:00:00.000Z', 2);
      }
      if (url.includes('/uf/2024')) {
        return respuestaSerie('uf', 'UF', '2024-06-01T00:00:00.000Z', 1);
      }
      throw new Error(`URL inesperada en el test: ${url}`);
    });

    const { result } = renderHook(() => useIndicadorHistory('uf', fechaAncla), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([
      { fecha: '2026-03-01T00:00:00.000Z', valor: 3 },
      { fecha: '2025-12-01T00:00:00.000Z', valor: 2 },
      { fecha: '2024-06-01T00:00:00.000Z', valor: 1 },
    ]);
    expect(result.current.error).toBeUndefined();
  });

  it('recupera datos parciales si algun anio falla (error aislado)', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/euro/2026')) {
        return respuestaError();
      }
      if (url.includes('/euro/2025')) {
        return respuestaSerie('euro', 'Euro', '2025-12-01T00:00:00.000Z', 1080);
      }
      return respuestaError();
    });

    const { result } = renderHook(() => useIndicadorHistory('euro', fechaAncla), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([{ fecha: '2025-12-01T00:00:00.000Z', valor: 1080 }]);
    expect(result.current.error).toBeUndefined();
  });

  it('retorna error solo cuando los 3 anios fallan', async () => {
    vi.mocked(fetch).mockResolvedValue(respuestaError());

    const { result } = renderHook(() => useIndicadorHistory('uf', fechaAncla), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
