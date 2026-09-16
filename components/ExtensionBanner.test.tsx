import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ExtensionBanner } from '@/components/ExtensionBanner';

const STORAGE_KEY = 'pulso.aviso-extension-cerrado';

describe('ExtensionBanner', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('muestra el aviso con un enlace a la ficha de la extension en una pestana nueva', () => {
    render(<ExtensionBanner />);

    const enlace = screen.getByRole('link', { name: 'Pulso UF y Dólar' });
    expect(enlace).toHaveAttribute(
      'href',
      'https://chromewebstore.google.com/detail/pulso-uf-y-d%C3%B3lar/opakpmmcepebnccjjkhkgioopeadgihp',
    );
    expect(enlace).toHaveAttribute('target', '_blank');
    expect(enlace).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('se cierra al hacer click y persiste la eleccion en localStorage', async () => {
    const user = userEvent.setup();
    render(<ExtensionBanner />);

    await user.click(screen.getByRole('button', { name: 'Cerrar aviso' }));

    expect(screen.queryByRole('link', { name: 'Pulso UF y Dólar' })).not.toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('1');
  });

  it('no se muestra si el usuario ya lo cerro en una visita anterior', () => {
    window.localStorage.setItem(STORAGE_KEY, '1');
    render(<ExtensionBanner />);

    expect(screen.queryByRole('link', { name: 'Pulso UF y Dólar' })).not.toBeInTheDocument();
  });
});
