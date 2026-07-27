import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/indicadores/[codigo]/[anio]/route';

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

function respuestaOk(): Response {
  return {
    arrayBuffer: async () =>
      bufferLatin1(
        JSON.stringify({
          Codigo: 0,
          Descripcion: 'Success',
          Series: {
            descripEsp: 'Unidad de fomento (UF)',
            descripIng: 'Unit of account (UF)',
            seriesId: 'F073.UFF.PRE.Z.D',
            Obs: [{ indexDateString: '02-01-2020', value: '39731.79', statusCode: 'OK' }],
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
          Descripcion: 'An internal error has occurred, information is not available.',
          Series: { descripEsp: null, descripIng: null, seriesId: null, Obs: null },
          SeriesInfos: [],
        }),
      ),
  } as Response;
}

function callRoute(codigo: string, anio: string) {
  const request = new NextRequest(`http://localhost:3000/api/indicadores/${codigo}/${anio}`);
  return GET(request, { params: Promise.resolve({ codigo, anio }) });
}

describe('GET /api/indicadores/[codigo]/[anio]', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('BCENTRAL_USER', 'usuario-test');
    vi.stubEnv('BCENTRAL_PASS', 'clave-test');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('responde 200 con la serie historica para un codigo y anio validos', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(respuestaOk());

    const response = await callRoute('uf', '2020');

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.codigo).toBe('uf');
    expect(body.serie).toEqual([{ fecha: '2020-01-02T00:00:00.000Z', valor: 39731.79 }]);
  });

  it('construye firstdate/lastdate explicitos: 1 de enero a 31 de diciembre para un anio pasado', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(respuestaOk());

    await callRoute('uf', '2020');

    const url = vi.mocked(fetch).mock.calls[0][0] as URL;
    expect(url.searchParams.get('firstdate')).toBe('2020-01-01');
    expect(url.searchParams.get('lastdate')).toBe('2020-12-31');
  });

  it('corta lastdate en "hoy" cuando el anio pedido es el anio en curso (nunca omite el rango)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(respuestaOk());
    const anioActual = String(new Date().getFullYear());

    await callRoute('uf', anioActual);

    const url = vi.mocked(fetch).mock.calls[0][0] as URL;
    expect(url.searchParams.get('firstdate')).toBe(`${anioActual}-01-01`);
    expect(url.searchParams.get('lastdate')).not.toBeNull();
    expect(url.searchParams.get('lastdate')).not.toBe(`${anioActual}-12-31`);
  });

  it('responde 400 cuando el codigo no es un indicador soportado', async () => {
    const response = await callRoute('no-existe', '2026');

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toContain('codigo invalido');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('responde 400 cuando el anio no es un numero de 4 digitos valido', async () => {
    const response = await callRoute('uf', '26');

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toContain('anio invalido');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('responde 400 cuando el anio esta fuera del rango permitido', async () => {
    const response = await callRoute('uf', '1969');

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toContain('anio invalido');
  });

  it('responde 502 cuando Banco Central falla (Codigo distinto de 0 con HTTP 200) para un codigo y anio validos', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(respuestaError());

    const response = await callRoute('dolar', '2020');

    expect(response.status).toBe(502);
    const body = (await response.json()) as { error: string };
    expect(body.error).toContain('dolar');
  });

  it('responde 502 cuando hay un error de red', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('fetch failed'));

    const response = await callRoute('dolar', '2020');

    expect(response.status).toBe(502);
    const body = (await response.json()) as { error: string };
    expect(body.error).toContain('fetch failed');
  });
});
