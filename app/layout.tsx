import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '../src/styles.css';
import '../src/features.css';
import '../src/responsive.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://idris.ng'),
  title: 'idris.ng — Idris Lawal, builder & BytesBurn host',
  description: 'idris.ng — the playable world of Idris Lawal. Software developer building SubSync and Clippy, mentor, and host of BytesBurn Podcast.',
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'idris.ng — Idris Lawal’s little world',
    description: 'Build things. Share ideas. Find your spark. Explore SubSync, Clippy, and BytesBurn in Idris Lawal’s playable portfolio.',
    siteName: 'idris.ng',
    url: '/',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f6f5ef',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;650;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div id="root">{children}</div>
        <noscript>This playable portfolio needs JavaScript. Find Idris on <a href="https://www.linkedin.com/in/lawal-idris-oluwaseun/">LinkedIn</a> or watch <a href="https://www.youtube.com/@BytesBurn">BytesBurn</a>.</noscript>
      </body>
    </html>
  );
}
