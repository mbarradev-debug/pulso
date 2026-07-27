# Servicios y Módulos de Integración (Backend & Core)

Este documento detalla la capa de servicios e integración externa de **Pulso**, responsable de comunicarse con la API del Banco Central de Chile, gestionar el almacenamiento en memoria y formatear valores numéricos.

---

## 🏛️ Cliente del Banco Central: `lib/bcentral-client.ts`

- **Responsabilidad**: Encapsular el protocolo HTTP, autenticación, decodificación binaria y manejo de errores de la API **SieteRestWS / SI3** del Banco Central de Chile.
- **Constantes de Configuración**:
  - `BASE_URL`: `'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx'`
  - `REQUEST_TIMEOUT_MS`: `8000` (8 segundos).
  - `REVALIDATE_SECONDS`: `300` (5 minutos).
- **Mapeo Inmutable de Series (`SERIES`)**:
  Almacena los códigos alfanuméricos oficiales de las series del Banco Central para cada indicador:
  - `uf`: `F073.UFF.PRE.Z.D`
  - `ivp`: `F073.IVP.PRE.Z.D`
  - `dolar`: `F073.TCO.PRE.Z.D`
  - `euro`: `F072.CLP.EUR.N.O.D`
  - `ipc`: `F074.IPC.VAR.Z.Z.C.M`
  - `utm`: `F073.UTR.PRE.Z.M`
  - `imacec`: `F032.IMC.V12.Z.Z.2018.Z.Z.0.M`
  - `tpm`: `F022.TPM.TIN.D001.NO.Z.D`
  - `libra_cobre`: `F019.PPB.PRE.100.D`
  - `tasa_desempleo`: `F049.DES.TAS.INE9.10.M`

### Excepción Personalizada: `BancoCentralApiError`

Clase que extiende de `Error` incorporando atributos específicos:

- `codigoSerie`: `string`
- `codigoRespuesta`: `number | undefined`

### Funciones Internas y Exportadas:

#### 1. `llamarGetSeries(codigoSerie, firstdate, lastdate)` (Privada)

- **Flujo Interno**:
  1. Verifica existencia de variables de entorno `BCENTRAL_USER` y `BCENTRAL_PASS`. Si faltan, lanza `BancoCentralApiError`.
  2. Construye la URL con `searchParams` (`function=GetSeries`).
  3. Crea un `AbortController` con timeout de 8000ms.
  4. Realiza el `fetch` configurado con `{ next: { revalidate: 300 } }`.
  5. Obtiene el body como `ArrayBuffer` crudo.
  6. **Decodificación ISO-8859-1**: `new TextDecoder('iso-8859-1').decode(buffer)` para preservar tildes y caracteres en español.
  7. Parsea el JSON y valida `data.Codigo === 0`. Si es distinto de cero, lanza `BancoCentralApiError`.

#### 2. `getSerieHistorica(codigo, firstdate, lastdate)` (Pública)

- **Propósito**: Consultar una serie temporal histórica en un rango de fechas explícito.
- **Retorno**: `Promise<SerieHistorica>` con puntos filtrados (`statusCode === "OK"`) y parseados.

#### 3. `getUltimoValor(codigo, options?)` (Pública)

- **Propósito**: Obtener la observación más reciente disponible para un indicador (por defecto busca 120 días hacia atrás).
- **Algoritmo**: Consulta la serie histórica, ordena las observaciones por fecha cronológicamente y selecciona el último elemento mediante `puntoOrdenado.at(-1)`.

---

## 📸 Motor de Snapshots: `lib/indicadores-snapshot.ts`

- **Responsabilidad**: Coordinar la creación del snapshot consolidado de los 10 indicadores administrando el caché en memoria volatil.

### Estructura de Caché:

```typescript
const cachePorIndicador = new Map<IndicadorCodigo, Indicador>();
```

### Funciones:

#### 1. `obtenerConFallback(codigo: IndicadorCodigo)` (Privada)

- **Propósito**: Obtener el valor más reciente de un indicador individual con tolerancia a fallos.
- **Flujo**:
  1. Invoca `getUltimoValor(codigo)`.
  2. Si tiene éxito, guarda el resultado en `cachePorIndicador.set(codigo, indicador)` y lo retorna.
  3. Si falla (captura de excepción), registra el error en `console.error` y retorna el último valor almacenado en `cachePorIndicador.get(codigo)`.

#### 2. `obtenerSnapshot()` (Pública)

- **Propósito**: Generar la fotografía completa de la economía.
- **Flujo**:
  1. Ejecuta `Promise.all(INDICADOR_CODIGOS.map(obtenerConFallback))` para consultar los 10 indicadores en paralelo.
  2. Construye un objeto con todos los indicadores válidos obtenidos.
  3. Si ningún indicador tiene datos (`length === 0`), retorna `null`.
  4. Retorna un objeto `IndicadoresSnapshot` con versión `'2.0'`, autor `'Banco Central de Chile'` y fecha ISO actual.

---

## 🔣 Módulo de Formato: `lib/format.ts`

- **Responsabilidad**: Formatear valores numéricos y fechas respetando las convenciones culturales y monetarias de Chile (`es-CL`).

### Instancias de Formateadores (`Intl`):

- `clpFormatter`: Formato moneda CLP (`style: 'currency'`, `currency: 'CLP'`, sin decimales).
- `porcentajeFormatter`: Formato porcentual con exactamente 2 decimales.
- `fechaFormatter`: Formato de fecha larga (`timeZone: 'America/Santiago'`).

### Funciones Exportadas:

1. `formatCLP(valor: number): string` → Ejemplo: `963.12` → `"$963"`
2. `formatPorcentaje(valor: number): string` → Ejemplo: `0.35` → `"+0,35%"`, `-2.4` → `"-2,40%"`
3. `formatFecha(fecha: string | Date): string` → Ejemplo: `"2026-07-27"` → `"27 de julio de 2026"`
4. `formatValorPorUnidad(valor: number, unidadMedida?: string): string` → Evalúa si `unidadMedida === 'Porcentaje'` para delegar en `formatPorcentaje` o `formatCLP`.
