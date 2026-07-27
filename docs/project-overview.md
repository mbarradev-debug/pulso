# Visión General del Proyecto y Objetivos

**Pulso** es una aplicación web moderna orientada al mercado chileno que ofrece un panel de control en tiempo real para el seguimiento de indicadores económicos clave: **Unidad de Fomento (UF)**, **Dólar Observado**, **Euro**, **IPC**, **UTM**, **Imacec**, **Tasa de Política Monetaria (TPM)**, **Libra de Cobre**, **IVP** y **Tasa de Desempleo**.

---

## 🎯 Objetivos de Producto

1. **Información Macroeconómica Accesible**: Proporcionar a ciudadanos, profesionales y empresas una plataforma rápida, clara y sin distracciones para consultar los valores oficiales publicados por el Banco Central de Chile.
2. **Resiliencia Operativa**: Garantizar una disponibilidad del 99.9% frente a interrupciones externas mediante cachés en memoria y estrategias de degradación elegante (_graceful degradation_).
3. **Conversión y Herramientas Útiles**: Incluir herramientas de cálculo financiero rápido (conversor CLP ⇄ Indicadores) y visualización de series históricas de hasta 2 años.
4. **Experiencia de Usuario Inmediata**: Eliminar latencias percibidas mediante renderizado estático en el servidor (SSR/ISR) e hidratación transparente con SWR en el cliente.

---

## 🚀 Requerimientos No Funcionales

### 1. Rendimiento y Carga Útil

- **First Contentful Paint (FCP)** < 1.0s.
- **Time to Interactive (TTI)** < 1.5s.
- Rendimiento de 100/100 en auditorías de Google Lighthouse.
- Los gráficos se renderizan mediante Canvas (`chart.js`) aprovechando aceleración por hardware.

### 2. SEO y Metadatos

- Etiquetas Metadata de Next.js configuradas dinámicamente.
- OpenGraph e imágenes pre-generadas mediante `@vercel/og` (`app/opengraph-image.tsx`).
- Inclusión de Sitemap XML estandarizado (`app/sitemap.ts`) y directivas para motores de búsqueda (`app/robots.ts`).

### 3. Accesibilidad (a11y)

- Cumplimiento de estándares WCAG 2.1 Nivel AA.
- Soporte completo para navegación por teclado (atributos `tabIndex`, `onKeyDown`, `aria-pressed`, `aria-label`).
- Utilización de fuentes tipográficas legibles con buen contraste sobre fondo oscuro (Dark Mode nativo).

---

## 📊 Lista de Indicadores Soportados

| Indicador          | Nombre Oficial Banco Central          | Código Interno   | Unidad de Medida | Frecuencia               |
| ------------------ | ------------------------------------- | ---------------- | ---------------- | ------------------------ |
| **UF**             | Unidad de fomento (UF)                | `uf`             | Pesos            | Diaria                   |
| **IVP**            | Índice de valor promedio (IVP)        | `ivp`            | Pesos            | Diaria                   |
| **Dólar**          | Dólar observado                       | `dolar`          | Pesos            | Diaria hábil             |
| **Euro**           | Euro                                  | `euro`           | Pesos            | Diaria hábil             |
| **IPC**            | Índice de Precios al Consumidor (IPC) | `ipc`            | Porcentaje       | Mensual                  |
| **UTM**            | Unidad Tributaria Mensual (UTM)       | `utm`            | Pesos            | Mensual                  |
| **Imacec**         | Imacec                                | `imacec`         | Porcentaje       | Mensual                  |
| **TPM**            | Tasa de Política Monetaria (TPM)      | `tpm`            | Porcentaje       | Diaria / Cambio Política |
| **Libra de Cobre** | Libra de cobre                        | `libra_cobre`    | Dólar            | Diaria                   |
| **Tasa Desempleo** | Tasa de desempleo                     | `tasa_desempleo` | Porcentaje       | Mensual                  |

_Nota: Los indicadores como Bitcoin o Dólar Intercambio fueron excluidos formalmente por no formar parte del catálogo de series oficiales publicadas por el Banco Central de Chile._
