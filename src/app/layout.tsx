import type { Metadata, Viewport } from 'next';
import * as React from 'react';
import { Analytics } from '@vercel/analytics/next';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/plus-jakarta-sans';
import './globals.css';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { MobileBar } from '@/components/site/MobileBar';
import { site } from '@/data/site';
import { FirstVisitIntro, introScript } from '@/components/site/FirstVisitIntro';

// React's View Transitions component (available through Next's experimental.viewTransition flag).
const ViewTransition = ((React as any).unstable_ViewTransition ?? React.Fragment) as React.ComponentType<{ children: React.ReactNode }>;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'ABA Therapy & Autism Evaluations in Texas | Texas ABA Centers',
    template: '%s | Texas ABA Centers',
  },
  description:
    'ABA therapy and autism evaluations in Austin, Cedar Hill, Katy, Pearland, Plano and Sugar Land, with no long waitlist. Request a tour and a real person texts you back.',
  applicationName: site.name,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: 'ABA Therapy & Autism Evaluations in Texas | Texas ABA Centers',
    description: site.tagline,
    url: site.url,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Texas ABA Centers' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { languages: { en: '/', es: '/es' } },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf8f3' },
    { media: '(prefers-color-scheme: dark)', color: '#161924' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <div data-intro-overlay className="fixed inset-0 z-[59] bg-paper" aria-hidden />
        <FirstVisitIntro />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          <ViewTransition>{children}</ViewTransition>
        </main>
        <Footer />
        <MobileBar />
        <Analytics />
      </body>
    </html>
  );
}
