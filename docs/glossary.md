# Glosario de Términos

Este glosario define los términos del dominio económico chileno y los conceptos técnicos propios de la arquitectura de **Pulso**.

---

## 🇨🇱 Términos Económicos del Dominio

| Término                                            | Significado / Descripción                                                                                                                                                   |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UF (Unidad de Fomento)**                         | Unidad de cuenta reajustable no monetaria utilizada en Chile para contratos financieros, préstamos hipotecarios y previsión. Su valor se reajusta diariamente según el IPC. |
| **IVP (Índice de Valor Promedio)**                 | Índice de reajustabilidad diario derivado de la tasa de inflación expresado en pesos chilenos.                                                                              |
| **Dólar Observado**                                | Tipo de cambio promedio ponderado de las operaciones de compra y venta de dólares estadounidenses realizadas por los bancos comerciales en Chile.                           |
| **Euro**                                           | Cotización de la moneda oficial de la Eurozona expresada en Pesos Chilenos (CLP).                                                                                           |
| **IPC (Índice de Precios al Consumidor)**          | Indicador mensual emitido por el Instituto Nacional de Estadísticas (INE) que mide la variación media de los precios de una canasta de bienes y servicios.                  |
| **UTM (Unidad Tributaria Mensual)**                | Unidad económica utilizada en Chile para efectos tributarios, multas y pagos de derechos de aduana. Se reajusta mensualmente.                                               |
| **Imacec (Índice Mensual de Actividad Económica)** | Estimación que resume la actividad de los distintos sectores de la economía chilena en un mes determinado. Mapea la evolución del PIB.                                      |
| **TPM (Tasa de Política Monetaria)**               | Tasa de interés de referencia fijada por el Consejo del Banco Central de Chile para gestionar la liquidez y la inflación.                                                   |
| **Libra de Cobre**                                 | Precio internacional del cobre refinado cotizado en la Bolsa de Metales de Londres (BML), medido en dólares por libra. Es la principal exportación de Chile.                |
| **Tasa de Desempleo**                              | Porcentaje de la fuerza de trabajo chilena que se encuentra desocupada durante un período determinado (fuente INE).                                                         |

---

## 💻 Términos Técnicos de Arquitectura

| Término                                   | Significado / Descripción                                                                                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SI3 / SieteRestWS**                     | Nombre del servicio web RESTful expuesto oficialmente por el Banco Central de Chile para la consulta programática de series estadísticas.                              |
| **GetSeries**                             | Nombre de la función remota de la API del Banco Central utilizada para extraer observaciones históricas o actuales de una serie temporal.                              |
| **App Router**                            | Sistema de enrutamiento basado en carpetas introducido en Next.js (directorio `/app`) que utiliza Server Components por defecto.                                       |
| **ISR (Incremental Static Regeneration)** | Patrón de Next.js que permite actualizar páginas estáticas en segundo plano en intervalos definidos (`revalidate`) sin reconstruir todo el sitio.                      |
| **SWR (Stale-While-Revalidate)**          | Estrategia de caché que devuelve primero los datos cacheados (stale), envía la petición de revalidación en segundo plano y finalmente actualiza el estado.             |
| **Latin-1 (ISO-8859-1)**                  | Estándar de codificación de caracteres de 8 bits para lenguajes occidentales. Utilizado por la API del Banco Central de Chile.                                         |
| **Fallback por Indicador**                | Mecanismo de resiliencia de Pulso que evita fallar globalmente cuando 1 de las 10 peticiones concurrentes al Banco Central falla, utilizando el último valor conocido. |
