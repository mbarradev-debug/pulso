'use client';

import { useMemo, useState } from 'react';
import { useIndicadores } from '@/hooks/useIndicadores';
import { formatCLP, formatPorcentaje } from '@/lib/format';
import { INDICADOR_CODIGOS, type IndicadorCodigo } from '@/types/indicador';

type Direccion = 'clpAIndicador' | 'indicadorAClp';

export function Converter() {
  const { data, isLoading, error } = useIndicadores();
  const [codigo, setCodigo] = useState<IndicadorCodigo>('uf');
  const [direccion, setDireccion] = useState<Direccion>('clpAIndicador');
  const [montoTexto, setMontoTexto] = useState('100000');

  const indicador = data?.[codigo];
  const esPorcentaje = indicador?.unidad_medida === 'Porcentaje';

  const montoNumerico = useMemo(() => {
    const parsed = Number(montoTexto);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed;
  }, [montoTexto]);

  const resultado = useMemo(() => {
    if (!indicador || indicador.valor === 0) return null;
    return direccion === 'clpAIndicador'
      ? montoNumerico / indicador.valor
      : montoNumerico * indicador.valor;
  }, [indicador, montoNumerico, direccion]);

  function handleSwap() {
    if (resultado !== null) {
      setMontoTexto(String(Math.round(resultado * 100) / 100));
    }
    setDireccion((prev) => (prev === 'clpAIndicador' ? 'indicadorAClp' : 'clpAIndicador'));
  }

  if (error && !data) {
    return (
      <div className="rounded border border-border bg-surface p-6 text-sm text-foreground-secondary">
        No se pudo cargar el conversor.
      </div>
    );
  }

  return (
    <div className="rounded border border-border bg-surface p-6">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs text-foreground-secondary" htmlFor="conv-amount">
            {direccion === 'clpAIndicador' ? 'Monto en CLP' : `Monto en ${codigo.toUpperCase()}`}
          </label>
          <input
            id="conv-amount"
            type="number"
            min={0}
            step="any"
            value={montoTexto}
            onChange={(e) => setMontoTexto(e.target.value)}
            className="w-full rounded border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          />
        </div>
        <button
          type="button"
          onClick={handleSwap}
          title="Invertir conversion"
          aria-label="Invertir conversion"
          className="rounded border border-border bg-surface-2 p-2 text-foreground-secondary transition-colors hover:border-border-strong hover:text-accent"
        >
          ⇄
        </button>
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs text-foreground-secondary" htmlFor="conv-indicador">
            Indicador
          </label>
          <select
            id="conv-indicador"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value as IndicadorCodigo)}
            className="w-full rounded border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          >
            {INDICADOR_CODIGOS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded border-l-2 border-accent bg-surface-2 p-4">
        {isLoading && !data ? (
          <p className="text-sm text-foreground-muted">Cargando valor del dia...</p>
        ) : !indicador ? (
          <p className="text-sm text-foreground-muted">Dato no disponible para {codigo}.</p>
        ) : esPorcentaje ? (
          <>
            <p className="mb-1 text-xs text-foreground-muted">
              {codigo.toUpperCase()} es un indicador porcentual, no convertible. Valor actual:
            </p>
            <p className="mono text-lg font-semibold text-foreground">
              {formatPorcentaje(indicador.valor)}
            </p>
          </>
        ) : (
          <>
            <p className="mb-1 text-xs text-foreground-muted">
              Equivalente en {direccion === 'clpAIndicador' ? codigo.toUpperCase() : 'CLP'}
            </p>
            <p className="mono text-lg font-semibold text-foreground">
              {direccion === 'clpAIndicador'
                ? (resultado ?? 0).toLocaleString('es-CL', { maximumFractionDigits: 4 })
                : formatCLP(resultado ?? 0)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
