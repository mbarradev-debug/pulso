import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// No usamos `test.globals` en vitest.config.ts (se importa afterEach explicito
// en cada test), asi que @testing-library/react no detecta un afterEach global
// para desmontar automaticamente: se registra aqui para no dejar el DOM de un
// test filtrando al siguiente.
afterEach(() => {
  cleanup();
});
