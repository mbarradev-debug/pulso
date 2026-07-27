# Documentación de Código: Carpeta `components/`

Esta carpeta alberga los componentes React de interfaz de usuario de **Pulso**.

---

## 📂 Archivos en `components/`

### 1. `components/DashboardHome.tsx`

- **Responsabilidad**: Orquestador principal del dashboard.
- **Props**: Ninguna (Componente contenedor de alto nivel).
- **Estado**:
  - `indicadorSeleccionado` (`IndicadorCodigo`): Indicador mostrado en el gráfico.
  - `mostrarConversor` (`boolean`): Visibilidad del conversor.
  - `soloFavoritos` (`boolean`): Filtro de la grilla.
- **Flujo Visual**:
  ```mermaid
  graph TD
      DH[DashboardHome] --> Header[Header / Stats & Controls]
      DH --> Chart[HistoryChart]
      DH --> Conv[Converter (Opcional)]
      DH --> Grid[Grilla de IndicatorCard]
  ```

---

### 2. `components/IndicatorCard.tsx`

- **Responsabilidad**: Presentar la tarjeta individual de un indicador económico.
- **Props**:
  - `codigo`: `IndicadorCodigo`
  - `indicador?`: `Indicador`
  - `error?`: `boolean`
  - `isLoading?`: `boolean`
  - `seleccionado?`: `boolean`
  - `onSelect?`: `() => void`
- **Comportamiento**: Soporta eventos de teclado (`Enter`, `Space`) cuando `onSelect` está configurado.

---

### 3. `components/HistoryChart.tsx`

- **Responsabilidad**: Gráfico de series temporales dinámicas mediante `Chart.js`.
- **Props**:
  - `codigo`: `IndicadorCodigo`
  - `fechaReferencia?`: `string | Date`
  - `unidadMedida?`: `string`
- **Selección de Rango**: Pestañas para `'1M'`, `'1A'`, `'2A'`. Oculta `'1M'` dinámicamente si hay menos de 3 observaciones disponibles.

---

### 4. `components/Converter.tsx`

- **Responsabilidad**: Calculadora de conversión entre Pesos Chilenos (CLP) e indicadores económicos.
- **Estado**: `codigo`, `direccion`, `montoTexto`.
- **Lógica Borde**: Detecta si el indicador es de unidad `'Porcentaje'` para bloquear el cálculo monetario e informar el valor porcentual actual.

---

### 5. `components/FavoritesToggle.tsx`

- **Responsabilidad**: Botón interactivo en forma de estrella para agregar/quitar favoritos.
- **Props**: `activo`, `onToggle`, `className`.

---

### 6. `components/VariationBadge.tsx`

- **Responsabilidad**: Insignia para mostrar variaciones numéricas porcentuales con flechas de tendencia (`↑`, `↓`, `–`).

---

### 7. `components/Button.tsx`

- **Responsabilidad**: Componente base de botón UI con variantes `primary` y `secondary`.

---

### 8. `components/Skeleton.tsx`

- **Responsabilidad**: Bloque animado para representar estados de carga (_Skeleton loader_).

---

### 9. `components/Spinner.tsx`

- **Responsabilidad**: Indicador de carga animado circular accesible.
