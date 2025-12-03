import React, { useEffect, useState } from 'react';
import { useToppings } from '../../hooks/useToppings';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const AdminToppings = () => {
  const { toppings, loading, error, fetchToppings, createTopping, updateTopping, deleteTopping } = useToppings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState(null);
  const [toppingToDelete, setToppingToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    extra_price: '',
    available: true,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchToppings();
  }, []);

  const handleOpenModal = (topping = null) => {
    if (topping) {
      setEditingTopping(topping);
      setFormData({
        name: topping.name || '',
        description: topping.description || '',
        extra_price: topping.extra_price || '',
        available: topping.available ?? true,
      });
    } else {
      setEditingTopping(null);
      setFormData({
        name: '',
        description: '',
        extra_price: '',
        available: true,
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTopping(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.extra_price) {
      setFormError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const toppingData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        extra_price: parseFloat(formData.extra_price),
        available: formData.available,
      };

      if (editingTopping) {
        await updateTopping(editingTopping.id, toppingData);
        setSuccessMessage('Topping actualizado exitosamente');
      } else {
        await createTopping(toppingData);
        setSuccessMessage('Topping creado exitosamente');
      }

      handleCloseModal();
      fetchToppings();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);

      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        setFormError(errors.join(', '));
      } else {
        setFormError(err.response?.data?.message || 'Error al guardar el topping');
      }
    }
  };

  const handleDelete = (topping) => {
    setToppingToDelete(topping);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!toppingToDelete) return;

    try {
      await deleteTopping(toppingToDelete.id);
      setSuccessMessage('Topping eliminado exitosamente');
      fetchToppings();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);
      setFormError(err.response?.data?.message || 'Error al eliminar el topping');
      setTimeout(() => setFormError(''), 3000);
    } finally {
      setDeleteModalOpen(false);
      setToppingToDelete(null);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Toppings</h1>
          <p className="text-sm text-gray-500 mt-1">Administra los toppings decorativos disponibles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Topping
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="mb-6">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} />
        </div>
      )}

      {formError && !isModalOpen && (
        <div className="mb-6">
          <Alert type="error" message={formError} onClose={() => setFormError('')} />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader />
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio Extra</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {toppings.map(topping => (
                  <tr key={topping.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{topping.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">
                        {topping.description || <span className="text-gray-400 italic">Sin descripción</span>}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-lg font-bold text-gray-900">
                        +${parseFloat(topping.extra_price || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${topping.available
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${topping.available ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                        {topping.available ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(topping)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(topping)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {toppings.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay toppings registrados</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo topping decorativo.</p>
            </div>
          )}
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTopping ? 'Editar Topping' : 'Nuevo Topping'}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              {editingTopping ? 'Actualizar' : 'Crear'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre del topping <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
              placeholder="Ej: Chispas de Chocolate"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all resize-none"
              placeholder="Describe el topping decorativo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Precio Extra <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.extra_price}
                onChange={(e) => setFormData({ ...formData, extra_price: e.target.value })}
                required
                className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                placeholder="0.00" min="0"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Costo adicional por agregar este topping</p>
          </div>
        </form>
      </Modal>

      

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setToppingToDelete(null);
        }}
        title="Eliminar Topping"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(false);
                setToppingToDelete(null);
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
            ¿Seguro de eliminar este topping?
          </p>
          {toppingToDelete && (
            <p className="mt-2 text-sm text-gray-500 font-medium">
              {toppingToDelete.name}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AdminToppings;