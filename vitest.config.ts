import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        // jsdom por defecto usa url: "about:blank" (origen opaco), donde
        // localStorage no esta disponible. useFavoritos depende de localStorage.
        url: 'http://localhost:3000',
      },
    },
    setupFiles: ['./vitest-setup.ts'],
    // e2e/**/*.spec.ts son tests de Playwright (otro test runner, otro API de
    // test/expect): excluidos para que Vitest no intente correrlos.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
