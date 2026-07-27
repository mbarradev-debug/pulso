import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCodigoSerieBancoCentral } from '@/lib/bcentral-client';
import { INDICADOR_CODIGOS, type IndicadorCodigo } from '@/types/indicador';

// La API de Banco Central declara charset=ISO-8859-1: response.arrayBuffer()
// tiene que decodificar los bytes crudos como Latin-1 (ver bcentral-client.ts
// y su test). Estos mocks de fetch simulan exactamente ese formato de bytes.
function bufferLatin1(texto: string): ArrayBuffer {
  const bytes = new Uint8Array(texto.length);
  for (let i = 0; i < texto.length; i += 1) {
    bytes[i] = texto.charCodeAt(i) & 0xff;
  }
  return bytes.buffer;
}

function respuestaOk(valor: number): Response {
  return {
    arrayBuffer: async () =>
      bufferLatin1(
        JSON.stringify({
          Codigo: 0,
          Descripcion: 'Success',
          Series: {
            descripEsp: 'Serie',
            descripIng: 'Series',
            seriesId: 'X',
            Obs: [{ indexDateString: '27-07-2026', value: String(valor), statusCode: 'OK' }],
          },
          SeriesInfos: [],
        }),
      ),
  } as Response;
}

function respuestaError(): Response {
  return {
    arrayBuffer: async () =>
      bufferLatin1(
        JSON.stringify({
          Codigo: -50,
          Descripcion: 'fallo simulado',
          Series: { descripEsp: null, descripIng: null, seriesId: null, Obs: null },
          SeriesInfos: [],
        }),
      ),
  } as Response;
}

function timeseriesDe(url: unknown): string | null {
  return url instanceof URL ? url.searchParams.get('timeseries') : null;
}

// El route handler mantiene el cache por indicador como estado en memoria a
// nivel de modulo (no exportado). Se resetean los modulos y se importa el
// handler de forma dinamica en cada test para que ese cache no se filtre
// entre tests (salvo en los tests que llaman GET() dos veces a proposito).
describe('GET /api/indicadores', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('BCENTRAL_USER', 'usuario-test');
    vi.stubEnv('BCENTRAL_PASS', 'clave-test');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('responde 200 con los 10 indicadores cuando las 10 llamadas funcionan', async () => {
    vi.mocked(fetch).mockImplementation(async () => respuestaOk(1));
    const { GET } = await import('@/app/api/indicadores/route');

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    INDICADOR_CODIGOS.forEach((codigo) => {
      expect(body[codigo]?.valor).toBe(1);
    });
  });

  it('dispara las 10 llamadas en paralelo, no secuenciales', async () => {
    let enVuelo = 0;
    let maximoEnVuelo = 0;
    vi.mocked(fetch).mockImplementation(async () => {
      enVuelo += 1;
      maximoEnVuelo = Math.max(maximoEnVuelo, enVuelo);
      await new Promise((resolve) => setTimeout(resolve, 5));
      enVuelo -= 1;
      return respuestaOk(1);
    });
    const { GET } = await import('@/app/api/indicadores/route');

    await GET();

    expect(maximoEnVuelo).toBe(INDICADOR_CODIGOS.length);
  });

  it('un fallo en 1 de los 10 indicadores no degrada los otros 9', async () => {
    const codigoFallido: IndicadorCodigo = 'tpm';
    const serieFallida = getCodigoSerieBancoCentral(codigoFallido);
    vi.mocked(fetch).mockImplementation(async (url) =>
      timeseriesDe(url) === serieFallida ? respuestaError() : respuestaOk(1),
    );
    const { GET } = await import('@/app/api/indicadores/route');

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body[codigoFallido]).toBeUndefined();
    INDICADOR_CODIGOS.filter((codigo) => codigo !== codigoFallido).forEach((codigo) => {
      expect(body[codigo]?.valor).toBe(1);
    });
  });

  it('cae al valor cacheado de un indicador cuando su llamada vuelve a fallar', async () => {
    const codigoAFallar: IndicadorCodigo = 'uf';
    const serieAFallar = getCodigoSerieBancoCentral(codigoAFallar);
    const { GET } = await import('@/app/api/indicadores/route');

    vi.mocked(fetch).mockImplementation(async () => respuestaOk(1));
    await GET();

    vi.mocked(fetch).mockImplementation(async (url) =>
      timeseriesDe(url) === serieAFallar ? respuestaError() : respuestaOk(2),
    );
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body[codigoAFallar].valor).toBe(1);
    expect(body.dolar.valor).toBe(2);
  });

  it('responde 502 cuando las 10 llamadas fallan y no hay nada cacheado', async () => {
    vi.mocked(fetch).mockImplementation(async () => respuestaError());
    const { GET } = await import('@/app/api/indicadores/route');

    const response = await GET();

    expect(response.status).toBe(502);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  it('cuando las 10 fallan pero habia cache previo, sirve el ultimo snapshot cacheado', async () => {
    const { GET } = await import('@/app/api/indicadores/route');

    vi.mocked(fetch).mockImplementation(async () => respuestaOk(1));
    await GET();

    vi.mocked(fetch).mockImplementation(async () => respuestaError());
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    INDICADOR_CODIGOS.forEach((codigo) => {
      expect(body[codigo]?.valor).toBe(1);
    });
  });
});
