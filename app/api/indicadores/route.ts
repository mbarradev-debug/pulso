import { NextResponse } from 'next/server';
import { obtenerSnapshot } from '@/lib/indicadores-snapshot';

// Los Route Handlers no cachean por defecto en esta version de Next.js (sin
// Cache Components): hace falta "dynamic = 'force-static'" ademas del
// `next.revalidate` en el fetch de lib/bcentral-client.ts para que el
// resultado efectivamente participe del cache. El numero debe coincidir con
// REVALIDATE_SECONDS alla.
export const dynamic = 'force-static';
export const revalidate = 300;

export async function GET() {
  const snapshot = await obtenerSnapshot();

  if (!snapshot) {
    return NextResponse.json(
      { error: 'No se pudo obtener ningun indicador desde el Banco Central' },
      { status: 502 },
    );
  }

  return NextResponse.json(snapshot, { status: 200 });
}
