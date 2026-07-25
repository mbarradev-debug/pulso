import { NextResponse } from 'next/server';
import { getSnapshot } from '@/lib/mindicador-client';
import type { IndicadoresSnapshot } from '@/types/indicador';

const REVALIDATE_SECONDS = 300;

let lastSnapshot: IndicadoresSnapshot | null = null;

export async function GET() {
  try {
    const snapshot = await getSnapshot({ revalidate: REVALIDATE_SECONDS });
    lastSnapshot = snapshot;
    return NextResponse.json(snapshot, { status: 200 });
  } catch (error) {
    if (lastSnapshot) {
      return NextResponse.json(lastSnapshot, { status: 200 });
    }

    const message =
      error instanceof Error ? error.message : 'Error desconocido al consultar mindicador.cl';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
