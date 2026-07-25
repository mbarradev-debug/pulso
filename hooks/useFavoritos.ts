'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { INDICADOR_CODIGOS, type IndicadorCodigo } from '@/types/indicador';

const STORAGE_KEY = 'pulso.favoritos';

let cache: IndicadorCodigo[] = [];
let cacheInitialized = false;
const listeners = new Set<() => void>();

function parseFavoritos(raw: string | null): IndicadorCodigo[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((codigo): codigo is IndicadorCodigo =>
      (INDICADOR_CODIGOS as readonly string[]).includes(codigo),
    );
  } catch {
    return [];
  }
}

function readFromStorage(): IndicadorCodigo[] {
  try {
    return parseFavoritos(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function writeToStorage(favoritos: IndicadorCodigo[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
  } catch {
    // localStorage no disponible (modo privado, cuota excedida, etc.)
  }
}

function getSnapshot(): IndicadorCodigo[] {
  if (!cacheInitialized) {
    cache = readFromStorage();
    cacheInitialized = true;
  }
  return cache;
}

function getServerSnapshot(): IndicadorCodigo[] {
  return [];
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = parseFavoritos(event.newValue);
      onStoreChange();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener('storage', handleStorage);
  };
}

function setFavoritosStore(next: IndicadorCodigo[]) {
  cache = next;
  cacheInitialized = true;
  writeToStorage(next);
  listeners.forEach((listener) => listener());
}

export function useFavoritos() {
  const favoritos = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleFavorito = useCallback((codigo: IndicadorCodigo) => {
    const current = getSnapshot();
    const next = current.includes(codigo)
      ? current.filter((c) => c !== codigo)
      : [...current, codigo];
    setFavoritosStore(next);
  }, []);

  const esFavorito = useCallback(
    (codigo: IndicadorCodigo) => favoritos.includes(codigo),
    [favoritos],
  );

  return { favoritos, toggleFavorito, esFavorito };
}
