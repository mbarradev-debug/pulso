import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'pulso.favoritos';

describe('useFavoritos', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  it('alterna un indicador como favorito y lo persiste en localStorage', async () => {
    const { useFavoritos } = await import('@/hooks/useFavoritos');
    const { result } = renderHook(() => useFavoritos());

    expect(result.current.esFavorito('uf')).toBe(false);

    act(() => {
      result.current.toggleFavorito('uf');
    });

    expect(result.current.esFavorito('uf')).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(['uf']);
  });

  it('quita un favorito ya marcado al alternarlo de nuevo', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['uf', 'dolar']));
    const { useFavoritos } = await import('@/hooks/useFavoritos');
    const { result } = renderHook(() => useFavoritos());

    expect(result.current.favoritos).toEqual(['uf', 'dolar']);

    act(() => {
      result.current.toggleFavorito('uf');
    });

    expect(result.current.esFavorito('uf')).toBe(false);
    expect(result.current.favoritos).toEqual(['dolar']);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(['dolar']);
  });

  it('ignora codigos invalidos persistidos previamente en localStorage', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['uf', 'no-existe', 123]));
    const { useFavoritos } = await import('@/hooks/useFavoritos');
    const { result } = renderHook(() => useFavoritos());

    expect(result.current.favoritos).toEqual(['uf']);
  });

  it('no rompe la app si localStorage no esta disponible al escribir', async () => {
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
    window.localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };

    const { useFavoritos } = await import('@/hooks/useFavoritos');
    const { result } = renderHook(() => useFavoritos());

    expect(() => {
      act(() => {
        result.current.toggleFavorito('uf');
      });
    }).not.toThrow();

    // El estado en memoria se actualiza igual aunque falle la persistencia.
    expect(result.current.esFavorito('uf')).toBe(true);

    window.localStorage.setItem = originalSetItem;
  });
});
