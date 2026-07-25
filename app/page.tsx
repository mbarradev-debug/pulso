import type { Metadata } from 'next';
import { DashboardHome } from '@/components/DashboardHome';

export const metadata: Metadata = {
  title: 'Dashboard mindicador.cl — Vista general',
  description: 'Vista general de los indicadores economicos de Chile en tiempo real.',
};

export default function Home() {
  return <DashboardHome />;
}
