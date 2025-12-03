import React, { useEffect, useState } from 'react';
import { useFlavors } from '../../hooks/useFlavors';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import api from '../../api/axiosConfig';

const AdminFlavors = () => {
  const { flavors, loading, error, fetchFlavors, createFlavor, updateFlavor, deleteFlavor } = useFlavors();
  const [sizes, setSizes] = useState([]);
  const [loadingSizes, setLoadingSizes] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState(null);
  const [flavorToDelete, setFlavorToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    available: true,
    prices: {},
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchFlavors();
    fetchSizes();
  }, [fetchFlavors]);

  const fetchSizes = async () => {
    try {
      setLoadingSizes(true);
      const response = await api.get('/catalog/sizes');
      const sizesData = response.data.data || response.data || [];
      setSizes(sizesData);

      const initialPrices = {};
      sizesData.forEach(size => {
        initialPrices[size.id] = '';
      });
      setFormData(prev => ({ ...prev, prices: initialPrices }));
    } catch (err) {
      console.error('Error cargando tamaños:', err);
    } finally {
      setLoadingSizes(false);
    }
  };

  const handleOpenModal = (flavor = null) => {
    if (flavor) {
      setEditingFlavor(flavor);
      const prices = {};
      sizes.forEach(size => {
        prices[size.id] = flavor.prices?.[size.id] || '';
      });
      setFormData({
        name: flavor.name || '',
        description: flavor.description || '',
        available: flavor.available ?? true,
        prices: prices,
      });
    } else {
      setEditingFlavor(null);
      const initialPrices = {};
      sizes.forEach(size => {
        initialPrices[size.id] = '';
      });
      setFormData({
        name: '',
        description: '',
        available: true,
        prices: initialPrices,
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFlavor(null);
    setFormError('');
  };

  const handlePriceChange = (sizeId, value) => {
    setFormData(prev => ({
      ...prev,
      prices: {
        ...prev.prices,
        [sizeId]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!formData.name) {
      setFormError('El nombre del sabor es requerido');
      return;
    }

    const missingPrices = sizes.filter(size =>
      !formData.prices[size.id] || parseFloat(formData.prices[size.id]) <= 0
    );

    if (missingPrices.length > 0) {
      setFormError(`Falta precio para: ${missingPrices.map(s => s.name).join(', ')}`);
      return;
    }

    try {
      const pricesData = {};
      Object.entries(formData.prices).forEach(([sizeId, price]) => {
        pricesData[sizeId] = parseFloat(price);
      });

      const flavorData = {
        name: formData.name,
        description: formData.description || null,
        available: formData.available,
        prices: pricesData,
      };

      if (editingFlavor) {
        await updateFlavor(editingFlavor.id, flavorData);
        setSuccessMessage('Sabor actualizado exitosamente');
      } else {
        await createFlavor(flavorData);
        setSuccessMessage('Sabor creado exitosamente');
      }

      handleCloseModal();
      fetchFlavors();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        setFormError(errors.join(', '));
      } else {
        setFormError(err.response?.data?.message || 'Error al guardar el sabor');
      }
    }
  };

  const handleDelete = (flavor) => {
    setFlavorToDelete(flavor);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!flavorToDelete) return;

    try {
      await deleteFlavor(flavorToDelete.id);
      setSuccessMessage('Sabor eliminado exitosamente');
      fetchFlavors();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);
      setFormError(err.response?.data?.message || 'Error al eliminar el sabor');
      setTimeout(() => setFormError(''), 3000);
    } finally {
      setDeleteModalOpen(false);
      setFlavorToDelete(null);
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Sabores</h1>
            <p className="mt-2 text-sm text-gray-600">
              Administra los sabores y sus precios por tamaño
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            disabled={loadingSizes}
            className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Sabor
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
      )}

      {(error || formError) && (
        <div className="mb-6">
          <Alert type="error" message={error || formError} onClose={() => setFormError('')} />
        </div>
      )}

      {loading || loadingSizes ? (
        <div className="flex justify-center items-center py-12">
          <Loader />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sabor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  {sizes.map(size => (
                    <th key={size.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {size.name}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flavors.map(flavor => (
                  <tr key={flavor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {flavor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{flavor.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {flavor.description || 'Sin descripción'}
                      </div>
                    </td>
                    {sizes.map(size => (
                      <td key={size.id} className="px-4 py-4 text-center">
                        <span className={`text-sm font-medium ${flavor.prices?.[size.id] ? 'text-green-600' : 'text-red-500'
                          }`}>
                          {flavor.prices?.[size.id]
                            ? `$${parseFloat(flavor.prices[size.id]).toFixed(2)}`
                            : '—'}
                        </span>
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${flavor.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {flavor.available ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(flavor)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(flavor)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {flavors.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay sabores</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo sabor.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingFlavor ? 'Editar Sabor' : 'Nuevo Sabor'}
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              {editingFlavor ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{formError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre del sabor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Ej: Chocolate, Vainilla, Fresa..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="2"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
              placeholder="Describe las características del sabor..."
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Precios por Tamaño <span className="text-red-500">*</span>
            </label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {sizes.map(size => (
                <div key={size.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{size.name}</span>
                    {size.description && (
                      <span className="text-xs text-gray-500 ml-2">({size.description})</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.prices[size.id] || ''}
                      onChange={(e) => handlePriceChange(size.id, e.target.value)}
                      className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-right"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Define el precio base del pastel para cada tamaño con este sabor.
            </p>
          </div>

        </div>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFlavorToDelete(null);
        }}
        title="Eliminar Sabor"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(false);
                setFlavorToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </>
        }
      >
        <div className="text-center sm:text-left">
          <p className="text-gray-600">
            ¿Seguro de eliminar este sabor? Esta acción eliminará también sus precios asociados.
          </p>
          {flavorToDelete && (
            <p className="mt-2 text-sm text-gray-500 font-medium">
              {flavorToDelete.name}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AdminFlavors;