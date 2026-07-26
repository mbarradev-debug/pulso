import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/indicadores/[codigo]/[anio]/route';
import type { SerieHistorica } from '@/types/indicador';

const serie: SerieHistorica = {
  codigo: 'uf',
  nombre: 'Unidad de fomento (UF)',
  unidad_medida: 'Pesos',
  serie: [{ fecha: '2026-01-01T00:00:00.000Z', valor: 39731.79 }],
};

function callRoute(codigo: string, anio: string) {
  const request = new NextRequest(
    `http://localhost:3000/api/indicadores/${codigo}/${anio}`,
  );
  return GET(request, { params: Promise.resolve({ codigo, anio }) });
}

describe('GET /api/indicadores/[codigo]/[anio]', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('responde 200 con la serie historica para un codigo y anio validos', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => serie,
    } as Response);

    const response = await callRoute('uf', '2026');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(serie);
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

  it('responde 502 cuando la API externa falla para un codigo y anio validos', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('fetch failed'));

    const response = await callRoute('dolar_intercambio', '2026');

    expect(response.status).toBe(502);
    const body = (await response.json()) as { error: string };
    expect(body.error).toContain('fetch failed');
  });
});
