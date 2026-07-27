import type { Metadata } from 'next';
import { SWRConfig } from 'swr';
import { DashboardHome } from '@/components/DashboardHome';
import { ENDPOINT_INDICADORES } from '@/hooks/useIndicadores';
import { obtenerSnapshot } from '@/lib/indicadores-snapshot';

export const metadata: Metadata = {
  title: 'Pulso — Vista general',
  description: 'Vista general de los indicadores economicos de Chile en tiempo real.',
};

export default async function Home() {
  const snapshotInicial = await obtenerSnapshot();

  // SWRConfig con `fallback` (no `fallbackData` en el hook) es el patron que
  // SWR documenta para hidratar datos obtenidos en el servidor: asegura que
  // el primer render en el servidor Y la primera hidratacion en el cliente
  // vean el mismo dato, evitando el flash de Skeleton que se ve con
  // `fallbackData` pasado directo a un Client Component.
  return (
    <SWRConfig
      value={{ fallback: snapshotInicial ? { [ENDPOINT_INDICADORES]: snapshotInicial } : {} }}
    >
      <DashboardHome />
    </SWRConfig>
  );
}
