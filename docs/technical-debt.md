# Deuda Técnica, Riesgos y Diagnóstico

Este documento analiza de forma crítica y transparente la deuda técnica existente en el proyecto **Pulso**, clasificando áreas de riesgo, acoplamientos y recomendaciones de refactorización para mantenedores futuros.

---

## ⚠️ Diagnóstico de Deuda Técnica

### 1. Sincronización Manual de Constantes de Caché (`revalidate = 300`)

- **Ubicación**: `lib/bcentral-client.ts`, `app/api/indicadores/route.ts` y `app/api/indicadores/[codigo]/[anio]/route.ts`.
- **Descripción**: La constante `REVALIDATE_SECONDS = 300` definida en `lib/bcentral-client.ts` requiere coincidir de forma idéntica con el valor exportado `export const revalidate = 300` en los Route Handlers.
- **Causa**: Next.js App Router requiere que la exportación `export const revalidate` sea un **literal numérico estático** evaluable en tiempo de compilación; no permite importar una constante declarada en otro módulo.
- **Riesgo**: Si un desarrollador actualiza `REVALIDATE_SECONDS` en la librería pero olvida modificar las exportaciones en las rutas, el comportamiento de caché en servidor y la revalidación HTTP quedarán desincronizados.

---

### 2. Relleno de Fechas Futuras en la API del Banco Central

- **Ubicación**: `lib/bcentral-client.ts` (`getUltimoValor`).
- **Descripción**: La API del Banco Central de Chile tiene la particularidad de responder con el último valor publicado repetido consecutivamente para fechas futuras cuando se solicita un rango que sobrepasa el día actual.
- **Impacto**: La función `getUltimoValor` toma literalmente la última observación ordenada cronológicamente con `statusCode === "OK"`. Para la UF o el Dólar no genera distorsiones severas, pero en indicadores con desfase de publicación mensual (IPC o Imacec), la fecha del snapshot podría reflejar una fecha reciente que simplemente repite el valor del mes anterior.

---

### 3. Ausencia de Agregación/Decimación en Series Históricas Extensas

- **Ubicación**: `components/HistoryChart.tsx`.
- **Descripción**: Al seleccionar el rango de 2 años (`2A`), la serie devuelta contiene más de 700 puntos individuales que se renderizan directamente en la instancia de Canvas mediante Chart.js.
- **Riesgo**: Aunque los navegadores modernos procesan 700 puntos sin problemas, si en el futuro se amplía el selector a 5 o 10 años (~3.600 puntos), el rendimiento de renderizado en dispositivos móviles de gama baja podría verse degradado.
- **Solución Recomendada**: Integrar el plugin de decimación (`chartjs-plugin-decimation`) o realizar un downsampling de datos en el servidor/hook antes de pasarlo al componente.

---

### 4. Decodificación Manual de Charset `ISO-8859-1`

- **Ubicación**: `lib/bcentral-client.ts` (`llamarGetSeries`).
- **Descripción**: Debido a que la API del Banco Central de Chile responde en codificación Latin-1 (`ISO-8859-1`) a pesar de retornar JSON, se utiliza `response.arrayBuffer()` y `new TextDecoder('iso-8859-1').decode(buffer)`.
- **Riesgo**: Depende del soporte del navegador/Node.js para la API global `TextDecoder`. En entornos de ejecución antiguos o severamente restringidos sin soporte completo de ICU, esto podría requerir un polyfill.

---

### 5. Tratamiento del Indicador `libra_cobre` en Formateador Monetario

- **Ubicación**: `lib/format.ts` (`formatValorPorUnidad`).
- **Descripción**: La moneda del precio de la libra de cobre es Dólares estadounidense (`USD`), pero `formatValorPorUnidad` utiliza por defecto `formatCLP()` cuando la unidad de medida no es `'Porcentaje'`.
- **Riesgo**: El valor se formatea con el símbolo de peso chileno (`$`) en lugar de especificar claramente que el valor está cotizado en dólares o centavos de dólar.
