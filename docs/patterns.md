# Patrones de Diseño Identificados

Este documento describe los patrones de diseño de software y arquitectura detectados y aplicados en el código fuente de **Pulso**.

---

## 📐 1. Patrón Adaptador (Client Adapter Pattern)

- **Ubicación**: `lib/bcentral-client.ts`
- **Problema**: La API del Banco Central de Chile devuelve objetos complejos con nombres de propiedades en español/inglés (`Series.Obs[].indexDateString`, `value` en string, `statusCode`, etc.) y codificación legacy `ISO-8859-1`. Los componentes de la interfaz de usuario de Pulso esperan un contrato estandarizado (`Indicador`, `SerieHistorica`).
- **Solución**: `bcentral-client.ts` actúa como un adaptador que traduce la estructura interna de la API externa hacia los modelos del dominio de Pulso, abstrayendo a los componentes React de los cambios en el proveedor externo.

---

## 🛡️ 2. Patrón de Caché de Resiliencia con Fallback (Resilient Fallback Engine)

- **Ubicación**: `lib/indicadores-snapshot.ts`
- **Problema**: Con 10 llamadas independientes al servidor del Banco Central, la probabilidad de que 1 llamada falle debido a un parpadeo de red es mayor. Descartar todo el snapshot por 1 error sería perjudicial para la experiencia de usuario.
- **Solución**: Se implementó una estrategia donde cada indicador se consulta de forma aislada y guarda su valor exitoso en un `Map` compartido en memoria. En caso de fallo en una serie puntual, el sistema aplica un fallback sirviendo el último valor bueno conocido de ese indicador específico.

---

## 👁️ 3. Patrón Observador de Almacenamiento Externo (External Store Observer)

- **Ubicación**: `hooks/useFavoritos.ts`
- **Problema**: La sincronización de favoritos mediante `localStorage` suele producir errores de hidratación en Next.js App Router si se intenta leer del navegador durante el renderizado inicial en el servidor.
- **Solución**: Se aplica el patrón Observer utilizando la API nativa de React 19 `useSyncExternalStore`. El hook se suscribe a los cambios del `StorageEvent` en el objeto `window` y notifica a los componentes suscriptores para que se actualicen en tiempo real tanto dentro de la misma pestaña como en otras pestañas abiertas.

---

## ⚡ 4. Patrón de Hidratación Estática SWR (SSR SWR Hydration)

- **Ubicación**: `app/page.tsx` y `hooks/useIndicadores.ts`
- **Problema**: Los sitios que cargan datos del cliente frecuentemente muestran esqueletos de carga visuales al iniciar, seguidos de un salto de contenido (Layout Shift).
- **Solución**: El Server Component invoca la lógica de snapshot en el servidor y la inyecta mediante `<SWRConfig value={{ fallback: { ... } }}>`. El cliente inicia con los datos pre-cargados sin estados de carga intermedios.

---

## 🔒 5. Patrón Proxy Guard (Security Middleware)

- **Ubicación**: `proxy.ts`
- **Problema**: La ruta de pruebas UI `/dev/ui` debe estar deshabilitada en el entorno de producción.
- **Solución**: Un middleware ligero intercepta las peticiones coincidentes con la ruta `/dev/ui` y evalúa `NODE_ENV`. Si es producción, retorna un código HTTP `404 Not Found` cortando la cadena de procesamiento de inmediato.
