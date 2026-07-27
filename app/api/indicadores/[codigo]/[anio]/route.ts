import { NextResponse } from 'next/server';
import { BancoCentralApiError, getSerieHistorica } from '@/lib/bcentral-client';
import { INDICADOR_CODIGOS, type IndicadorCodigo } from '@/types/indicador';

const MIN_ANIO = 1970;

function isIndicadorCodigo(value: string): value is IndicadorCodigo {
  return (INDICADOR_CODIGOS as readonly string[]).includes(value);
}

function fechaISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Banco Central pide rangos de fechas explicitos (firstdate/lastdate), no
// anios calendario. Se deriva el rango del anio pedido: 1 de enero a 31 de
// diciembre, salvo que sea el anio en curso, donde se corta en "hoy" para no
// pedir fechas futuras sin necesidad (ver docs/migracion-banco-central.md).
function rangoDelAnio(anio: number): { firstdate: string; lastdate: string } {
  const hoy = new Date();
  const firstdate = `${anio}-01-01`;
  const finDeAnio = new Date(Date.UTC(anio, 11, 31));
  const lastdate = anio === hoy.getUTCFullYear() ? fechaISO(hoy) : fechaISO(finDeAnio);
  return { firstdate, lastdate };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ codigo: string; anio: string }> },
) {
  const { codigo, anio } = await params;

  if (!isIndicadorCodigo(codigo)) {
    return NextResponse.json(
      { error: `codigo invalido: ${codigo}. Valores soportados: ${INDICADOR_CODIGOS.join(', ')}` },
      { status: 400 },
    );
  }

  const anioNum = /^\d{4}$/.test(anio) ? Number(anio) : NaN;
  const anioMaximo = new Date().getFullYear();
  if (Number.isNaN(anioNum) || anioNum < MIN_ANIO || anioNum > anioMaximo) {
    return NextResponse.json(
      {
        error: `anio invalido: ${anio}. Debe ser un numero de 4 digitos entre ${MIN_ANIO} y ${anioMaximo}`,
      },
      { status: 400 },
    );
  }

  const { firstdate, lastdate } = rangoDelAnio(anioNum);

  try {
    const historico = await getSerieHistorica(codigo, firstdate, lastdate);
    return NextResponse.json(historico, { status: 200 });
  } catch (error) {
    if (error instanceof BancoCentralApiError) {
      return NextResponse.json(
        { error: `Banco Central fallo para ${codigo}: ${error.message}` },
        { status: 502 },
      );
    }
    const message =
      error instanceof Error ? error.message : 'Error desconocido al consultar Banco Central';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
