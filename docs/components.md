# Sistema de Componentes React UI

Este documento especifica la arquitectura de interfaz de usuario de **Pulso**, detallando cada componente React, sus propiedades (props), estado interno, accesibilidad y ciclo de renderizado.

---

## 🧩 Catálogo de Componentes

### 1. `DashboardHome`

- **Archivo**: `components/DashboardHome.tsx`
- **Tipo**: Client Component (`'use client'`).
- **Propósito**: Contenedor principal de la interfaz del dashboard. Coordina la barra superior, el selector de indicador destacado, la grilla de tarjetas, el conversor y el filtro de favoritos.
- **Estado Interno**:
  - `indicadorSeleccionado`: `IndicadorCodigo` (por defecto `'dolar'`). Define qué indicador se grafica en `<HistoryChart />`.
  - `mostrarConversor`: `boolean` (por defecto `false`). Controla la visibilidad de la sección de conversión.
  - `soloFavoritos`: `boolean` (por defecto `false`). Filtra la grilla para mostrar únicamente los indicadores marcados como favoritos.
  - `soloFavoritosAnterior`: Control de estado durante la renderización para ajustar automáticamente el indicador seleccionado si el seleccionado previo deja de estar visible al filtrar.
- **Hooks Utilizados**: `useIndicadores()`, `useFavoritos()`, `useMemo()`, `useState()`.
- **Estructura JSX Notable**:
  - Encabezado con título, timestamp de última actualización formateado con `formatFecha()`, spinner de validación en segundo plano y botones de alternancia (Favoritos / Conversor).
  - Sección superior con `<HistoryChart />` del indicador seleccionado.
  - Sección opcional con `<Converter />`.
  - Grilla responsiva (`grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]`) con las tarjetas `<IndicatorCard />`.

---

### 2. `IndicatorCard`

- **Archivo**: `components/IndicatorCard.tsx`
- **Tipo**: Client Component (`'use client'`).
- **Propósito**: Renderizar una tarjeta individual con la información de un indicador económico.
- **Props Interface**:

```typescript
interface IndicatorCardProps {
  codigo: IndicadorCodigo;
  indicador?: Indicador;
  error?: boolean;
  isLoading?: boolean;
  seleccionado?: boolean;
  onSelect?: () => void;
}
```

- **Hooks Utilizados**: `useFavoritos()`.
- **Accesibilidad**: Si `onSelect` está presente, la tarjeta actúa como botón accesible (`role="button"`, `tabIndex={0}`, `aria-pressed={seleccionado}`, y escucha de teclas `Enter` y `Space`).
- **Estados de Renderizado**:
  1. **Loading (`isLoading === true`)**: Muestra bloques `<Skeleton />`.
  2. **No Disponible (`error || !indicador`)**: Muestra un texto secundario "Dato no disponible".
  3. **Éxito**: Muestra el nombre recortado (`truncate`), el valor formateado con `formatValorPorUnidad()` y el botón `<FavoritesToggle />`.

---

### 3. `HistoryChart`

- **Archivo**: `components/HistoryChart.tsx`
- **Tipo**: Client Component (`'use client'`).
- **Propósito**: Visualizar la evolución histórica de un indicador mediante un gráfico de líneas dinámico.
- **Props Interface**:

```typescript
interface HistoryChartProps {
  codigo: IndicadorCodigo;
  fechaReferencia?: string | Date;
  unidadMedida?: string;
}
```

- **Estado y Selección de Rango**:
  - Soporta tres rangos: `'1M'` (1 mes), `'1A'` (1 año), `'2A'` (2 años).
  - Filtra dinámicamente los rangos visibles mediante `MIN_PUNTOS_RANGO = 3`. Si un indicador mensual tiene menos de 3 puntos en 1 mes, la pestaña `'1M'` se oculta automáticamente para evitar mostrar gráficos vacíos o distorsionados.
- **Integración con Chart.js**:
  - Utiliza `react-chartjs-2` registrado con `CategoryScale`, `LinearScale`, `PointElement`, `LineElement`, `Tooltip`, `Filler`.
  - Obtiene colores de variables CSS (`getCssVar('--up')` / `getCssVar('--down')`) para ajustar dinámicamente el color de la línea según la tendencia (verde si el valor final ≥ inicial, rojo si descendió).
  - Personalización de Tooltips para formatear valores y fechas con la configuración regional de Chile.

---

### 4. `Converter`

- **Archivo**: `components/Converter.tsx`
- **Tipo**: Client Component (`'use client'`).
- **Propósito**: Calculadora bidireccional para convertir montos entre Pesos Chilenos (CLP) e Indicadores (ej: UF a CLP o CLP a Dólar).
- **Estado Interno**:
  - `codigo`: `IndicadorCodigo` (por defecto `'uf'`).
  - `direccion`: `'clpAIndicador' | 'indicadorAClp'`.
  - `montoTexto`: `string` (por defecto `'100000'`).
- **Lógica de Cálculo**:
  - Si el indicador es de tipo `'Porcentaje'` (ej: IPC, TPM, Imacec, Tasa de desempleo), el conversor detecta que no es una unidad convertible en dinero y muestra un mensaje informativo con el valor actual.
  - De lo contrario, calcula `monto / valor` o `monto * valor` utilizando `useMemo`.
  - Botón de Inversión (`handleSwap`): Invierte la dirección y recalcula el monto manteniendo el valor equivalente.

---

### 5. `FavoritesToggle`

- **Archivo**: `components/FavoritesToggle.tsx`
- **Tipo**: Client Component (`'use client'`).
- **Propósito**: Botón de estrella interactivo para marcar o desmarcar un indicador como favorito.
- **Props Interface**:

```typescript
interface FavoritesToggleProps {
  activo: boolean;
  onToggle: () => void;
  className?: string;
}
```

- **Comportamiento**: Detiene la propagación del evento (`event.stopPropagation()`) para prevenir que el clic dispare el `onSelect` de la tarjeta contenedora `<IndicatorCard />`.

---

### 6. `VariationBadge`

- **Archivo**: `components/VariationBadge.tsx`
- **Tipo**: Componente Presentacional.
- **Propósito**: Mostrar pequeñas insignias numéricas con la variación porcentual y flechas indicadoras de tendencia (`↑` verde para positivo, `↓` rojo para negativo, `–` gris para neutro).
- **Props Interface**:

```typescript
interface VariationBadgeProps {
  value: number;
  size?: 'default' | 'lg';
  className?: string;
}
```

---

### 7. `Button`

- **Archivo**: `components/Button.tsx`
- **Propósito**: Botón UI estándar con variantes `primary` (fondo acento) y `secondary` (borde sutil), estados disabled y estilos de foco accesibles (`focus-visible`).

---

### 8. `Skeleton`

- **Archivo**: `components/Skeleton.tsx`
- **Propósito**: Bloque con animación de pulso (`animate-pulse`) para representar estados de carga en componentes. Acepta propiedades `width`, `height` o clases utilitarias de Tailwind.

---

### 9. `Spinner`

- **Archivo**: `components/Spinner.tsx`
- **Propósito**: Indicador circular giratorio (`animate-spin`) con atributo `role="status"` y `aria-label="Actualizando"` para tecnologías de asistencia.
