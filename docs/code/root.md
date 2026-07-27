# Documentación de Código: Archivos Raíz y Configuración

Este documento detalla los archivos de configuración y scripts ubicados en la raíz del repositorio de **Pulso**.

---

## 📂 Archivos en la Raíz

### 1. `proxy.ts`

- **Responsabilidad**: Middleware de protección para la ruta `/dev/ui`.
- **Funcionamiento**: Intercepta peticiones a `/dev/ui`. Si `process.env.NODE_ENV === 'production'`, retorna un código HTTP `404 Not Found`.

---

### 2. `next.config.ts`

- **Responsabilidad**: Objeto de configuración principal para la compilación y ejecución de Next.js.

---

### 3. `tsconfig.json`

- **Responsabilidad**: Configuración del compilador TypeScript (modo estricto, alias `@/*`, target ES2017).

---

### 4. `eslint.config.mjs`

- **Responsabilidad**: Reglas de análisis de código estático (ESLint v9 Flat Config).

---

### 5. `postcss.config.mjs`

- **Responsabilidad**: Integración de PostCSS con `@tailwindcss/postcss` v4.

---

### 6. `vitest.config.ts` & `vitest-setup.ts`

- **Responsabilidad**: Configuración del runner de pruebas unitarias Vitest con entorno `jsdom` (configurado en `http://localhost:3000` para `localStorage`) y limpieza automática de DOM.

---

### 7. `playwright.config.ts`

- **Responsabilidad**: Configuración de pruebas automatizadas End-to-End con Playwright sobre la compilación de producción (`npm run build && npm run start`).

---

### 8. `package.json`

- **Responsabilidad**: Manifiesto de dependencias, información del proyecto y scripts npm (`dev`, `build`, `start`, `lint`, `format`, `test`, `test:e2e`).
