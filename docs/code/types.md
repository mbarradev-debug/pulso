# Documentación de Código: Carpeta `types/`

Esta carpeta contiene los contratos de tipos e interfaces de TypeScript del sistema.

---

## 📂 Archivos en `types/`

### 1. `types/indicador.ts`

- **Responsabilidad**: Definir las estructuras de datos fundamentales para los indicadores económicos.
- **Exportaciones**:
  - `INDICADOR_CODIGOS`: Lista inmutable de códigos soportados (`uf`, `ivp`, `dolar`, `euro`, `ipc`, `utm`, `imacec`, `tpm`, `libra_cobre`, `tasa_desempleo`).
  - `IndicadorCodigo`: Tipo union de códigos válidos.
  - `Indicador`: Interface de un indicador puntual (`codigo`, `nombre`, `unidad_medida`, `fecha`, `valor`).
  - `IndicadoresSnapshot`: Interface del snapshot completo con campos opcionales para resiliencia.
  - `SerieHistoricaPunto`: Interface de una observación puntual (`fecha`, `valor`).
  - `SerieHistorica`: Interface de una serie temporal completa.
