import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Fira_Code, Fira_Sans } from 'next/font/google';
import './globals.css';

const firaSans = Fira_Sans({
  variable: '--font-fira-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const firaCode = Fira_Code({
  variable: '--font-fira-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const SITE_URL = 'https://pulso-cyan-zeta.vercel.app';
const TITLE = 'Pulso — Indicadores económicos de Chile';
const DESCRIPTION =
  'Panel de indicadores económicos de Chile en tiempo real: UF, dólar, euro, IPC, TPM y más.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: 'Pulso',
    images: ['/opengraph-image'],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`dark ${firaSans.variable} ${firaCode.variable} h-full antialiased`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
