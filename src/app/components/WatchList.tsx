/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Watch } from '@/types/watch';

export default function WatchList({
  watches,
  setWatches,
}: {
  watches: Watch[];
  setWatches: React.Dispatch<React.SetStateAction<Watch[]>>;
}) {
  const [editingWatch, setEditingWatch] = useState<Watch | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    brand: '',
    price: '',
    description: '',
    imageUrl: '',
  });

  // Estados para filtros
  const [brandFilter, setBrandFilter] = useState('');
  const [priceFilterMin, setPriceFilterMin] = useState('');
  const [priceFilterMax, setPriceFilterMax] = useState('');

  // Función para obtener los relojes desde la API
  const fetchWatches = async () => {
    try {
      const res = await fetch('/api/watches');
      const data = await res.json();
      setWatches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching watches:', error);
    }
  };

  // Función para filtrar los relojes por marca y precio
  const getFilteredWatches = () => {
    return watches.filter((watch) => {
      const matchesBrand =
        brandFilter === '' ||
        watch.brand?.toLowerCase().includes(brandFilter.toLowerCase());

      const price = parseFloat(watch.price?.toString() || '0');
      const min = parseFloat(priceFilterMin || '0');
      const max = parseFloat(priceFilterMax || '999999');

      const matchesPrice = price >= min && price <= max;

      return matchesBrand && matchesPrice;
    });
  };

  const filteredWatches = getFilteredWatches();

  const confirmDeleteDialog = (watchName: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const confirmed = window.confirm(`¿Seguro que quieres eliminar "${watchName}"?`);
      resolve(confirmed);
    });
  };

  const deleteWatch = async (watch: Watch) => {
    const confirmDelete = await confirmDeleteDialog(watch.name);
    if (!confirmDelete) return;

    try {
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
    } catch (error) {
      console.error('Error al eliminar reloj:', error);
      toast.error('Error al eliminar reloj');
    }
  };

  const handleEditClick = (watch: Watch) => {
    setEditingWatch(watch);
    setFormState({
      name: watch.name || '',
      brand: watch.brand || '',
      price: watch.price?.toString() || '',
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

    try {
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
    } catch (error) {
      console.error('Error al actualizar reloj:', error);
      toast.error('Error al actualizar reloj');
    }
  };

  useEffect(() => {
    fetchWatches();
  }, []);

  return (
    <>
      <Toaster />

      {/* Filtros de búsqueda */}
      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Filtrar por marca"
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
        <input
          type="number"
          placeholder="Precio mínimo"
          value={priceFilterMin}
          onChange={(e) => setPriceFilterMin(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
        <input
          type="number"
          placeholder="Precio máximo"
          value={priceFilterMax}
          onChange={(e) => setPriceFilterMax(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>

      {/* Mensaje si no hay relojes */}
      {filteredWatches.length === 0 ? (
        <p className="mt-6 text-center">No hay relojes que coincidan con los filtros.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
          {filteredWatches.map((watch) => (
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
      )}

      {/* Modal de edición */}
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