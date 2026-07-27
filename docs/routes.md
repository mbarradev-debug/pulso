# Rutas y Enrutamiento (Next.js App Router)

Este documento detalla todas las rutas de páginas web y endpoints de API expuestos por la aplicación **Pulso**, junto con su comportamiento de renderizado, parámetros, headers y middlewares asociados.

---

## 🌐 Páginas Públicas y de Desarrollo

### 1. Home Page (`/`)

- **Archivo**: `app/page.tsx`
- **Tipo de Renderizado**: Server Component con Server-Side Rendering (SSR) e hidratación SWR.
- **Propósito**: Vista principal del dashboard de indicadores económicos.
- **Flujo de Carga**:
  1. El servidor invoca `obtenerSnapshot()` de `lib/indicadores-snapshot.ts`.
  2. Construye el árbol HTML inicial y lo envuelve en un proveedor `<SWRConfig value={{ fallback: { '/api/indicadores': snapshotInicial } }}>`.
  3. Renderiza el Client Component `<DashboardHome />`.
  4. En el navegador, SWR hidrata los datos inmediatamente desde la propiedad `fallback` sin mostrar esqueletos de carga.

### 2. UI Showcase / Playground (`/dev/ui`)

- **Archivo**: `app/dev/ui/page.tsx`
- **Tipo de Renderizado**: Dynamic Server Component (`export const dynamic = 'force-dynamic'`).
- **Acceso**: Únicamente en entorno de desarrollo (`process.env.NODE_ENV !== 'production'`).
- **Protección**:
  - Middleware Guard (`proxy.ts`): Intercepta la ruta en producción y retorna `404 Not Found`.
  - In-page Guard: Ejecuta `notFound()` si `NODE_ENV === 'production'`.
- **Propósito**: Proporcionar un catálogo visual aislado para probar componentes como `Button`, `VariationBadge`, `Skeleton`, `IndicatorCard`, `HistoryChart` y `Converter`.

### 3. Error Boundary Global

- **Archivo**: `app/error.tsx`
- **Tipo**: Client Component (`'use client'`).
- **Propósito**: Capturar errores no manejados en el renderizado de cualquier subárbol de componentes.
- **Interfaz**: Muestra una tarjeta con mensaje de error, código de digest (si existe) y un botón "Reintentar" que ejecuta la función `unstable_retry()`.

### 4. UI de Carga Global (`/loading`)

- **Archivo**: `app/loading.tsx`
- **Propósito**: Fallback de visualización nativo de React Suspense durante la transición o carga de páginas Server Components. Muestra la estructura con bloques `Skeleton`.

### 5. Página 404 (`/not-found`)

- **Archivo**: `app/not-found.tsx`
- **Propósito**: Renderizado elegante cuando un usuario intenta acceder a una ruta inexistente. Incluye un botón para volver al inicio (`/`).

---

## 🔌 API Route Handlers (`/api/`)

### 1. GET `/api/indicadores`

- **Archivo**: `app/api/indicadores/route.ts`
- **Estrategia de Carga**: `export const dynamic = 'force-static'`, `export const revalidate = 300` (5 minutos).
- **Propósito**: Retornar el snapshot actual de los 10 indicadores económicos.
- **Respuesta de Éxito (HTTP 200)**:

```json
{
  "version": "2.0",
  "autor": "Banco Central de Chile",
  "fecha": "2026-07-27T21:19:29.000Z",
  "uf": {
    "codigo": "uf",
    "nombre": "Unidad de fomento (UF)",
    "unidad_medida": "Pesos",
    "fecha": "2026-07-27T04:00:00.000Z",
    "valor": 39412.87
  },
  "dolar": {
    "codigo": "dolar",
    "nombre": "Dólar observado",
    "unidad_medida": "Pesos",
    "fecha": "2026-07-25T04:00:00.000Z",
    "valor": 963.12
  }
}
```

- **Respuesta de Error (HTTP 502 Bad Gateway)**:

```json
{
  "error": "No se pudo obtener ningun indicador desde el Banco Central"
}
```

_(Ocurre si las 10 llamadas al Banco Central fallan y no existe ningún valor previo en el caché en memoria)._

---

### 2. GET `/api/indicadores/[codigo]/[anio]`

- **Archivo**: `app/api/indicadores/[codigo]/[anio]/route.ts`
- **Estrategia de Carga**: `export const dynamic = 'force-static'`, `export const revalidate = 300`.
- **Parámetros de Ruta**:
  - `codigo`: Debe ser un valor válido del tipo `IndicadorCodigo` (`uf`, `dolar`, `euro`, etc.).
  - `anio`: Cadena numérica de 4 dígitos entre `1970` y el año en curso.
- **Validaciones**:
  - Si `codigo` no pertenece a `INDICADOR_CODIGOS` → HTTP 400 Bad Request.
  - Si `anio` no es un número de 4 dígitos dentro del rango válido → HTTP 400 Bad Request.
- **Respuesta de Éxito (HTTP 200)**:

```json
{
  "codigo": "dolar",
  "nombre": "Dolar observado",
  "unidad_medida": "Pesos",
  "serie": [
    { "fecha": "2026-01-02T00:00:00.000Z", "valor": 912.45 },
    { "fecha": "2026-01-05T00:00:00.000Z", "valor": 915.1 }
  ]
}
```

- **Respuesta de Error (HTTP 502 Bad Gateway)**:

```json
{
  "error": "Banco Central fallo para dolar: Tiempo de espera agotado al consultar la serie F073.TCO.PRE.Z.D"
}
```

---

## 📄 Archivos de Metadatos y SEO

### 1. `app/robots.ts`

Genera el archivo `robots.txt` del sitio:

- Permite indexación a todos los agentes (`User-Agent: *`).
- Bloquea el acceso a `/dev/ui` y endpoints `/api/`.
- Declara la ubicación del sitemap: `https://pulso-cyan-zeta.vercel.app/sitemap.xml`.

### 2. `app/sitemap.ts`

Genera el archivo `sitemap.xml`:

- Incluye la URL raíz (`https://pulso-cyan-zeta.vercel.app`) con prioridad `1.0` y frecuencia de cambio `daily`.

### 3. `app/opengraph-image.tsx`

Genera dinámicamente la imagen de vista previa OpenGraph (1200x630 PNG) utilizando la biblioteca `@vercel/og` (`ImageResponse`). Muestra el logotipo de Pulso y una grilla estilizada con ejemplos de los principales indicadores.
