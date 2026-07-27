# Documentación de Código: Carpeta `lib/`

Esta carpeta alberga la lógica de negocio central, clientes de integración externa y funciones utilitarias de formateo.

---

## 📂 Archivos en `lib/`

### 1. `lib/bcentral-client.ts`

- **Responsabilidad**: Cliente HTTP para consumir la API SieteRestWS / SI3 del Banco Central de Chile.
- **Exportaciones**:
  - `BancoCentralApiError`: Clase de excepción personalizada.
  - `getSerieHistorica(codigo, firstdate, lastdate)`: Retorna la serie histórica parseada.
  - `getUltimoValor(codigo, options?)`: Retorna el punto más reciente disponible.
  - `getCodigoSerieBancoCentral(codigo)`: Mapea un código interno al código de serie del Banco Central.
- **Características Clave**:
  - Parsea la respuesta binaria con `new TextDecoder('iso-8859-1')`.
  - Valida el status funcional `Codigo === 0`.
  - Implementa un timeout de 8 segundos vía `AbortController`.

---

### 2. `lib/indicadores-snapshot.ts`

- **Responsabilidad**: Motor de resiliencia y gestión de caché en memoria volatil.
- **Exportaciones**:
  - `obtenerSnapshot()`: Retorna `Promise<IndicadoresSnapshot | null>`.
- **Estrategia**: Consulta los 10 indicadores en paralelo mediante `Promise.all` e implementa fallback por indicador utilizando un `Map` persistente durante el ciclo de vida del proceso en servidor Node.js.

---

### 3. `lib/format.ts`

- **Responsabilidad**: Formatear valores numéricos y fechas según convenciones chilenas (`es-CL`).
- **Exportaciones**:
  - `formatCLP(valor: number): string`
  - `formatPorcentaje(valor: number): string`
  - `formatFecha(fecha: string | Date): string`
  - `formatValorPorUnidad(valor: number, unidadMedida?: string): string`
