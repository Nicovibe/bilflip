import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'bilvipp — finn undervurderte biler',
  description:
    'Bilvipp skanner finn.no hver time og finner biler under markedssnitt. AI-drevet bruktbilanalyse for nordiske bilflippere.',
  applicationName: 'Bilvipp',
  authors: [{ name: 'Bilvipp' }],
  keywords: ['bruktbil', 'finn.no', 'bilflipping', 'bilanalyse', 'norsk bruktbilmarked'],
  openGraph: {
    title: 'bilvipp — finn undervurderte biler',
    description: 'Markedet er ineffektivt. Vi viser deg hvor.',
    type: 'website',
    locale: 'nb_NO',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
