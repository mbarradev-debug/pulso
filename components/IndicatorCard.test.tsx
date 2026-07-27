import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { IndicatorCard } from '@/components/IndicatorCard';
import type { Indicador } from '@/types/indicador';

const dolarEjemplo: Indicador = {
  codigo: 'dolar',
  nombre: 'Dólar observado',
  unidad_medida: 'Pesos',
  fecha: '2026-07-25T04:00:00.000Z',
  valor: 946.24,
};

const ipcEjemplo: Indicador = {
  codigo: 'ipc',
  nombre: 'Indice de Precios al Consumidor (IPC)',
  unidad_medida: 'Porcentaje',
  fecha: '2026-06-01T04:00:00.000Z',
  valor: -0.2,
};

describe('IndicatorCard', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renderiza el nombre y el valor formateado como moneda', () => {
    render(<IndicatorCard codigo="dolar" indicador={dolarEjemplo} />);
    expect(screen.getByText('Dólar observado')).toBeInTheDocument();
    expect(screen.getByText('$946')).toBeInTheDocument();
  });

  it('renderiza el valor formateado como porcentaje segun la unidad de medida', () => {
    render(<IndicatorCard codigo="ipc" indicador={ipcEjemplo} />);
    expect(screen.getByText('-0,20%')).toBeInTheDocument();
  });

  it('muestra "Dato no disponible" cuando el indicador tiene error, de forma aislada', () => {
    render(<IndicatorCard codigo="dolar" error />);
    expect(screen.getByText('Dato no disponible')).toBeInTheDocument();
    expect(screen.queryByText('$946')).not.toBeInTheDocument();
  });

  it('muestra "Dato no disponible" cuando no llega el indicador', () => {
    render(<IndicatorCard codigo="dolar" />);
    expect(screen.getByText('Dato no disponible')).toBeInTheDocument();
  });

  it('no muestra "Dato no disponible" mientras esta cargando, aunque no haya indicador', () => {
    render(<IndicatorCard codigo="dolar" isLoading />);
    expect(screen.queryByText('Dato no disponible')).not.toBeInTheDocument();
  });
});
