'use client';

import dynamic from 'next/dynamic';

// The game uses WebGL, window and localStorage; mount it only in the browser.
const Portfolio = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => <p role="status" style={{ padding: '2rem', textAlign: 'center' }}>Loading Idris’s little world…</p>,
});

export default function Page() {
  return <Portfolio />;
}
