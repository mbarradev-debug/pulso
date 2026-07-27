# Documentación de Código: Carpeta `hooks/`

Esta carpeta contiene los custom hooks de React desarrollados para la gestión de datos remotos y estado local en **Pulso**.

---

## 📂 Archivos en `hooks/`

### 1. `hooks/useIndicadores.ts`

- **Responsabilidad**: Obtener la fotografía actual de los indicadores desde `/api/indicadores` con SWR.
- **Exportaciones**:
  - `ENDPOINT_INDICADORES`: Constante `/api/indicadores`.
  - `useIndicadores()`: Hook principal.
- **Retorno**: `{ data, isLoading, isValidating, error }`.

---

### 2. `hooks/useIndicadorHistory.ts`

- **Responsabilidad**: Obtener las series históricas multianuales consolidadas de un indicador.
- **Firma**: `useIndicadorHistory(codigo: IndicadorCodigo, fechaAncla: Date)`
- **Estrategia**: Consulta en paralelo los 3 años requeridos para cubrir hasta 24 meses hacia atrás desde la fecha ancla.

---

### 3. `hooks/useFavoritos.ts`

- **Responsabilidad**: Administrar la lista de indicadores preferidos persistida en `localStorage`.
- **Implementación**: Utiliza `useSyncExternalStore` para evitar parpadeos de hidratación en SSR y mantener la sincronización multi-pestaña mediante eventos `storage`.
- **Retorno**: `{ favoritos, toggleFavorito, esFavorito }`.
