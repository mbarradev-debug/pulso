# Guía de Contribución — Pulso

¡Gracias por tu interés en contribuir a **Pulso**! Este documento proporciona las directrices e instrucciones necesarias para configurar tu entorno de desarrollo, ejecutar pruebas, seguir el estilo de código del proyecto y enviar tus cambios mediante Pull Requests.

---

## 🚀 Requisitos Previos

- **Node.js**: `v26.0.0` o superior.
- **npm**: Administrador de paquetes por defecto.
- **Git**: Sistema de control de versiones.

---

## 🛠️ Configuración del Entorno Local

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/mbarradev-debug/pulso.git
   cd pulso
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Copia el archivo de plantilla `.env.example` a `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   Abre `.env.local` y completa las credenciales de la API SI3 del Banco Central de Chile (`BCENTRAL_USER` y `BCENTRAL_PASS`). Si no posees una cuenta, puedes registrarte gratuitamente en [si3.bcentral.cl](https://si3.bcentral.cl).

4. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🧪 Verificación y Pruebas

Antes de subir tus cambios, asegúrate de que todos los linters, formateadores y suites de pruebas pasen exitosamente:

| Comando                | Descripción                                                 |
| ---------------------- | ----------------------------------------------------------- |
| `npm run lint`         | Ejecuta ESLint para validar reglas de código                |
| `npm run format`       | Aplica Prettier en todo el proyecto                         |
| `npm run format:check` | Verifica que los archivos sigan el formato esperado         |
| `npm run test`         | Corre los tests unitarios y de componentes con Vitest       |
| `npm run test:e2e`     | Corre los tests End-to-End con Playwright                   |
| `npm run build`        | Valida que la compilación de producción compile sin errores |

---

## ⚓ Git Hooks y Commits

Este proyecto utiliza **Husky** y **lint-staged** para verificar automáticamente los archivos en staging antes de crear un commit.

- Al ejecutar `git commit`, Husky correrá automáticamente ESLint y Prettier sobre los archivos modificados.
- Si se detectan errores, corrige los fallos antes de reintentar el commit.

---

## 🔄 Flujo de Trabajo para Pull Requests (PRs)

1. **Crear una rama funcional**:

   ```bash
   git checkout -b feature/nombre-de-tu-mejora
   ```

2. **Realizar commits claros e informativos**:
   - Agrupa cambios lógicos en commits independientes.
   - Escribe mensajes de commit descriptivos en presente indicativo.

3. **Integración Continua (CI)**:
   Cada PR hacia `main` activará automáticamente los workflows de GitHub Actions (`.github/workflows/ci.yml`), verificando:
   - Linting y verificación de formato.
   - Comprobación de tipos de TypeScript.
   - Pruebas unitarias en Vitest.
   - Pruebas E2E en Playwright.
   - Build de producción Next.js.

---

## 📚 Documentación Interna

Para comprender a fondo la arquitectura, el modelo de datos, la resiliencia ante fallos del Banco Central y los patrones utilizados, consulta el índice de documentación en:

- [`docs/INDEX.md`](docs/INDEX.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`AGENTS.md`](AGENTS.md)
