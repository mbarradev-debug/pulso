import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BancoCentralApiError, getSerieHistorica, getUltimoValor } from '@/lib/bcentral-client';

// La API declara charset=ISO-8859-1 en el Content-Type. Estos helpers simulan
// exactamente eso: codifican un string como bytes Latin-1 (no UTF-8) para que
// el mock de fetch se comporte igual que el servidor real.
function bufferLatin1(texto: string): ArrayBuffer {
  const bytes = new Uint8Array(texto.length);
  for (let i = 0; i < texto.length; i += 1) {
    bytes[i] = texto.charCodeAt(i) & 0xff;
  }
  return bytes.buffer;
}

function mockRespuesta(json: unknown) {
  return {
    arrayBuffer: async () => bufferLatin1(JSON.stringify(json)),
  } as Response;
}

describe('bcentral-client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('BCENTRAL_USER', 'usuario-test');
    vi.stubEnv('BCENTRAL_PASS', 'clave-test');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('decodifica correctamente campos con tildes/ene (regresion Latin-1 vs UTF-8)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockRespuesta({
        Codigo: -50,
        Descripcion: 'Código de serie inválido para la consulta',
        Series: { descripEsp: null, descripIng: null, seriesId: null, Obs: null },
        SeriesInfos: [],
      }),
    );

    await expect(getSerieHistorica('uf', '2026-07-01', '2026-07-27')).rejects.toThrow(
      /Código de serie inválido para la consulta/,
    );
  });

  it('descarta observaciones con statusCode distinto de "OK"', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockRespuesta({
        Codigo: 0,
        Descripcion: 'Success',
        Series: {
          descripEsp: 'Dolar observado',
          descripIng: 'Observed dollar',
          seriesId: 'F073.TCO.PRE.Z.D',
          Obs: [
            { indexDateString: '24-07-2026', value: '946.24', statusCode: 'OK' },
            { indexDateString: '25-07-2026', value: 'NaN', statusCode: 'ND' },
            { indexDateString: '26-07-2026', value: 'NaN', statusCode: 'ND' },
            { indexDateString: '27-07-2026', value: '946.14', statusCode: 'OK' },
          ],
        },
        SeriesInfos: [],
      }),
    );

    const serie = await getSerieHistorica('dolar', '2026-07-24', '2026-07-27');

    expect(serie.serie).toEqual([
      { fecha: '2026-07-24T00:00:00.000Z', valor: 946.24 },
      { fecha: '2026-07-27T00:00:00.000Z', valor: 946.14 },
    ]);
  });

  it('detecta y propaga un error con Codigo distinto de 0 aunque el HTTP sea 200', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockRespuesta({
        Codigo: -50,
        Descripcion: 'An internal error has occurred, information is not available.',
        Series: { descripEsp: null, descripIng: null, seriesId: null, Obs: null },
        SeriesInfos: [],
      }),
    );

    await expect(getSerieHistorica('uf', '2026-07-01', '2026-07-27')).rejects.toBeInstanceOf(
      BancoCentralApiError,
    );
  });

  it('documenta el comportamiento actual ante una cola de valores repetidos (relleno stale)', async () => {
    // La UF se recalcula por interpolacion diaria: no deberia quedar plana
    // por varios dias seguidos. El Banco Central igual repite el ultimo
    // valor conocido con statusCode "OK" para fechas mas alla de lo
    // realmente publicado (ver docs/migracion-banco-central.md). Este
    // cliente NO intenta detectar ni corregir esa corrida: devuelve
    // literalmente el ultimo punto cronologico, tal como llega.
    vi.mocked(fetch).mockResolvedValueOnce(
      mockRespuesta({
        Codigo: 0,
        Descripcion: 'Success',
        Series: {
          descripEsp: 'Unidad de fomento (UF)',
          descripIng: 'Unit of account (UF)',
          seriesId: 'F073.UFF.PRE.Z.D',
          Obs: [
            { indexDateString: '08-07-2026', value: '40842.07', statusCode: 'OK' },
            { indexDateString: '09-07-2026', value: '40844.79', statusCode: 'OK' },
            { indexDateString: '10-07-2026', value: '40844.79', statusCode: 'OK' },
            { indexDateString: '11-07-2026', value: '40844.79', statusCode: 'OK' },
          ],
        },
        SeriesInfos: [],
      }),
    );

    const indicador = await getUltimoValor('uf');

    expect(indicador.fecha).toBe('2026-07-11T00:00:00.000Z');
    expect(indicador.valor).toBe(40844.79);
  });

  it('parsea indexDateString DD-MM-YYYY y value string a number, con y sin decimales', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockRespuesta({
        Codigo: 0,
        Descripcion: 'Success',
        Series: {
          descripEsp: 'Dolar observado',
          descripIng: 'Observed dollar',
          seriesId: 'F073.TCO.PRE.Z.D',
          Obs: [
            { indexDateString: '21-07-2026', value: '933', statusCode: 'OK' },
            { indexDateString: '22-07-2026', value: '932.84', statusCode: 'OK' },
          ],
        },
        SeriesInfos: [],
      }),
    );

    const serie = await getSerieHistorica('dolar', '2026-07-21', '2026-07-22');

    expect(serie.serie).toEqual([
      { fecha: '2026-07-21T00:00:00.000Z', valor: 933 },
      { fecha: '2026-07-22T00:00:00.000Z', valor: 932.84 },
    ]);
  });

  it('siempre pasa firstdate y lastdate explicitos a GetSeries', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockRespuesta({
        Codigo: 0,
        Descripcion: 'Success',
        Series: { descripEsp: 'UF', descripIng: 'UF', seriesId: 'F073.UFF.PRE.Z.D', Obs: [] },
        SeriesInfos: [],
      }),
    );

    await getSerieHistorica('uf', '2026-01-01', '2026-01-31');

    const url = vi.mocked(fetch).mock.calls[0][0] as URL;
    expect(url.searchParams.get('firstdate')).toBe('2026-01-01');
    expect(url.searchParams.get('lastdate')).toBe('2026-01-31');
    expect(url.searchParams.get('function')).toBe('GetSeries');
  });

  it('usa una unidad_medida fija por indicador, no derivada de descripEsp', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockRespuesta({
        Codigo: 0,
        Descripcion: 'Success',
        Series: {
          // descripEsp con una unidad distinta a proposito ("oz" en vez de
          // "libra"), tal como se documento en el hallazgo real con
          // libra_cobre: no debe influir en unidad_medida.
          descripEsp: 'Precios de productos basicos / Onza troy de Cobre. Dolares / oz',
          descripIng: 'Basic commodity prices / Copper troy ounce. Dollars / oz',
          seriesId: 'F019.PPB.PRE.100.D',
          Obs: [{ indexDateString: '27-07-2026', value: '6.1685', statusCode: 'OK' }],
        },
        SeriesInfos: [],
      }),
    );

    const serie = await getSerieHistorica('libra_cobre', '2026-07-27', '2026-07-27');

    expect(serie.unidad_medida).toBe('Dolar');
  });

  it('lanza BancoCentralApiError si faltan las credenciales de entorno', async () => {
    vi.unstubAllEnvs();

    await expect(getSerieHistorica('uf', '2026-07-01', '2026-07-27')).rejects.toBeInstanceOf(
      BancoCentralApiError,
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
