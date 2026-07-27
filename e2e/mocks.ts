import type { Page } from '@playwright/test';

// Snapshot mockeado: valores redondos para que los calculos del conversor en
// los tests sean predecibles (ej. UF en 40.000 -> 100.000 / 40.000 = 2,5).
const SNAPSHOT_MOCK = {
  version: '1.7.0',
  autor: 'mindicador.cl',
  fecha: '2026-07-25T00:00:00.000Z',
  uf: {
    codigo: 'uf',
    nombre: 'Unidad de fomento (UF)',
    unidad_medida: 'Pesos',
    fecha: '2026-07-25T00:00:00.000Z',
    valor: 40000,
  },
  ivp: {
    codigo: 'ivp',
    nombre: 'Indice de valor promedio (IVP)',
    unidad_medida: 'Pesos',
    fecha: '2026-07-25T00:00:00.000Z',
    valor: 42000,
  },
  dolar: {
    codigo: 'dolar',
    nombre: 'Dolar observado',
    unidad_medida: 'Pesos',
    fecha: '2026-07-25T00:00:00.000Z',
    valor: 950,
  },
  euro: {
    codigo: 'euro',
    nombre: 'Euro',
    unidad_medida: 'Pesos',
    fecha: '2026-07-25T00:00:00.000Z',
    valor: 1080,
  },
  ipc: {
    codigo: 'ipc',
    nombre: 'Indice de Precios al Consumidor (IPC)',
    unidad_medida: 'Porcentaje',
    fecha: '2026-06-01T00:00:00.000Z',
    valor: -0.2,
  },
  utm: {
    codigo: 'utm',
    nombre: 'Unidad Tributaria Mensual (UTM)',
    unidad_medida: 'Pesos',
    fecha: '2026-07-01T00:00:00.000Z',
    valor: 71000,
  },
  imacec: {
    codigo: 'imacec',
    nombre: 'Imacec',
    unidad_medida: 'Porcentaje',
    fecha: '2026-05-01T00:00:00.000Z',
    valor: -0.9,
  },
  tpm: {
    codigo: 'tpm',
    nombre: 'Tasa Politica Monetaria (TPM)',
    unidad_medida: 'Porcentaje',
    fecha: '2026-07-24T00:00:00.000Z',
    valor: 4.5,
  },
  libra_cobre: {
    codigo: 'libra_cobre',
    nombre: 'Libra de Cobre',
    unidad_medida: 'Dolar',
    fecha: '2026-07-24T00:00:00.000Z',
    valor: 6,
  },
  tasa_desempleo: {
    codigo: 'tasa_desempleo',
    nombre: 'Tasa de desempleo',
    unidad_medida: 'Porcentaje',
    fecha: '2026-05-01T00:00:00.000Z',
    valor: 9.44,
  },
};

function serieMockPara(codigo: string) {
  return {
    codigo,
    nombre: codigo,
    unidad_medida: 'Pesos',
    serie: [
      { fecha: '2026-07-25T00:00:00.000Z', valor: 1 },
      { fecha: '2026-06-25T00:00:00.000Z', valor: 1 },
    ],
  };
}

// Mockea la API a nivel de Playwright (interceptando lo que pide el navegador
// a nuestras propias rutas /api/*) para que los tests E2E nunca dependan de
// que mindicador.cl este disponible.
export async function mockMindicadorApi(page: Page) {
  await page.route('**/api/indicadores', async (route) => {
    await route.fulfill({ json: SNAPSHOT_MOCK });
  });

  await page.route('**/api/indicadores/*/*', async (route) => {
    const url = new URL(route.request().url());
    const [, , , codigo] = url.pathname.split('/');
    await route.fulfill({ json: serieMockPara(codigo) });
  });
}

export { SNAPSHOT_MOCK };
