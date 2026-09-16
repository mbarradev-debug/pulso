'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'pulso.aviso-extension-cerrado';

let cache = false;
let cacheInitialized = false;
const listeners = new Set<() => void>();

function readFromStorage(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeToStorage(cerrado: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, cerrado ? '1' : '0');
  } catch {
    // localStorage no disponible (modo privado, cuota excedida, etc.)
  }
}

function getSnapshot(): boolean {
  if (!cacheInitialized) {
    cache = readFromStorage();
    cacheInitialized = true;
  }
  return cache;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = event.newValue === '1';
      onStoreChange();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener('storage', handleStorage);
  };
}

export function useAvisoExtension() {
  const cerrado = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const cerrarAviso = useCallback(() => {
    cache = true;
    cacheInitialized = true;
    writeToStorage(true);
    listeners.forEach((listener) => listener());
  }, []);

  return { cerrado, cerrarAviso };
}
