import { BancoCentralApiError, getUltimoValor } from '@/lib/bcentral-client';
import {
  INDICADOR_CODIGOS,
  type Indicador,
  type IndicadorCodigo,
  type IndicadoresSnapshot,
} from '@/types/indicador';

// Cache por indicador (no un snapshot unico): cada codigo guarda su ultimo
// valor exitoso de forma independiente. Compartido entre el Route Handler
// (app/api/indicadores/route.ts) y el Server Component de la home
// (app/page.tsx) para que ambos usen el mismo cache de resiliencia en vez de
// mantener dos copias separadas (ver docs/migracion-banco-central.md,
// decision de resiliencia).
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

// null cuando ningun indicador tiene valor disponible (ni fresco ni
// cacheado) - quien llama decide como degradar (502 en el Route Handler,
// sin snapshot inicial en el Server Component).
export async function obtenerSnapshot(): Promise<IndicadoresSnapshot | null> {
  const resultados = await Promise.all(INDICADOR_CODIGOS.map(obtenerConFallback));

  const indicadores: Partial<Record<IndicadorCodigo, Indicador>> = {};
  INDICADOR_CODIGOS.forEach((codigo, indice) => {
    const valor = resultados[indice];
    if (valor) {
      indicadores[codigo] = valor;
    }
  });

  if (Object.keys(indicadores).length === 0) {
    return null;
  }

  return {
    version: '2.0',
    autor: 'Banco Central de Chile',
    fecha: new Date().toISOString(),
    ...indicadores,
  };
}
