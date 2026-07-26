import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Converter } from '@/components/Converter';
import { useIndicadores } from '@/hooks/useIndicadores';
import type { Indicador, IndicadoresSnapshot } from '@/types/indicador';

vi.mock('@/hooks/useIndicadores', () => ({
  useIndicadores: vi.fn(),
}));

function makeIndicador(overrides: Partial<Indicador>): Indicador {
  return {
    codigo: 'uf',
    nombre: 'Unidad de fomento (UF)',
    unidad_medida: 'Pesos',
    fecha: '2026-07-25T04:00:00.000Z',
    valor: 40000,
    ...overrides,
  };
}

function makeSnapshot(): IndicadoresSnapshot {
  const generico = (codigo: Indicador['codigo']) => makeIndicador({ codigo, nombre: codigo });
  return {
    version: '1.0',
    autor: 'test',
    fecha: '2026-07-25T04:00:00.000Z',
    uf: makeIndicador({ codigo: 'uf', nombre: 'Unidad de fomento (UF)', valor: 40000 }),
    ivp: generico('ivp'),
    dolar: generico('dolar'),
    dolar_intercambio: generico('dolar_intercambio'),
    euro: generico('euro'),
    ipc: makeIndicador({
      codigo: 'ipc',
      nombre: 'IPC',
      unidad_medida: 'Porcentaje',
      valor: -0.2,
    }),
    utm: generico('utm'),
    imacec: generico('imacec'),
    tpm: generico('tpm'),
    libra_cobre: generico('libra_cobre'),
    tasa_desempleo: generico('tasa_desempleo'),
    bitcoin: generico('bitcoin'),
  };
}

describe('Converter', () => {
  beforeEach(() => {
    vi.mocked(useIndicadores).mockReturnValue({
      data: makeSnapshot(),
      isLoading: false,
      error: undefined,
    });
  });

  it('convierte de CLP a indicador (direccion inicial) usando el monto por defecto', () => {
    render(<Converter />);
    expect(screen.getByText('Equivalente en UF')).toBeInTheDocument();
    // 100.000 CLP / 40.000 = 2,5 UF
    expect(screen.getByText('2,5')).toBeInTheDocument();
  });

  it('invierte la conversion a indicador -> CLP al usar el boton de swap', async () => {
    const user = userEvent.setup();
    render(<Converter />);

    await user.click(screen.getByRole('button', { name: 'Invertir conversion' }));

    expect(screen.getByText('Equivalente en CLP')).toBeInTheDocument();
    // El monto quedo en 2.5 UF tras el swap; 2.5 * 40.000 = 100.000 CLP
    expect(screen.getByText('$100.000')).toBeInTheDocument();
  });

  it('trata un monto invalido (negativo) como 0 en vez de romper el calculo', async () => {
    const user = userEvent.setup();
    render(<Converter />);

    const input = screen.getByLabelText('Monto en CLP');
    await user.clear(input);
    await user.type(input, '-50');

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('muestra el valor porcentual sin conversion cuando el indicador es porcentual', async () => {
    const user = userEvent.setup();
    render(<Converter />);

    await user.selectOptions(screen.getByLabelText('Indicador'), 'ipc');

    expect(screen.getByText(/no convertible/i)).toBeInTheDocument();
    expect(screen.getByText('-0,20%')).toBeInTheDocument();
  });
});
