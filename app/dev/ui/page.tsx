import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import { VariationBadge } from '@/components/VariationBadge';

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
    </div>
  );
}
