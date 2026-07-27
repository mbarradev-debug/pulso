const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const porcentajeFormatter = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fechaFormatter = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Santiago',
});

const ZERO_PORCENTAJE = porcentajeFormatter.format(0);

export function formatCLP(valor: number): string {
  return clpFormatter.format(valor);
}

export function formatPorcentaje(valor: number): string {
  const magnitud = porcentajeFormatter.format(Math.abs(valor));
  const signo = magnitud === ZERO_PORCENTAJE ? '' : valor > 0 ? '+' : '-';
  return `${signo}${magnitud}%`;
}

export function formatFecha(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return fechaFormatter.format(date);
}

export function formatValorPorUnidad(valor: number, unidadMedida?: string): string {
  // Solo existen formatCLP/formatPorcentaje (MDI-010): libra_cobre (unidad
  // "Dolar") se muestra con formatCLP por ahora.
  if (unidadMedida === 'Porcentaje') {
    return formatPorcentaje(valor);
  }
  return formatCLP(valor);
}
