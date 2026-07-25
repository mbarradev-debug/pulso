import { NextResponse } from 'next/server';
import { getHistorico } from '@/lib/mindicador-client';
import { INDICADOR_CODIGOS, type IndicadorCodigo } from '@/types/indicador';

const REVALIDATE_SECONDS = 3600;
const MIN_ANIO = 1970;

function isIndicadorCodigo(value: string): value is IndicadorCodigo {
  return (INDICADOR_CODIGOS as readonly string[]).includes(value);
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

  try {
    const historico = await getHistorico(codigo, anioNum, { revalidate: REVALIDATE_SECONDS });
    return NextResponse.json(historico, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido al consultar mindicador.cl';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
