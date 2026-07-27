import { NextResponse } from 'next/server';
import { BancoCentralApiError, getUltimoValor } from '@/lib/bcentral-client';
import {
  INDICADOR_CODIGOS,
  type Indicador,
  type IndicadorCodigo,
  type IndicadoresSnapshot,
} from '@/types/indicador';

// Los Route Handlers no cachean por defecto en esta version de Next.js (sin
// Cache Components): hace falta "dynamic = 'force-static'" ademas del
// `next.revalidate` en el fetch de lib/bcentral-client.ts para que el
// resultado efectivamente participe del cache. El numero debe coincidir con
// REVALIDATE_SECONDS alla.
export const dynamic = 'force-static';
export const revalidate = 300;

// Cache por indicador (no un snapshot unico): cada codigo guarda su ultimo
// valor exitoso de forma independiente. El snapshot son 10 llamadas
// independientes a Banco Central - si una falla, se sirve el ultimo valor
// cacheado de ESE indicador sin afectar al resto (ver
// docs/migracion-banco-central.md, decision de resiliencia).
const cachePorIndicador = new Map<IndicadorCodigo, Indicador>();

async function obtenerConFallback(codigo: IndicadorCodigo): Promise<Indicador | undefined> {
  try {
    const indicador = await getUltimoValor(codigo);
    cachePorIndicador.set(codigo, indicador);
    return indicador;
  } catch (error) {
    if (error instanceof BancoCentralApiError) {
      console.error(
        `Banco Central fallo para ${codigo} (serie ${error.codigoSerie}, Codigo ${error.codigoRespuesta ?? 'N/A'}): ${error.message}`,
      );
    } else {
      console.error(`Error inesperado obteniendo ${codigo} de Banco Central:`, error);
    }
    return cachePorIndicador.get(codigo);
  }
}

export async function GET() {
  const resultados = await Promise.all(INDICADOR_CODIGOS.map(obtenerConFallback));

  const indicadores: Partial<Record<IndicadorCodigo, Indicador>> = {};
  INDICADOR_CODIGOS.forEach((codigo, indice) => {
    const valor = resultados[indice];
    if (valor) {
      indicadores[codigo] = valor;
    }
  });

  if (Object.keys(indicadores).length === 0) {
    return NextResponse.json(
      { error: 'No se pudo obtener ningun indicador desde el Banco Central' },
      { status: 502 },
    );
  }

  const snapshot: IndicadoresSnapshot = {
    version: '2.0',
    autor: 'Banco Central de Chile',
    fecha: new Date().toISOString(),
    ...indicadores,
  };

  return NextResponse.json(snapshot, { status: 200 });
}
