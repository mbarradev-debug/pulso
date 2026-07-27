# Agent Guidelines — Pulso (Dashboard Indicadores Económicos de Chile)

<!-- BEGIN:nextjs-agent-rules -->

## ⚠️ Next.js Version Constraint

This version of Next.js has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 🎯 System Context & Stack

- **Framework**: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript.
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";` in `app/globals.css`).
- **Data Fetching**: SWR for client-side hydration, server-side caching & snapshot engine in `lib/bcentral-client.ts` and `lib/indicadores-snapshot.ts`.
- **External API**: Banco Central de Chile SI3 (`SieteRestWS`). Latin-1 encoding handled server-side.
- **Testing**: Vitest + Testing Library (unit/component), Playwright (E2E).

---

## 🚦 Execution Boundaries

### Always

- Keep environment secrets (`BCENTRAL_USER`, `BCENTRAL_PASS`) restricted to server-side executions (`lib/`, Route Handlers). NEVER add the `NEXT_PUBLIC_` prefix to secret variables.
- Run tests (`npm run test`) and linter (`npm run lint`) after making code modifications.
- Preserve existing API fallback mechanisms: when the external Banco Central API fails, return last-known-good cached data or handle gracefully.
- Follow TypeScript strict mode without using `any` or disabling type checks.

### Ask First

- Adding or upgrading npm dependencies in `package.json`.
- Modifying environment variable schemas or altering `.env.example`.
- Changing API route contracts under `/api/indicadores/`.

### Never

- Expose raw Banco Central credentials to the client browser.
- Perform direct external HTTP calls to `si3.bcentral.cl` from Client Components (all external requests MUST route through server-side handlers).
- Commit code that breaks existing Vitest unit tests or Playwright E2E suites.

---

## 🛠️ Verification & Development Commands

| Command                | Purpose                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `npm run dev`          | Start development server with Turbopack (http://localhost:3000) |
| `npm run build`        | Validate production build                                       |
| `npm run start`        | Serve production build locally                                  |
| `npm run lint`         | Execute ESLint checks                                           |
| `npm run format`       | Format codebase using Prettier                                  |
| `npm run format:check` | Check code formatting without modifying files                   |
| `npm run test`         | Run unit and component test suite (Vitest)                      |
| `npm run test:watch`   | Run Vitest in interactive watch mode                            |
| `npm run test:e2e`     | Run End-to-End tests (Playwright)                               |

---

## 📂 Key Architecture & Map

```
app/
  page.tsx                              → Home page (SSR + SWRConfig fallback)
  api/indicadores/route.ts              → GET snapshot of 10 economic indicators
  api/indicadores/[codigo]/[anio]/      → GET historical annual series for an indicator
  dev/ui/                                → Component showcase (blocked in prod via proxy.ts)
components/                             → UI Components (DashboardHome, IndicatorCard, HistoryChart, Converter)
hooks/                                  → Custom hooks (useIndicadores, useIndicadorHistory, useFavoritos)
lib/                                    → Services (bcentral-client.ts, indicadores-snapshot.ts)
types/                                  → Domain TypeScript definitions (indicador.ts)
docs/                                   → Complete internal technical documentation
```
