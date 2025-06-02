'use client';

import { useState } from 'react';
import WatchForm from './components/WatchForm';
import WatchList from './components/WatchList';
import { Watch } from '@/types/watch';

export default function HomePage() {
  const [watches, setWatches] = useState<Watch[]>([]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Discover the Perfect Timepiece</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Watches are more than just accessories — they are a statement of elegance, precision, and personality. Start your collection or find the perfect gift today.
        </p>
        <div className="mt-6">
          <WatchForm onAdded={(newWatch) => setWatches((prev) => [newWatch, ...prev])} />
        </div>
      </section>

      <section>
        <WatchList watches={watches} setWatches={setWatches} />
      </section>
    </main>
  );
}