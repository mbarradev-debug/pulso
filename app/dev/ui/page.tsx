import { notFound } from 'next/navigation';
import { Button } from '@/components/Button';
import { Converter } from '@/components/Converter';
import { HistoryChart } from '@/components/HistoryChart';
import { IndicatorCard } from '@/components/IndicatorCard';
import { Skeleton } from '@/components/Skeleton';
import { VariationBadge } from '@/components/VariationBadge';
import type { Indicador } from '@/types/indicador';

export const dynamic = 'force-dynamic';

const dolarEjemplo: Indicador = {
  codigo: 'dolar',
  nombre: 'Dolar observado',
  unidad_medida: 'Pesos',
  fecha: '2026-07-25T04:00:00.000Z',
  valor: 946.24,
};

const ipcEjemplo: Indicador = {
  codigo: 'ipc',
  nombre: 'IPC',
  unidad_medida: 'Porcentaje',
  fecha: '2026-07-25T04:00:00.000Z',
  valor: -0.2,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-foreground-secondary uppercase">
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-4 rounded border border-border bg-surface p-6">
        {children}
      </div>
    </section>
  );
}

export default function UiShowcasePage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-lg font-semibold text-foreground">
        Componentes base de UI (dev only)
      </h1>

      <Section title="Button">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="primary" disabled>
          Primary disabled
        </Button>
        <Button variant="secondary" disabled>
          Secondary disabled
        </Button>
      </Section>

      <Section title="VariationBadge">
        <VariationBadge value={0.35} />
        <VariationBadge value={-2.4} />
        <VariationBadge value={0} />
        <VariationBadge value={0.02} size="lg" />
        <VariationBadge value={-1.8} size="lg" />
        <VariationBadge value={0} size="lg" />
      </Section>

      <Section title="Skeleton">
        <Skeleton className="h-4 w-40" />
        <Skeleton width={200} height={40} />
        <Skeleton className="h-24 w-24" />
      </Section>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-foreground-secondary uppercase">
          IndicatorCard (grilla igual a page.tsx)
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
          <IndicatorCard codigo="dolar" indicador={dolarEjemplo} />
          <IndicatorCard codigo="ipc" indicador={ipcEjemplo} />
          <IndicatorCard codigo="utm" error />
          <IndicatorCard codigo="euro" isLoading />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-foreground-secondary uppercase">
          HistoryChart
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <HistoryChart codigo="dolar" />
          <HistoryChart codigo="ipc" />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-foreground-secondary uppercase">
          Converter
        </h2>
        <div className="max-w-lg">
          <Converter />
        </div>
      </section>
    </div>
  );
}
