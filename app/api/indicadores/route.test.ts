import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IndicadoresSnapshot } from '@/types/indicador';

const snapshot: IndicadoresSnapshot = {
  version: '1.7.0',
  autor: 'mindicador.cl',
  fecha: '2026-07-25T00:00:00.000Z',
  uf: {
    codigo: 'uf',
    nombre: 'Unidad de fomento (UF)',
    unidad_medida: 'Pesos',
    fecha: '2026-07-25T00:00:00.000Z',
    valor: 40845,
  },
} as IndicadoresSnapshot;

function mockFetchOnce(response: { ok: boolean; status?: number; json: () => Promise<unknown> }) {
  vi.mocked(fetch).mockResolvedValueOnce(response as Response);
}

function mockFetchRejectOnce(error: Error) {
  vi.mocked(fetch).mockRejectedValueOnce(error);
}

// El route handler mantiene `lastSnapshot` como estado en memoria a nivel de
// modulo (no exportado). Se resetean los modulos y se importa el handler de
// forma dinamica en cada test para que ese cache no se filtre entre tests.
describe('GET /api/indicadores', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('responde 200 con el snapshot cuando la API externa funciona', async () => {
    mockFetchOnce({ ok: true, json: async () => snapshot });
    const { GET } = await import('@/app/api/indicadores/route');

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(snapshot);
  });

  it('cae al ultimo valor cacheado en memoria cuando la API externa falla', async () => {
    const { GET } = await import('@/app/api/indicadores/route');

    // Primera llamada exitosa: deja el snapshot cacheado en memoria.
    mockFetchOnce({ ok: true, json: async () => snapshot });
    const primeraRespuesta = await GET();
    expect(primeraRespuesta.status).toBe(200);

    // Segunda llamada: la API externa falla, pero como ya hay cache, sigue
    // respondiendo 200 con el ultimo valor conocido en vez de propagar el error.
    mockFetchRejectOnce(new Error('fetch failed'));
    const segundaRespuesta = await GET();

    expect(segundaRespuesta.status).toBe(200);
    await expect(segundaRespuesta.json()).resolves.toEqual(snapshot);
  });

  it('responde 502 cuando la API externa falla y no hay nada cacheado', async () => {
    mockFetchRejectOnce(new Error('fetch failed'));
    const { GET } = await import('@/app/api/indicadores/route');

    const response = await GET();

    expect(response.status).toBe(502);
    const body = (await response.json()) as { error: string };
    expect(body.error).toContain('fetch failed');
  });
});
