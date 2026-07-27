# Migración de mindicador.cl a Banco Central (SI3 / SieteRestWS)

Estado: **documentación previa a implementación**. Nada de este documento se ha implementado en código todavía.

**Trazabilidad en Linear:** el trabajo descrito acá está partido en 8 issues dentro del proyecto [Pulso: migración a Banco Central (SI3)](https://linear.app/dboots007/project/pulso-migracion-a-banco-central-si3-21c6b5cfc78d) (team DBO), issues DBO-1086 a DBO-1105 (`[PULS-001]` a `[PULS-008]`), en 3 milestones. Cada issue referencia las secciones correspondientes de este documento en sus criterios de aceptación.

## Decisión

mindicador.cl responde de forma intermitente. Se reemplaza como fuente de datos por la API SI3 del Banco Central de Chile. Cualquier indicador de los 12 actuales que no tenga equivalente en el catálogo de series del Banco Central **se elimina de la app**, no se busca una tercera fuente para reemplazarlo.

## Rangos del selector de historial (`HistoryChart`)

Decisión: los 3 botones pasan de `1M / 6M / 1A` (techo actual, limitado por el endpoint por-año de mindicador) a **`1M / 1A / 2A`**.

- `1M` y `1A` se mantienen igual — `1A` ya es el mínimo razonable para los indicadores mensuales (12 puntos reales).
- `2A` reemplaza a `6M`. Con Banco Central, `GetSeries` acepta cualquier rango en una sola llamada (`firstdate`/`lastdate` arbitrarios), así que ya no hay techo técnico en 1 año — pero se descartó ir a 5A por dos motivos, no solo peso:
  - **Peso**: el histórico completo de `uf` (prueba real) fue 2,1MB / 17.906 obs (~117 bytes/punto). 5A de una serie diaria ≈ 1.825 puntos ≈ ~214 KB (5x más que 1A); 2A ≈ 730 puntos ≈ ~85 KB — más manejable.
  - **Legibilidad**: graficar densidad diaria en una ventana de 5 años es ruido visual (nadie percibe variación día a día en 5 años); 2A alcanza para ver un ciclo completo de TPM o un patrón estacional del IMACEC sin necesitar downsampling.
  - Nota: BC devuelve una fila por cada día calendario incluso en series "hábiles" (`dolar`, `euro`, `tpm`, `libra_cobre`), marcando fines de semana como `ND` — el peso no baja por ser "solo días hábiles".
- Si en el futuro se quiere ofrecer 5A o "todo el historial", conviene invertir primero en decimación/agregación de puntos (Chart.js, que ya usa el proyecto, tiene un plugin de "decimation" pensado para esto) — no está implementado hoy.

## Fuente del mapeo

El usuario aportó `series.xlsx` — el catálogo completo de series públicas del Banco Central (hoja `informe_series_sietews`, 30.867 series: columnas `CAPÍTULO`, `NOMBRE CUADRO`, `CÓDIGO`, `NOMBRE DE LA SERIE`). Se usó como fuente de verdad para resolver los códigos de serie, en vez de adivinarlos.

## Referencia de la API (de la auditoría anterior)

- Base URL: `https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx`
- Auth: `user` + `pass` (ya obtenidas por el usuario)
- Función de consulta: `GetSeries` — params `user, pass, function=GetSeries, timeseries=<código>, firstdate, lastdate` (YYYY-MM-DD)

## Mapeo confirmado: código app → código Banco Central

| Código app | Nombre mostrado | Código BC | Nombre serie (BC) | Cuadro (BC) | Frecuencia |
|---|---|---|---|---|---|
| `uf` | UF | `F073.UFF.PRE.Z.D` | Unidad de fomento (UF) | Indicadores de reajustabilidad diario | Diaria |
| `ivp` | IVP | `F073.IVP.PRE.Z.D` | Índice de valor promedio (IVP) | Indicadores de reajustabilidad diario | Diaria |
| `dolar` | Dólar observado | `F073.TCO.PRE.Z.D` | Dólar observado | Tipo de cambio | Diaria hábil |
| `euro` | Euro | `F072.CLP.EUR.N.O.D` | Euro (Eurozona) | Tipo de cambio nominal distintas monedas (CLP por unidad de moneda extranjera) | Diaria hábil |
| `ipc` | IPC | `F074.IPC.VAR.Z.Z.C.M` | IPC General | IPC, variación mensual, información histórica (%) | Mensual |
| `utm` | UTM | `F073.UTR.PRE.Z.M` | Unidad tributaria mensual (UTM) | Indicadores de reajustabilidad | Mensual |
| `imacec` | Imacec | `F032.IMC.V12.Z.Z.2018.Z.Z.0.M` | Imacec | Indicador mensual de actividad económica, contribución año/año, referencia 2018 (%) | Mensual |
| `tpm` | TPM | `F022.TPM.TIN.D001.NO.Z.D` | Tasa de política monetaria (TPM) | Tasas de interés de referencia de la política monetaria | Diaria (vigente hasta próximo cambio de la política) |
| `libra_cobre` | Libra de cobre | `F019.PPB.PRE.100.D` | Cobre refinado BML (USD/libra) | Precios de productos básicos | Diaria |
| `tasa_desempleo` | Tasa de desempleo | `F049.DES.TAS.INE9.10.M` | Tasa de desocupación nacional (INE) | Tasas de desocupación, nacional y por región, INE (%) | Mensual |

10 de los 12 códigos actuales tienen equivalente confirmado en el catálogo del Banco Central.

**Corrección (2026-07-27, durante la implementación de PULS-003):** el código original de `imacec` (`F032.IMC.IND.Z.Z.EP18.Z.Z.0.M`) resultó ser el **índice de nivel** (volumen encadenado, promedio 2018=100, valores ~100-115), no la variación % que muestra mindicador.cl y que la UI espera (`unidad_medida: 'Porcentaje'`). Con ese código, una llamada real devolvía `112.66` para mayo 2026 — un valor sin sentido como porcentaje. Se corrigió a `F032.IMC.V12.Z.Z.2018.Z.Z.0.M` ("contribución año/año, referencia 2018"), que devuelve `-0.9005...` para el mismo mes — coincide con el `-0.9` que ya tenía el fixture de `e2e/mocks.ts`, confirmando que es el código correcto. Este error solo se detectó probando el cliente contra la API real con los 10 códigos — el catálogo por sí solo no lo hubiera revelado, porque ambos códigos comparten el nombre corto "Imacec" en la columna `NOMBRE DE LA SERIE` y solo se distinguen por el `NOMBRE CUADRO` completo (IND = índice vs. V12 = variación 12 meses).

## Indicadores a eliminar

| Código app | Motivo |
|---|---|
| `bitcoin` | **No existe** en el catálogo del Banco Central (0 coincidencias buscando "bitcoin"/"cripto" en 30.867 series) — el Banco Central no publica precios de criptoactivos. Se elimina de `INDICADOR_CODIGOS`, tipos, UI y tests. |
| `dolar_intercambio` | Ya estaba descontinuado en mindicador.cl desde 2014-11-13 (ver memoria `mindicador_cadencias`). No se evaluó contra el catálogo de BC porque de todas formas no aporta valor — se elimina también. |

## Shape real de la respuesta (confirmado 2026-07-27, `GetSeries` sobre `uf`)

Prueba real: `timeseries=F073.UFF.PRE.Z.D`, `firstdate=2026-06-27`, `lastdate=2026-07-27`.

```json
{
  "Codigo": 0,
  "Descripcion": "Success",
  "Series": {
    "descripEsp": "Unidad de fomento (UF)",
    "descripIng": "Unit of account (UF)",
    "seriesId": "F073.UFF.PRE.Z.D",
    "Obs": [
      { "indexDateString": "27-06-2026", "value": "40812.16", "statusCode": "OK" },
      { "indexDateString": "28-06-2026", "value": "40814.87", "statusCode": "OK" }
    ]
  },
  "SeriesInfos": []
}
```

Campos confirmados:

- `Codigo` (top-level): `0` = éxito. Hay que validar esto (o `Descripcion !== "Success"`) para detectar errores — código de serie inválido, credenciales inválidas, etc. Falta un ejemplo real de error para documentar el shape de fallo.
- `Series.descripEsp` / `descripIng`: nombre legible de la serie — sirve para poblar `nombre` en `Indicador` sin mantener un mapeo manual aparte.
- `Series.seriesId`: eco del código pedido.
- `Series.Obs[].indexDateString`: fecha como **string `DD-MM-YYYY`** (ej. `27-06-2026`) — formato distinto al que devuelve mindicador.cl, el adaptador tiene que parsearlo explícitamente (no asumir ISO).
- `Series.Obs[].value`: viene como **string**, no number (`"40812.16"`) — requiere `parseFloat`/`Number()` en el adaptador.
- `Series.Obs[].statusCode`: `"OK"` cuando hay dato real; `"ND"` en días sin mercado (ver confirmación abajo con `dolar` en fin de semana).
- `SeriesInfos`: vino vacío (`[]`) en esta llamada — parece no aplicar a `GetSeries`, posiblemente solo se puebla en `SearchSeries`. Confirmar si alguna vez trae algo antes de asumir que siempre está vacío.

## Confirmado: días sin mercado (`dolar`, fin de semana, 2026-07-27)

Rango `2026-07-20` a `2026-07-27` sobre `F073.TCO.PRE.Z.D` (dólar observado):

```
20-07 (lun) → "933.92"  OK
21-07 (mar) → "933"     OK
22-07 (mié) → "932.84"  OK
23-07 (jue) → "936.39"  OK
24-07 (vie) → "946.24"  OK
25-07 (sáb) → "NaN"     ND   ← fin de semana
26-07 (dom) → "NaN"     ND   ← fin de semana
27-07 (lun) → "946.14"  OK
```

Confirmado: los días sin mercado sí se marcan explícitamente — `statusCode: "ND"` + `value: "NaN"` (string literal, no `null`). El adaptador puede filtrar de forma segura descartando toda observación con `statusCode !== "OK"`. **Importante: esto es un mecanismo distinto al "relleno silencioso" de `uf`** — ahí el problema no era falta de dato marcada como `ND`, sino un valor repetido marcado como `OK` para fechas más allá de lo realmente publicado. Ambos problemas coexisten y hay que manejarlos por separado.

## Hallazgo crítico: la respuesta NO viene en UTF-8

Las cabeceras HTTP de la API declaran:

```
content-type: application/json; charset=ISO-8859-1
```

La API sirve **Latin-1**, no UTF-8, pese a ser JSON. Esto importa porque el estándar Fetch decodifica el body de `response.json()`/`response.text()` siempre como UTF-8, **sin respetar el charset declarado en el header** — es un comportamiento conocido de la spec, no un bug del entorno. El cliente actual (`lib/mindicador-client.ts`, función `fetchJson`) usa `response.json()` directo; si el cliente de Banco Central reutiliza ese mismo patrón, cualquier campo con tildes/ñ (`descripEsp`, nombres de serie) va a llegar corrupto.

**Implicancia para el cliente nuevo:** no puede reusar `fetchJson` tal cual. Necesita leer la respuesta con `response.arrayBuffer()` y decodificarla explícitamente con `new TextDecoder('iso-8859-1').decode(buffer)` antes de `JSON.parse`. Confirmado además que `descripEsp` trae un formato tipo breadcrumb separado por `\` (ej. `"Tipo de cambio nominal (dólar observado $CLP/USD)\ tipo de cambio \ precio \ diario \ BCCh"`) — probablemente conviene tomar solo el primer segmento como nombre corto en vez de la cadena completa.

## Confirmado: shape de un error (código de serie inválido, 2026-07-27)

Prueba con `timeseries=CODIGO_INVALIDO_XYZ`:

```json
{
  "Codigo": -50,
  "Descripcion": "An internal error has occurred, information is not available.",
  "Series": { "descripEsp": null, "descripIng": null, "seriesId": null, "Obs": null },
  "SeriesInfos": []
}
```

**Dato clave: el HTTP status sigue siendo `200 OK`** — el error solo se señaliza en el body (`Codigo: -50`, distinto de `0`). El adaptador tiene que chequear siempre `Codigo !== 0` en el JSON parseado; no puede confiar en el status HTTP para detectar fallos (a diferencia de `mindicador-client.ts`, que sí usa `response.ok`/status). El mensaje de error es genérico y no distingue causas ("serie inválida" vs. credenciales incorrectas vs. otro error interno) — no sirve para dar feedback específico al usuario.

### Hallazgo importante: valores repetidos en fechas futuras/no publicadas aún

Los últimos 18 puntos del rango pedido (`10-07-2026` a `27-07-2026`) vinieron todos con el mismo valor (`40844.79`) y `statusCode: "OK"`. La UF se recalcula por interpolación diaria dentro del mes — no debería quedarse plana por 18 días seguidos. Esto indica que **cuando se pide un rango que llega más allá de la última fecha realmente publicada, el Banco Central repite el último valor conocido marcado como `"OK"`, en vez de omitir esas fechas o marcarlas distinto**.

**Implicancia para el diseño del snapshot:** no se puede construir el "valor actual" tomando ciegamente el último elemento de `Obs` — hay que detectar la corrida de valores idénticos consecutivos al final y quedarse con el primero de esa corrida (o, más simple, no pedir fechas más allá de lo que se sabe publicado). Esto es más importante todavía para series de menor frecuencia (`ipc`, `imacec`, `utm`, `tasa_desempleo`) donde "hoy" casi seguro cae dentro de un período sin dato real publicado todavía.

## Confirmado: comportamiento sin `firstdate`/`lastdate` (2026-07-27)

Prueba real sobre `uf` sin pasar fechas: devuelve **el historial completo** — 17.906 observaciones, desde `01-08-1977` hasta `09-08-2026`, ~2.1 MB de JSON en una sola respuesta.

**Implicancia:** en producción hay que pasar siempre `firstdate`/`lastdate` explícitos y acotados (ej. últimos ~30-45 días para el snapshot). Omitirlos en una serie diaria de décadas es no solo lento sino innecesariamente pesado.

Este mismo pull confirma con más fuerza el hallazgo de la sección anterior: la serie completa llega hasta `09-08-2026` con el valor plano `40844.79` repetido desde el `10-07-2026` — más de un mes sin cambiar. Descarta la hipótesis de que fueran valores futuros legítimamente pre-publicados (la UF se recalcula por interpolación diaria, no puede quedar fija un mes); confirma que es un relleno del último valor real conocido.

## Confirmado: `libra_cobre` en vivo (2026-07-27) — con dos hallazgos nuevos

Prueba real sobre `F019.PPB.PRE.100.D`, rango `2026-06-27` a `2026-07-27` (31 días calendario):

- **La serie está viva**: `Codigo: 0`, 28 observaciones con valores reales entre ~6.0 y ~6.3 (consistente con un precio de mercado del cobre en USD/libra).
- **Hallazgo 1 — los días sin dato se manejan distinto según la serie**: de los 31 días del rango, solo vinieron 28 observaciones. Faltan sábado 27-06, domingo 28-06 y **lunes 29-06** (feriado de San Pedro y San Pablo en Chile) — pero a diferencia de `dolar` (que sí incluye esos días como filas con `statusCode: "ND"`), acá **esos días no aparecen como filas en absoluto**, se omiten directamente del array `Obs`. Conclusión: el adaptador **no puede asumir "una fila por cada día calendario" como contrato uniforme entre series** — algunas rellenan con `ND`, otras simplemente omiten. Siempre hay que indexar por `indexDateString`, nunca por posición o cantidad esperada de filas.
- **Hallazgo 2 — el texto descriptivo de la API en vivo no coincide con el catálogo**: el catálogo (`series.xlsx`) describe este código como "Cobre refinado BML (**dólares/libra**)"; la respuesta real de `GetSeries` para el mismo código trae `descripEsp: "Precios de productos básicos / Onza troy de Cobre. Dólares / oz"` — **libra ≠ onza troy** (1 libra ≈ 14,58 oz troy). Los valores reales (~6.0-6.3) encajan con dólares/libra (rango de mercado plausible para cobre), no con dólares/onza troy (sería absurdamente barato). El código elegido parece seguir siendo el correcto, pero `descripEsp` no es confiable para derivar la unidad de medida automáticamente — conviene mantener `unidad_medida` como un valor fijo del lado de la app, no parsearlo del texto que devuelve Banco Central.

## Puntos aún sin confirmar

Confirmado ya (ver secciones arriba, con pruebas reales): shape de éxito, shape de error, `statusCode` distinto de `"OK"` (`ND` en días sin mercado — aunque el mecanismo varía por serie, ver arriba), comportamiento sin `firstdate`/`lastdate`, encoding Latin-1, `libra_cobre` en vivo. Queda pendiente:

1. **`ipc` sin cross-check real** — el código elegido (`F074.IPC.VAR.Z.Z.C.M`) es la variación mensual porcentual, consistente con que `lib/format.ts` trata `ipc` como `Porcentaje`, pero nunca se comparó un valor real de BC contra lo que hoy muestra mindicador para el mismo mes.
2. **`tpm`**: es una tasa vigente que cambia solo en las reuniones de política monetaria (no diaria en el sentido de "dato nuevo cada día"), igual que hoy en mindicador — no debería cambiar el comportamiento de UI, riesgo bajo, no bloqueante.

## Confirmado: rate limits para una ráfaga de 10 llamadas (2026-07-27)

Se probaron los 10 códigos reales del snapshot (rango `2026-07-01` a `2026-07-27`), primero secuencial y después en paralelo:

- **Secuencial**: 10 llamadas, ~1,3-4,7s cada una, **~18,9s en total**. Sin errores, las 10 con `Codigo: 0`.
- **Paralelo** (10 requests concurrentes, mismas credenciales): **~0,23s en total**. Sin errores, sin señales de throttling.

No se detectó rate limit para una ráfaga de 10 llamadas concurrentes — que es exactamente el patrón real que va a tener el snapshot de la app. No se probó a mayor escala (cientos de llamadas, o llamadas sostenidas durante horas) para no golpear de más un servicio público sin necesidad real.

**Conclusión para la implementación:** el snapshot nuevo debe hacer las 10 llamadas **en paralelo** (`Promise.all`), no secuenciales — la diferencia es dramática (0,2s vs 19s) y no hay evidencia de que el paralelismo tenga costo en confiabilidad.

## `ipc`: cross-check bloqueado (mindicador.cl caído, 2026-07-27)

Se intentó comparar el valor real de `ipc` entre mindicador.cl y Banco Central. **mindicador.cl no respondió** (`curl` devolvió conexión cerrada sin respuesta / timeout en 3 intentos) — confirma en vivo, mientras se documenta esta migración, el problema de disponibilidad que la origina. Queda pendiente para cuando mindicador.cl vuelva a responder.

## Cambio de arquitectura: snapshot pasa de 1 llamada a N llamadas

mindicador.cl expone un endpoint que trae **los 12 indicadores en una sola llamada** (`GET https://mindicador.cl/api`, usado hoy en `getSnapshot()`). Banco Central no tiene equivalente: `GetSeries` trae **una serie por llamada**. Construir el snapshot de los 10 indicadores restantes pasa de **1 request a 10 requests**.

Esto no es solo un detalle de implementación, tiene implicancias de diseño sin resolver:

- **Fallos parciales**: hoy el fallo es binario (mindicador responde o no). Con 10 llamadas independientes, puede fallar 1 de 10 mientras el resto responde bien — hay que decidir si el snapshot se sirve completo-o-nada, o parcial marcando qué indicador quedó stale/caído.
- **Rate limits**: con 10x más llamadas por refresh (cada `revalidate` de 300s dispara hasta 10 requests en vez de 1), el riesgo de pegarle a un límite no documentado sube proporcionalmente. Ver punto 4 arriba.
- **Latencia**: 10 llamadas (aunque sea en paralelo) tienen más superficie de fallo/timeout que 1.

Esto está directamente relacionado con la "Decisión de diseño pendiente" de la sección siguiente — conviene resolver ambas juntas.

## Decisión: migración completa, sin ningún rastro de mindicador.cl (2026-07-27)

**Decidido:** no se trata solo de cambiar la fuente de datos por dentro — se elimina cualquier mención de "mindicador" del repo (branding, títulos, mensajes de error, nombres de fixtures/funciones de test). Grep completo (case-insensitive) sobre el repo: **24 referencias en 12 archivos**.

### Archivos que tocan los códigos a eliminar (`bitcoin`, `dolar_intercambio`) — de la auditoría anterior

- `types/indicador.ts`
- `lib/format.ts`
- `components/IndicatorCard.tsx` + `IndicatorCard.test.tsx`
- `components/HistoryChart.tsx`
- `components/Converter.test.tsx`
- `hooks/useIndicadorHistory.test.tsx`
- `app/dev/ui/page.tsx`
- `app/api/indicadores/[codigo]/[anio]/route.test.ts`
- `e2e/mocks.ts`

### Archivos con la palabra "mindicador" en sí (branding, docs, tests) — scope más amplio, confirmado por grep

| Archivo | Qué contiene |
|---|---|
| `README.md` | 6 menciones — descripción del proyecto, instrucciones de setup, tabla de arquitectura, sección "Particularidades de los datos de mindicador.cl" |
| `app/layout.tsx` | Título del sitio: `"Dashboard mindicador.cl"` |
| `app/page.tsx` | Título de metadata: `"Dashboard mindicador.cl — Vista general"` |
| `components/DashboardHome.tsx` | Texto visible en la UI: `"mindicador.cl"` |
| `lib/mindicador-client.ts` | El cliente entero (`MindicadorApiError`, `BASE_URL`, mensajes de error) — se reemplaza completo por el cliente de SI3 |
| `app/api/indicadores/route.ts` | Import de `getSnapshot` + mensaje de error `"...consultar mindicador.cl"` |
| `app/api/indicadores/[codigo]/[anio]/route.ts` | Import de `getHistorico` + mismo mensaje de error |
| `app/api/indicadores/route.test.ts` | Fixture con `autor: 'mindicador.cl'` |
| `hooks/useIndicadores.test.tsx` | Fixture + mensajes de error de test |
| `hooks/useIndicadorHistory.test.tsx` | Mensaje de error de test |
| `e2e/mocks.ts` | Función `mockMindicadorApi()`, fixture `autor: 'mindicador.cl'` |
| `e2e/dashboard.spec.ts` | Import y uso de `mockMindicadorApi` |

Nuevo con la migración (no es solo borrar texto): reemplazo completo de `lib/mindicador-client.ts` por un cliente equivalente para SI3, y un adaptador que traduzca la respuesta de `GetSeries` (`Series`/`SeriesInfos`) al shape actual (`Indicador`, `IndicadoresSnapshot`, `SerieHistorica`) para no tener que tocar los componentes downstream.

**Criterio de "hecho" para esta parte:** un grep case-insensitive de `mindicador` sobre el repo (fuera de este mismo documento) no debería devolver resultados al terminar la migración.

## Decisión: resiliencia del snapshot — fallback por indicador (2026-07-27)

**Decidido:** el snapshot usa **fallback por indicador**, no por snapshot completo.

- El caché deja de ser un `IndicadoresSnapshot` único que se reemplaza atómicamente, y pasa a ser un valor cacheado **por cada uno de los 10 códigos**.
- En cada refresh se disparan las 10 llamadas a `GetSeries` en paralelo (ya confirmado seguro y rápido, ~0,2s — ver sección de rate limits). Cada llamada que responde bien actualiza *solo ese* valor en el caché; cada una que falla deja el valor cacheado anterior de *ese* indicador, sin tocar el resto.
- El snapshot servido es "lo mejor disponible por indicador en ese momento" — mezcla de datos frescos con, ocasionalmente, algún valor stale puntual, en vez de todo-fresco-o-todo-stale.
- **Falla total** (los 10 fallan, ej. Banco Central caído): mismo comportamiento que hoy — se sirve el último snapshot completo bueno en caché, o error si nunca hubo uno (arranque en frío).

**Por qué no todo-o-nada:** con mindicador el fallo era binario (1 llamada, responde o no). Con Banco Central son 10 llamadas independientes — mantener la lógica de "si algo falla, servir el snapshot entero cacheado" tiraría 9 valores frescos y correctos a la basura por el fallo de 1 solo indicador, algo que antes no podía pasar y ahora va a ser más frecuente (más superficie de fallo).

**Deliberadamente fuera de alcance:** marcar visualmente en la UI qué indicador quedó stale (ej. badge "desactualizado" en `IndicatorCard`). El fallback por indicador ya resuelve el problema real sin tocar tipos ni componentes — si se quiere visibilidad de staleness en la UI, es un agregado incremental posterior, no parte de esta migración.
