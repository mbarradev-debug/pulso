export const INDICADOR_CODIGOS = [
  'uf',
  'ivp',
  'dolar',
  'euro',
  'ipc',
  'utm',
  'imacec',
  'tpm',
  'libra_cobre',
  'tasa_desempleo',
] as const;

export type IndicadorCodigo = (typeof INDICADOR_CODIGOS)[number];

export interface Indicador {
  codigo: IndicadorCodigo;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

export interface IndicadoresSnapshot {
  version: string;
  autor: string;
  fecha: string;
  uf: Indicador;
  ivp: Indicador;
  dolar: Indicador;
  euro: Indicador;
  ipc: Indicador;
  utm: Indicador;
  imacec: Indicador;
  tpm: Indicador;
  libra_cobre: Indicador;
  tasa_desempleo: Indicador;
}

export interface SerieHistoricaPunto {
  fecha: string;
  valor: number;
}

export interface SerieHistorica {
  codigo: IndicadorCodigo;
  nombre: string;
  unidad_medida: string;
  serie: SerieHistoricaPunto[];
}
