# Análisis de Dependencias

Este documento analiza las bibliotecas y paquetes de software especificados en el archivo `package.json` de **Pulso**.

---

## 📦 Dependencias de Producción (`dependencies`)

| Paquete             | Versión   | Propósito / Rol en la Aplicación                                                                                                         |
| ------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `next`              | `16.2.11` | Framework principal del proyecto. Proveedor de App Router, Server Components, Route Handlers y optimización de assets.                   |
| `react`             | `19.2.4`  | Biblioteca de UI central. Aprovecha características de React 19 como `useSyncExternalStore` y Server Actions.                            |
| `react-dom`         | `19.2.4`  | Renderizador DOM para React.                                                                                                             |
| `swr`               | `2.4.2`   | Biblioteca de Data Fetching para React. Maneja el caché del cliente, revalidación en foco e hidratación desde el servidor (`SWRConfig`). |
| `chart.js`          | `4.5.1`   | Motor gráfico basado en Canvas 2D. Utilizado para renderizar las curvas temporales de series históricas de manera fluida y optimizada.   |
| `react-chartjs-2`   | `5.3.1`   | Wrapper de React para integrar componentes declarativos de `chart.js`.                                                                   |
| `@vercel/analytics` | `2.0.1`   | Módulo de analíticas en tiempo real para recopilar métricas de uso y rendimiento en la nube de Vercel.                                   |

---

## 🛠️ Dependencias de Desarrollo (`devDependencies`)

| Paquete                       | Versión   | Propósito / Rol en la Aplicación                                                                            |
| ----------------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| `typescript`                  | `^5`      | Lenguaje de programación con sistema de tipos estático.                                                     |
| `tailwindcss`                 | `^4`      | Framework CSS utilitario v4.                                                                                |
| `@tailwindcss/postcss`        | `^4`      | Plugin de PostCSS para procesar estilos de TailwindCSS v4.                                                  |
| `vitest`                      | `^4.1.10` | Runner de pruebas unitarias ultrarrápido integrado con Vite.                                                |
| `@testing-library/react`      | `^16.3.2` | Utilidades para probar componentes de React simulando la perspectiva del usuario.                           |
| `@testing-library/jest-dom`   | `^7.0.0`  | Matchers de Jest/Vitest personalizados para aserciones sobre el DOM (`toBeInTheDocument`, etc.).            |
| `@testing-library/user-event` | `^14.6.1` | Simulación realista de eventos de teclado y ratón en los tests.                                             |
| `jsdom`                       | `^29.1.1` | Implementación pura en Node.js de los estándares DOM y HTML Web APIs para pruebas.                          |
| `@playwright/test`            | `^1.62.0` | Framework de pruebas End-to-End para automatizar navegadores reales (Chromium).                             |
| `eslint`                      | `^9`      | Linter de código estático.                                                                                  |
| `eslint-config-next`          | `16.2.11` | Reglas oficiales de linting recomendadas por el equipo de Next.js.                                          |
| `eslint-config-prettier`      | `^10.1.8` | Desactiva reglas de ESLint que puedan entrar en conflicto con Prettier.                                     |
| `prettier`                    | `^3.9.6`  | Formateador de código automático.                                                                           |
| `husky`                       | `^9.1.7`  | Gestor de Git Hooks para ejecutar validaciones en pre-commit.                                               |
| `lint-staged`                 | `^17.2.0` | Ejecuta linters y formateadores únicamente sobre los archivos agregados al Git Staging Area.                |
| `cross-env`                   | `^10.1.0` | Permite definir variables de entorno en comandos de scripts de forma multiplataforma (Windows/macOS/Linux). |
