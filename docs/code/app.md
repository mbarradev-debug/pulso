# Documentación de Código: Carpeta `app/`

Esta carpeta contiene la infraestructura de rutas, renderizado de servidor, endpoints de API internos y metadatos SEO utilizando el enrutador **App Router** de Next.js.

---

## 📂 Archivos en `app/`

### 1. `app/layout.tsx`

- **Resumen**: Layout raíz obligatorio de Next.js. Define la estructura `<html>` y `<body>`, carga las fuentes tipográficas de Google Fonts, incluye la hoja de estilos global `globals.css` e integra las analíticas de Vercel (`@vercel/analytics`).
- **Por qué existe**: Garantizar una envoltura HTML uniforme y accesible para todas las páginas del sitio.
- **Dependencias**:
  - Importa: `next/font/google` (`Fira_Sans`, `Fira_Code`), `@vercel/analytics/next`, `./globals.css`.
  - Exporta: `metadata` (Metadata), `default function RootLayout`.
- **Explicación del Código**:
  Configura las fuentes con variables CSS `--font-fira-sans` y `--font-fira-mono`. Aplica la clase `dark` al elemento `<html>` forzando el tema oscuro (`colorScheme: 'dark'`).

---

### 2. `app/page.tsx`

- **Resumen**: Server Component principal de la Home Page (`/`).
- **Por qué existe**: Realizar la carga inicial de datos en el servidor (`obtenerSnapshot()`) e inyectarla en el contenedor `<SWRConfig>` para que el Client Component `<DashboardHome />` se hidrate sin flashes de carga.
- **Dependencias**:
  - Importa: `swr` (`SWRConfig`), `@/components/DashboardHome`, `@/hooks/useIndicadores` (`ENDPOINT_INDICADORES`), `@/lib/indicadores-snapshot` (`obtenerSnapshot`).
  - Exporta: `metadata` (Metadata), `default async function Home`.
- **Casos Borde**: Si `obtenerSnapshot()` retorna `null`, `<SWRConfig>` recibe un objeto `fallback` vacío `{}`, permitiendo que el cliente reintente la carga vía SWR.

---

### 3. `app/error.tsx`

- **Resumen**: Error Boundary global de la aplicación (`'use client'`).
- **Por qué existe**: Capturar excepciones no controladas durante el renderizado y ofrecer una interfaz accesible de recuperación.
- **Dependencias**:
  - Exporta: `default function Error({ error, unstable_retry })`.
- **Flujo Interno**: Registra el error en consola mediante `useEffect` y muestra un mensaje contextual con un botón que ejecuta `unstable_retry()`.

---

### 4. `app/loading.tsx`

- **Resumen**: Componente de interfaz de carga global.
- **Por qué existe**: Actuar como estado de espera (Suspense fallback) durante navegaciones o carga de datos en el servidor.
- **Dependencias**: Importa `@/components/Skeleton`.

---

### 5. `app/not-found.tsx`

- **Resumen**: Página de error 404.
- **Por qué existe**: Renderizar una vista amigable cuando la ruta solicitada no existe.
- **Dependencias**: Importa `next/link`.

---

### 6. `app/globals.css`

- **Resumen**: Hoja de estilos global.
- **Por qué existe**: Importar TailwindCSS v4 (`@import "tailwindcss";`) y definir tokens CSS globales de color, tipografía y animaciones (`@keyframes fade-in`).

---

### 7. `app/robots.ts`

- **Resumen**: Generador programático de `robots.txt`.
- **Por qué existe**: Configurar directivas para motores de búsqueda, permitiendo la indexación de `/` y bloqueando `/dev/ui` y `/api/`.

---

### 8. `app/sitemap.ts`

- **Resumen**: Generador programático de `sitemap.xml`.
- **Por qué existe**: Proveer el mapa del sitio para optimización en motores de búsqueda (SEO).

---

### 9. `app/opengraph-image.tsx`

- **Resumen**: Generador dinámico de imagen OpenGraph PNG (1200x630).
- **Por qué existe**: Producir la tarjeta visual de previsualización que se muestra cuando la URL del sitio se comparte en redes sociales (Twitter, WhatsApp, LinkedIn).
- **Dependencias**: Importa `next/og` (`ImageResponse`).

---

### 10. `app/dev/ui/page.tsx`

- **Resumen**: Playground / Showcase de componentes UI.
- **Por qué existe**: Permitir probar visualmente todos los componentes base del sistema en desarrollo.
- **Seguridad**: Ejecuta `notFound()` en producciones.

---

### 11. `app/api/indicadores/route.ts`

- **Resumen**: Route Handler para GET `/api/indicadores`.
- **Por qué existe**: Servir el snapshot JSON actual de los 10 indicadores económicos.
- **Configuración**: `dynamic = 'force-static'`, `revalidate = 300`.
- **Flujo Interno**:
  1. Invoca `obtenerSnapshot()`.
  2. Si retorna `null`, responde con HTTP 502 Bad Gateway.
  3. De lo contrario, responde con HTTP 200 OK y el snapshot JSON.

---

### 12. `app/api/indicadores/[codigo]/[anio]/route.ts`

- **Resumen**: Route Handler para GET `/api/indicadores/[codigo]/[anio]`.
- **Por qué existe**: Retornar las observaciones de una serie histórica para un año específico.
- **Validaciones**:
  1. Valida si `codigo` es un `IndicadorCodigo` válido (HTTP 400 en caso contrario).
  2. Valida si `anio` es un número de 4 dígitos entre 1970 y el año actual (HTTP 400 en caso contrario).
- **Flujo Interno**:
  1. Deriva el rango `firstdate` y `lastdate` usando `rangoDelAnio(anioNum)`.
  2. Invoca `getSerieHistorica(codigo, firstdate, lastdate)`.
  3. Retorna la serie en JSON o un HTTP 502 si el Banco Central falla.
