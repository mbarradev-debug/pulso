import type {
  Indicador,
  IndicadorCodigo,
  SerieHistorica,
  SerieHistoricaPunto,
} from '@/types/indicador';

const BASE_URL = 'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx';
const REQUEST_TIMEOUT_MS = 8000;
// Debe coincidir con `export const revalidate` en los Route Handlers que usan
// este cliente (app/api/indicadores/route.ts y .../[codigo]/[anio]/route.ts)
// — ese valor tiene que ser un literal estatico, no puede importar esta
// constante, asi que hay que mantenerlos sincronizados a mano.
const REVALIDATE_SECONDS = 300;

interface SerieMeta {
  codigoSerie: string;
  nombre: string;
  unidadMedida: string;
}

// Códigos de serie confirmados contra el catálogo del Banco Central y, salvo
// donde se indica lo contrario, contra una llamada real a GetSeries — ver
// docs/migracion-banco-central.md para el detalle de cada uno.
const SERIES: Record<IndicadorCodigo, SerieMeta> = {
  uf: { codigoSerie: 'F073.UFF.PRE.Z.D', nombre: 'Unidad de fomento (UF)', unidadMedida: 'Pesos' },
  ivp: {
    codigoSerie: 'F073.IVP.PRE.Z.D',
    nombre: 'Indice de valor promedio (IVP)',
    unidadMedida: 'Pesos',
  },
  dolar: { codigoSerie: 'F073.TCO.PRE.Z.D', nombre: 'Dolar observado', unidadMedida: 'Pesos' },
  euro: { codigoSerie: 'F072.CLP.EUR.N.O.D', nombre: 'Euro', unidadMedida: 'Pesos' },
  ipc: {
    codigoSerie: 'F074.IPC.VAR.Z.Z.C.M',
    nombre: 'Indice de Precios al Consumidor (IPC)',
    unidadMedida: 'Porcentaje',
  },
  utm: {
    codigoSerie: 'F073.UTR.PRE.Z.M',
    nombre: 'Unidad Tributaria Mensual (UTM)',
    unidadMedida: 'Pesos',
  },
  imacec: {
    codigoSerie: 'F032.IMC.V12.Z.Z.2018.Z.Z.0.M',
    nombre: 'Imacec',
    unidadMedida: 'Porcentaje',
  },
  tpm: {
    codigoSerie: 'F022.TPM.TIN.D001.NO.Z.D',
    nombre: 'Tasa de Politica Monetaria (TPM)',
    unidadMedida: 'Porcentaje',
  },
  libra_cobre: {
    codigoSerie: 'F019.PPB.PRE.100.D',
    nombre: 'Libra de cobre',
    unidadMedida: 'Dolar',
  },
  tasa_desempleo: {
    codigoSerie: 'F049.DES.TAS.INE9.10.M',
    nombre: 'Tasa de desempleo',
    unidadMedida: 'Porcentaje',
  },
};

export class BancoCentralApiError extends Error {
  readonly codigoSerie: string;
  readonly codigoRespuesta?: number;

  constructor(message: string, codigoSerie: string, codigoRespuesta?: number) {
    super(message);
    this.name = 'BancoCentralApiError';
    this.codigoSerie = codigoSerie;
    this.codigoRespuesta = codigoRespuesta;
  }
}

interface ObsBanco {
  indexDateString: string;
  value: string;
  statusCode: string;
}

interface RespuestaGetSeries {
  Codigo: number;
  Descripcion: string;
  Series: {
    descripEsp: string | null;
    descripIng: string | null;
    seriesId: string | null;
    Obs: ObsBanco[] | null;
  };
}

// "DD-MM-YYYY" (formato de Banco Central) -> ISO 8601. Hay que parsearlo
// explicitamente, no es el formato ISO estandar.
function parseFechaBanco(indexDateString: string): string {
  const [dia, mes, anio] = indexDateString.split('-');
  return new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia))).toISOString();
}

