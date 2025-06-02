'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Watch } from '@/types/watch';

interface Props {
  onAdded: (newWatch: Watch) => void; // Callback para notificar al componente padre que se agregó un nuevo reloj
}

export default function WatchForm({ onAdded }: Props) {
  // Estado local del formulario: campos name, brand, price, description e imagen (File)
  const [form, setForm] = useState<{
    name: string;
    brand: string;
    price: string;
    description: string;
    image: File | null;
  }>({
    name: '',
    brand: '',
    price: '',
    description: '',
    image: null,
  });

  const [loading, setLoading] = useState(false); // Indicador de carga para deshabilitar botón mientras se sube
  const [error, setError] = useState<string | null>(null); // Mensaje de error en caso de fallo

  // Maneja cambios en inputs (text, number, textarea) y en campo de archivo
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === 'image' && files) {
      // Si el campo es 'image', guardamos el File en el estado
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      // Para los demás campos (name, brand, price, description), actualizamos su valor
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Se ejecuta al enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita recarga de página
    setLoading(true);
    setError(null);

    let imageUrl = '';

    try {
      // Si el usuario seleccionó un archivo de imagen, lo subimos a Supabase Storage
      if (form.image) {
        const filename = `${Date.now()}-${form.image.name}`; // Nombre único con timestamp
        const { error: uploadError } = await supabase.storage
          .from('watches')
          .upload(filename, form.image);

        if (uploadError) throw new Error('Error al subir imagen');

        // Construimos la URL pública de la imagen subida
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/watches/${filename}`;
      }

      // Llamada a nuestro endpoint POST /api/watches para crear el nuevo reloj
      const res = await fetch('/api/watches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          brand: form.brand,
          price: Number(form.price),
          description: form.description,
          imageUrl,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar');

      // Obtenemos el objeto Watch recién creado
      const newWatch: Watch = await res.json();

      // Reiniciamos el formulario a valores vacíos
      setForm({ name: '', brand: '', price: '', description: '', image: null });
      onAdded(newWatch); // Notificamos al componente padre para actualizar la lista
    } catch (err: unknown) {
      // Capturamos cualquier excepción y mostramos el mensaje de error
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false); // Finaliza el estado de carga
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border p-6 rounded-lg shadow bg-white"
    >
      {/* Campo de texto para el nombre del reloj */}
      <input
        name="name"
        placeholder="Nombre"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />

      {/* Campo de texto para la marca */}
      <input
        name="brand"
        placeholder="Marca"
        value={form.brand}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Campo numérico para el precio */}
      <input
        name="price"
        type="number"
        placeholder="Precio"
        value={form.price}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />

      {/* Área de texto para la descripción */}
      <textarea
        name="description"
        placeholder="Descripción"
        value={form.description}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Input de tipo archivo para seleccionar la imagen */}
      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
        className="w-full border p-2 rounded cursor-pointer"
      />

      {/* Botón de envío, deshabilitado mientras loading sea true */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
      >
        {loading ? 'Guardando...' : 'Guardar reloj'}
      </button>

      {/* Mostramos el mensaje de error si existe */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}