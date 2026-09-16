import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'pulso.aviso-extension-cerrado';

describe('useAvisoExtension', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  it('muestra el aviso por defecto cuando no hay preferencia guardada', async () => {
    const { useAvisoExtension } = await import('@/hooks/useAvisoExtension');
    const { result } = renderHook(() => useAvisoExtension());

    expect(result.current.cerrado).toBe(false);
  });

  it('cierra el aviso y lo persiste en localStorage', async () => {
    const { useAvisoExtension } = await import('@/hooks/useAvisoExtension');
    const { result } = renderHook(() => useAvisoExtension());

    act(() => {
      result.current.cerrarAviso();
    });

    expect(result.current.cerrado).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('1');
  });

  it('respeta el cierre guardado entre renders/visitas', async () => {
    window.localStorage.setItem(STORAGE_KEY, '1');
    const { useAvisoExtension } = await import('@/hooks/useAvisoExtension');
    const { result } = renderHook(() => useAvisoExtension());

    expect(result.current.cerrado).toBe(true);
  });

  it('no rompe la app si localStorage no esta disponible al escribir', async () => {
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
    window.localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };

    const { useAvisoExtension } = await import('@/hooks/useAvisoExtension');
    const { result } = renderHook(() => useAvisoExtension());

    expect(() => {
      act(() => {
        result.current.cerrarAviso();
      });
    }).not.toThrow();

    expect(result.current.cerrado).toBe(true);

    window.localStorage.setItem = originalSetItem;
  });
});
