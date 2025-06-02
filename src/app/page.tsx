'use client';

import { useState } from 'react';
import WatchForm from './components/WatchForm';
import WatchList from './components/WatchList';
import Image from 'next/image';

export default function HomePage() {
  const [watches, setWatches] = useState<any[]>([]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white rounded-xl overflow-hidden shadow-lg mb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-gray-800/60 z-10" />
        <div className="relative z-20 px-6 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            El reloj: el accesorio perfecto
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Más que dar la hora, un reloj es estilo, precisión y una declaración de intenciones. ¡Encuentra el que se alinee con tu personalidad!
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="text-center mb-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-3">¿Por qué elegir un buen reloj?</h2>
        <p className="text-gray-600">
          Un reloj no es solo un instrumento, es una extensión de tu estilo, de tu historia y de cómo valoras tu tiempo. 
          Ya sea minimalista o llamativo, clásico o moderno, el reloj adecuado complementa cada faceta de tu vida.
        </p>
      </section>

      {/* Add Watch Form */}
      <section className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Agrega un nuevo reloj a tu colección</h3>
        <WatchForm
          onAdded={(newWatch) => setWatches((prev) => [newWatch, ...prev])}
        />
      </section>

      {/* Watch List */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Lista de relojes</h3>
        <WatchList watches={watches} setWatches={setWatches} />
      </section>
    </main>
  );
}