async function llamarGetSeries(
  codigoSerie: string,
  firstdate: string,
  lastdate: string,
): Promise<RespuestaGetSeries> {
  const user = process.env.BCENTRAL_USER;
  const pass = process.env.BCENTRAL_PASS;
  if (!user || !pass) {
    throw new BancoCentralApiError(
      'Faltan las variables de entorno BCENTRAL_USER/BCENTRAL_PASS',
      codigoSerie,
    );
  }

  const url = new URL(BASE_URL);
  url.searchParams.set('user', user);
  url.searchParams.set('pass', pass);
  url.searchParams.set('function', 'GetSeries');
  url.searchParams.set('timeseries', codigoSerie);
  url.searchParams.set('firstdate', firstdate);
  url.searchParams.set('lastdate', lastdate);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let buffer: ArrayBuffer;
  try {
    // NOTA: si Banco Central responde con un error a nivel de body (Codigo
    // distinto de 0, ver mas abajo) el HTTP sigue siendo 200 - Next.js igual
    // cachea esa respuesta como si fuera valida por REVALIDATE_SECONDS. No
    // se intenta evitar esto: el fallback por indicador (ver
    // app/api/indicadores/route.ts) ya cubre ese caso sirviendo el ultimo
    // valor bueno cacheado, asi que el peor escenario es no poder
    // "recuperarse" de un error transitorio de Banco Central hasta que
    // venza la ventana de cache, no un dato peor que el que ya se mostraba.
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    buffer = await response.arrayBuffer();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new BancoCentralApiError(
        `Tiempo de espera agotado al consultar la serie ${codigoSerie}`,
        codigoSerie,
      );
    }
    throw new BancoCentralApiError(
      `Error de red al consultar la serie ${codigoSerie}: ${error instanceof Error ? error.message : String(error)}`,
      codigoSerie,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  // La API declara "charset=ISO-8859-1" en el Content-Type. response.json()/
  // text() del Fetch API decodifican el body siempre como UTF-8 sin respetar
  // ese charset, lo que corrompe tildes/enie (ej. "dólar" -> mojibake). Hay
  // que decodificar manualmente los bytes crudos como Latin-1.
  const texto = new TextDecoder('iso-8859-1').decode(buffer);
  const data = JSON.parse(texto) as RespuestaGetSeries;

  // El HTTP status siempre es 200, incluso en error: el Banco Central señaliza
  // fallos solo en el body (Codigo distinto de 0), nunca con un status HTTP
  // de error.
  if (data.Codigo !== 0) {
    throw new BancoCentralApiError(
      `Banco Central respondio Codigo ${data.Codigo} (${data.Descripcion}) para la serie ${codigoSerie}`,
      codigoSerie,
      data.Codigo,
    );
  }

  return data;
}

function obsAPuntos(obs: ObsBanco[] | null): SerieHistoricaPunto[] {
  if (!obs) return [];
  return obs
    .filter((o) => o.statusCode === 'OK')
    .map((o) => ({ fecha: parseFechaBanco(o.indexDateString), valor: Number(o.value) }));
}

export async function getSerieHistorica(
  codigo: IndicadorCodigo,
  firstdate: string,
  lastdate: string,
): Promise<SerieHistorica> {
  const meta = SERIES[codigo];
  const data = await llamarGetSeries(meta.codigoSerie, firstdate, lastdate);
  return {
    codigo,
    nombre: meta.nombre,
    unidad_medida: meta.unidadMedida,
    serie: obsAPuntos(data.Series.Obs),
  };
}

function fechaISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Ultimo punto real disponible en la ventana pedida. NOTA: el Banco Central
// puede rellenar fechas mas alla de la ultima publicacion real repitiendo el
// ultimo valor conocido con statusCode "OK" en vez de omitirlas o marcarlas
// distinto (ver docs/migracion-banco-central.md) - esta funcion no intenta
// detectar ni corregir ese relleno, devuelve literalmente el ultimo punto
// cronologico con dato real. Cualquier logica mas fina para decidir que
// cuenta como "valor vigente" queda para quien construya el snapshot.
export async function getUltimoValor(
  codigo: IndicadorCodigo,
  options?: { diasHaciaAtras?: number },
): Promise<Indicador> {
  const dias = options?.diasHaciaAtras ?? 120;
  const hoy = new Date();
  const desde = new Date(hoy);
  desde.setDate(desde.getDate() - dias);

  const serie = await getSerieHistorica(codigo, fechaISO(desde), fechaISO(hoy));
  const puntoOrdenado = [...serie.serie].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const ultimo = puntoOrdenado.at(-1);

  if (!ultimo) {
    throw new BancoCentralApiError(
      `Sin observaciones "OK" para ${codigo} en los ultimos ${dias} dias`,
      SERIES[codigo].codigoSerie,
    );
  }

  return {
    codigo,
    nombre: serie.nombre,
    unidad_medida: serie.unidad_medida,
    fecha: ultimo.fecha,
    valor: ultimo.valor,
  };
}

export function getCodigoSerieBancoCentral(codigo: IndicadorCodigo): string {
  return SERIES[codigo].codigoSerie;
}
