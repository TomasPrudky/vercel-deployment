'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import BouncingBall from './components/BouncingBall';

const CompleteTable = dynamic(() => import('./components/CompleteTable'), { ssr: false });
const FplPage = dynamic(() => import('./components/FplPage'), { ssr: false });
const SeriePage = dynamic(() => import('./components/SeriePage'), { ssr: false });

export default function Home() {
  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', position: 'relative' }}>
      <BouncingBall />
      <CompleteTable />
      <hr style={{ margin: '30px 0' }} />
      <FplPage />
      <hr style={{ margin: '30px 0' }} />
      <SeriePage />
    </main>
  );
}