import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'Dashboard mindicador.cl',
  description:
    'Panel de indicadores económicos de Chile en tiempo real: UF, dólar, euro, IPC, TPM y más.',
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
