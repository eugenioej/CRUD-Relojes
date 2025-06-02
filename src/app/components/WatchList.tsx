/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export default function WatchList({
  watches,
  setWatches,
}: {
  watches: any[];
  setWatches: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [editingWatch, setEditingWatch] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    brand: '',
    price: '',
    description: '',
    imageUrl: '',
  });

  const [filter, setFilter] = useState({
    maxPrice: '',
    brand: '',
  });

  const fetchWatches = async () => {
    const res = await fetch('/api/watches');
    const data = await res.json();
    setWatches(Array.isArray(data) ? data : []);
  };

  const confirmDeleteDialog = (watchName: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const confirmed = window.confirm(`¿Seguro que quieres eliminar "${watchName}"?`);
      resolve(confirmed);
    });
  };

  const deleteWatch = async (watch: any) => {
    const confirmDelete = await confirmDeleteDialog(watch.name);
    if (!confirmDelete) return;

    const res = await fetch(`/api/watches/${watch.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: watch.imageUrl }),
    });

    if (res.ok) {
      setWatches((prev) => prev.filter((w) => w.id !== watch.id));
      toast.success('Reloj eliminado correctamente');
    } else {
      toast.error('Error al eliminar reloj');
    }
  };

  const handleEditClick = (watch: any) => {
    setEditingWatch(watch);
    setFormState({
      name: watch.name || '',
      brand: watch.brand || '',
      price: watch.price ? String(watch.price) : '',
      description: watch.description || '',
      imageUrl: watch.imageUrl || '',
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingWatch(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWatch) return;
    const res = await fetch(`/api/watches/${editingWatch.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formState,
        price: parseFloat(formState.price),
      }),
    });
    if (res.ok) {
      setShowModal(false);
      setEditingWatch(null);
      await fetchWatches();
      toast.success('Reloj actualizado');
    } else {
      toast.error('Error al actualizar reloj');
    }
  };

  useEffect(() => {
    fetchWatches();
  }, []);

  if (!watches.length) {
    return <p className="mt-6 text-center">No hay relojes todavía.</p>;
  }

  return (
    <>
      <Toaster />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio máximo</label>
          <input
            type="number"
            name="maxPrice"
            placeholder="Ej. 1000"
            className="border px-2 py-1 rounded w-40"
            value={filter.maxPrice}
            onChange={(e) => setFilter((prev) => ({ ...prev, maxPrice: e.target.value }))}
          />
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <div className="flex gap-2 flex-wrap">
            {Array.from(new Set(watches.map((w) => w.brand).filter(Boolean))).map((brand) => (
              <button
                key={brand}
                onClick={() =>
                  setFilter((prev) => ({
                    ...prev,
                    brand: prev.brand === brand ? '' : brand,
                  }))
                }
                className={`px-3 py-1 rounded-full border text-sm ${
                  filter.brand === brand
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
        {watches
          .filter((w) => (filter.maxPrice ? w.price <= parseFloat(filter.maxPrice) : true))
          .filter((w) => (filter.brand ? w.brand === filter.brand : true))
          .map((watch) => (
            <div
              key={watch.id}
              className="border border-gray-200 rounded-lg shadow hover:shadow-md transition overflow-hidden bg-white flex flex-col cursor-pointer"
            >
              <img
                src={watch.imageUrl}
                alt={watch.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{watch.name}</h3>
                  {watch.brand && (
                    <p className="text-sm text-gray-500 mb-1">{watch.brand}</p>
                  )}
                  <p className="text-blue-600 font-bold">${watch.price}</p>
                  {watch.description && (
                    <p className="text-sm mt-2 text-gray-700">{watch.description}</p>
                  )}
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleEditClick(watch)}
                    className="text-sm text-blue-500 hover:underline self-start cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteWatch(watch)}
                    className="text-sm text-red-500 hover:underline self-start cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {showModal && editingWatch && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl"
              onClick={handleModalClose}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4">Editar reloj</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Marca</label>
                <input
                  type="text"
                  name="brand"
                  value={formState.brand}
                  onChange={handleInputChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formState.price}
                  onChange={handleInputChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  className="w-full border rounded px-2 py-1"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL de imagen</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formState.imageUrl}
                  onChange={handleInputChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={handleModalClose}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
