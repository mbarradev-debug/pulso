# Variables de Entorno y Configuración del Entorno

Este documento describe todas las variables de entorno, archivos de configuración del proyecto y herramientas de tooling utilizadas en **Pulso**.

---

## 🔑 Variables de Entorno

Para que la aplicación pueda consultar la API del Banco Central de Chile, es indispensable configurar las credenciales oficiales en las variables de entorno del servidor.

### Lista de Variables:

| Variable        | Tipo      | Requerida | Entorno  | Descripción                                                                                  | Ejemplo                |
| --------------- | --------- | --------- | -------- | -------------------------------------------------------------------------------------------- | ---------------------- |
| `BCENTRAL_USER` | `string`  | **Sí**    | Servidor | Nombre de usuario / Email registrado en la plataforma SieteRestWS del Banco Central de Chile | `mi_usuario@correo.cl` |
| `BCENTRAL_PASS` | `string`  | **Sí**    | Servidor | Contraseña asociada a la cuenta del Banco Central de Chile                                   | `SecretPass123!`       |
| `CI`            | `boolean` | No        | CI/CD    | Variable inyectada automáticamente por entornos de Integración Continua (GitHub Actions)     | `true`                 |

### Archivos de Configuración de Entorno:

- `.env.example`: Archivo de plantilla seguro para ser commiteado en el repositorio (contiene claves sin valores sensibles).
- `.env.local`: Archivo de configuración local no commiteado (ignorado en `.gitignore`) que contiene los secretos reales para desarrollo.

> [!IMPORTANT]
> **Ninguna variable debe llevar el prefijo `NEXT_PUBLIC_`**. Las credenciales del Banco Central deben permanecer estrictamente restringidas a las ejecuciones dentro del servidor Node.js.

---

## ⚙️ Archivos de Configuración del Proyecto

### 1. `next.config.ts`

- Configuración principal del framework Next.js. Define opciones del compilador y soporte de TypeScript.

### 2. `tsconfig.json`

- Configuración del compilador de TypeScript:
  - `target`: `ES2017`
  - `strict`: `true` (Modo estricto activado).
  - `moduleResolution`: `"bundler"`
  - `paths`: Alias de importación `@/*` mapeado al directorio raíz `./*`.

### 3. `postcss.config.mjs` & TailwindCSS v4

- Configuración de PostCSS que integra `@tailwindcss/postcss` v4.
- TailwindCSS v4 utiliza la directiva `@import "tailwindcss";` dentro de `app/globals.css` junto con variables CSS nativas (`--color-surface`, `--color-accent`, etc.).

### 4. `eslint.config.mjs`

- Configuración Flat Config de ESLint v9 integrada con `eslint-config-next` y `eslint-config-prettier`.

### 5. `vitest.config.ts` & `vitest-setup.ts`

- Entorno de pruebas unitarias Vitest:
  - Utiliza `jsdom` simulando la URL `http://localhost:3000` para dar soporte a `localStorage`.
  - Importa `@testing-library/jest-dom` y ejecuta limpieza automática de DOM en `afterEach`.
  - Excluye el directorio `e2e/**` (reservado para Playwright).

### 6. `playwright.config.ts`

- Configuración de pruebas End-to-End:
  - Ejecuta los tests contra la compilación real de producción (`npm run build && npm run start`).
  - Utiliza navegador Chromium y servidor local en puerto 3000.
