# Estructura de Carpetas y Responsabilidades

Este documento proporciona una guía completa de la organización física de archivos en el repositorio de **Pulso**, explicando la responsabilidad de cada carpeta y las convenciones del proyecto.

---

## 🌳 Árbol Completo del Proyecto

```
pulso/
├── .claude/                   # Configuraciones locales de herramientas AI
├── .github/                   # Workflows de CI/CD (GitHub Actions)
├── .husky/                    # Git Hooks (pre-commit, lint-staged)
├── app/                       # Rutas y páginas de Next.js (App Router)
│   ├── api/                   # Route Handlers de la API interna
│   │   └── indicadores/       # Endpoints /api/indicadores y /api/indicadores/[codigo]/[anio]
│   ├── dev/                   # Entorno de desarrollo aislado
│   │   └── ui/                # Showcase / Playground de componentes UI
│   ├── error.tsx              # Error Boundary global de la aplicación
│   ├── favicon.ico            # Favicon del sitio
│   ├── globals.css            # Estilos globales y tokens CSS de Tailwind v4
│   ├── layout.tsx             # Root Layout (Fuentes, Analytics, HTML wrapper)
│   ├── loading.tsx            # UI de carga inicial (Skeleton fallback)
│   ├── not-found.tsx          # Página 404 personalizada
│   ├── opengraph-image.tsx    # Generación dinámica de imagen OpenGraph (@vercel/og)
│   ├── page.tsx               # Server Component principal de la Home Page
│   ├── robots.ts              # Generador de robots.txt
│   └── sitemap.ts             # Generador de sitemap.xml
├── components/                # Componentes React de UI reutilizables
│   ├── Button.tsx             # Botón estándar reutilizable con variantes
│   ├── Converter.tsx          # Herramienta de conversión de divisas e indicadores
│   ├── Converter.test.tsx     # Tests unitarios del conversor
│   ├── DashboardHome.tsx      # Dashboard principal (Client Component)
│   ├── FavoritesToggle.tsx    # Botón tipo estrella para favoritos
│   ├── HistoryChart.tsx       # Gráfico de líneas (Chart.js / react-chartjs-2)
│   ├── IndicatorCard.tsx      # Tarjeta individual de indicador
│   ├── IndicatorCard.test.tsx # Tests unitarios de IndicatorCard
│   ├── Skeleton.tsx           # Loader genérico tipo esqueleto con animación
│   ├── Spinner.tsx            # Indicador de carga animado tipo spinner
│   └── VariationBadge.tsx     # Badge visual de variaciones porcentuales (↑ / ↓)
├── docs/                      # Documentación técnica completa del proyecto
│   ├── code/                  # Documentación granular de cada archivo por carpeta
│   └── *.md                   # Arquitectura, servicios, componentes, etc.
├── e2e/                       # Pruebas End-to-End con Playwright
│   ├── dashboard.spec.ts      # Tests E2E de interacción en el dashboard
│   └── mocks.ts               # Mocks de red para simular respuestas de API
├── hooks/                     # Custom Hooks de React
│   ├── useFavoritos.ts        # Hook de sincronización de favoritos (localStorage)
│   ├── useFavoritos.test.tsx  # Tests unitarios de useFavoritos
│   ├── useIndicadores.ts      # Hook de carga de snapshot vía SWR
│   ├── useIndicadores.test.tsx# Tests unitarios de useIndicadores
│   ├── useIndicadorHistory.ts # Hook de carga de series históricas multianuales
│   └── useIndicadorHistory.test.tsx # Tests unitarios de useIndicadorHistory
├── lib/                       # Utilidades backend, clientes HTTP y lógica de negocio
│   ├── bcentral-client.ts     # Cliente HTTP del Banco Central (SI3 SieteRestWS)
│   ├── bcentral-client.test.ts# Tests unitarios del cliente del Banco Central
│   ├── format.ts              # Formateadores numéricos y de fechas es-CL
│   └── indicadores-snapshot.ts# Motor de resiliencia y caché de snapshots
├── public/                    # Archivos estáticos públicos (imágenes, fuentes, etc.)
├── types/                     # Definiciones e interfaces TypeScript
│   └── indicador.ts           # Modelos de datos del dominio
├── AGENTS.md                  # Reglas del entorno para agentes de IA
├── eslint.config.mjs          # Configuración de ESLint v9 (Flat Config)
├── next.config.ts             # Configuración de Next.js
├── package.json               # Dependencias y scripts del proyecto
├── playwright.config.ts       # Configuración de Playwright E2E
├── postcss.config.mjs         # Configuración de PostCSS / TailwindCSS v4
├── proxy.ts                   # Middleware Dev Proxy para bloqueo de /dev/ui en prod
├── tsconfig.json              # Configuración del compilador TypeScript
├── vitest.config.ts           # Configuración del test runner Vitest
└── vitest-setup.ts            # Script de inicialización de entornos de prueba Vitest
```

---

## 🏢 Responsabilidades por Carpeta

### 1. `app/` (Next.js App Router)

- **Responsabilidad**: Enrutamiento, layouts, metadatos SEO, renderizado en servidor (SSR) y endpoints de API internos.
- **Interacciones**: Consume la capa `lib/` para obtener datos e hidrata los Client Components en `components/`.
- **Convenciones**: Uso de Server Components por defecto, optando por `'use client'` únicamente cuando se requiere interactividad o estado.

### 2. `components/` (UI Components)

- **Responsabilidad**: Presentación visual e interacción con el usuario.
- **Interacciones**: Consumen hooks de `hooks/`, utilidades de `lib/format.ts` y tipos de `types/indicador.ts`.
- **Convenciones**: Componentes funcionales orientados a accesibilidad, con soporte de eventos de teclado y estilos expresados mediante utilidades CSS de Tailwind v4.

### 3. `hooks/` (Custom React Hooks)

- **Responsabilidad**: Encapsular estado del cliente, efectos secundarios y lógica de llamadas de datos reactivas.
- **Interacciones**: Utilizan `useSWR` para caché de datos remotos y `useSyncExternalStore` para almacenamiento local (`localStorage`).

### 4. `lib/` (Core Business Logic & External API Clients)

- **Responsabilidad**: Comunicación directa con APIs externas, transformación de formatos de datos, decodificación de caracteres y gestión de caché en memoria volatil.
- **Interacciones**: Es la única capa que interactúa con el mundo exterior (Banco Central de Chile) y no posee dependencias hacia componentes de UI o hooks.

### 5. `types/` (TypeScript Definitions)

- **Responsabilidad**: Definición de contratos de tipos e interfaces inmutables compartidas a través de toda la aplicación.

### 6. `e2e/` (Pruebas de Integración End-to-End)

- **Responsabilidad**: Pruebas automáticas basadas en Playwright contra el servidor en construcción de producción (`npm run build && npm run start`).
