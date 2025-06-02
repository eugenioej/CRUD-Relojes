'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function WatchForm({ onAdded }: { onAdded: (newWatch: any) => void }) {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    price: '',
    description: '',
    image: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === 'image' && files) {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let imageUrl = '';

    try {
      if (form.image) {
        const filename = `${Date.now()}-${form.image.name}`;
        const { error: uploadError } = await supabase.storage
          .from('watches')
          .upload(filename, form.image);

        if (uploadError) throw new Error('Error al subir imagen');

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/watches/${filename}`;
      }

      const res = await fetch('/api/watches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price), imageUrl }),
      });

      if (!res.ok) throw new Error('Error al guardar');

      const newWatch = await res.json();
      setForm({ name: '', brand: '', price: '', description: '', image: null });
      onAdded(newWatch);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-6 rounded-lg shadow bg-white">
      <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required className="w-full border p-2 rounded" />
      <input name="brand" placeholder="Marca" value={form.brand} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="price" type="number" placeholder="Precio" value={form.price} onChange={handleChange} required className="w-full border p-2 rounded" />
      <textarea name="description" placeholder="Descripción" value={form.description} onChange={handleChange} className="w-full border p-2 rounded" />
      <input type="file" name="image" accept="image/*" onChange={handleChange} className="w-full border p-2 rounded cursor-pointer" />
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer">
        {loading ? 'Guardando...' : 'Guardar reloj'}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}