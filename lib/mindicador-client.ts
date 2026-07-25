import type { IndicadorCodigo, IndicadoresSnapshot, SerieHistorica } from '@/types/indicador';

const BASE_URL = 'https://mindicador.cl/api';
const REQUEST_TIMEOUT_MS = 8000;

export class MindicadorApiError extends Error {
  readonly url: string;
  readonly status?: number;

  constructor(message: string, url: string, status?: number) {
    super(message);
    this.name = 'MindicadorApiError';
    this.url = url;
    this.status = status;
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new MindicadorApiError(`Tiempo de espera agotado al consultar ${url}`, url);
    }
    throw new MindicadorApiError(
      `Error de red al consultar ${url}: ${error instanceof Error ? error.message : String(error)}`,
      url,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new MindicadorApiError(
      `mindicador.cl respondio con estado ${response.status} para ${url}`,
      url,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export function getSnapshot(): Promise<IndicadoresSnapshot> {
  return fetchJson<IndicadoresSnapshot>(BASE_URL);
}

export function getHistorico(codigo: IndicadorCodigo, anio: number): Promise<SerieHistorica> {
  return fetchJson<SerieHistorica>(`${BASE_URL}/${codigo}/${anio}`);
}
