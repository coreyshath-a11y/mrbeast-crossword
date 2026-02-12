'use client';

import dynamic from 'next/dynamic';

const CrosswordGrid = dynamic(() => import('@/components/CrosswordGrid'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading crossword puzzle...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <CrosswordGrid />
    </main>
  );
}
