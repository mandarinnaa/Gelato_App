import React, { useEffect, useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import MultipleImageUploader from '../../components/common/MultipleImageUploader';
import axios from 'axios';

const AdminProducts = () => {
  const { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    flavor_id: '',
    final_price: '',
    stock: 0,
    available: true,
    featured: false,
  });

  const [imageData, setImageData] = useState({
    newFiles: [],
    primaryIndex: 0,
    deleteIds: [],
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  const [categories, setCategories] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchProducts();
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const [categoriesRes, flavorsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/categories`, config),
        axios.get(`${API_BASE_URL}/catalog/flavors`),
      ]);

      setCategories(categoriesRes.data.data || categoriesRes.data || []);
      setFlavors(flavorsRes.data.data || flavorsRes.data || []);
    } catch (err) {
      console.error('Error cargando opciones:', err);
      setFormError('Error al cargar las opciones del formulario');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category?.id || product.category_id || '',
        flavor_id: product.flavor?.id || product.flavor_id || '',
        final_price: product.final_price || '',
        stock: product.stock || 0,
        available: product.available ?? true,
        featured: product.featured ?? false,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        category_id: categories[0]?.id || '',
        flavor_id: flavors[0]?.id || '',
        final_price: '',
        stock: 0,
        available: true,
        featured: false,
      });
      setImageData({
        newFiles: [],
        primaryIndex: 0,
        deleteIds: [],
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImageData({
      newFiles: [],
      primaryIndex: 0,
      deleteIds: [],
    });
    setFormError('');
  };

  const handleImagesChange = (data) => {
    setImageData(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.category_id || !formData.flavor_id || !formData.final_price) {
      setFormError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!editingProduct && imageData.newFiles.length === 0) {
      setFormError('Debes agregar al menos una imagen');
      return;
    }

    try {
      const productData = new FormData();

      productData.append('name', formData.name);
      productData.append('category_id', parseInt(formData.category_id));
      productData.append('flavor_id', parseInt(formData.flavor_id));

      const finalPrice = parseFloat(formData.final_price);
      if (isNaN(finalPrice)) {
        setFormError('El precio debe ser un número válido');
        return;
      }
      productData.append('final_price', finalPrice.toFixed(2));

      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        setFormError('El stock debe ser un número válido mayor o igual a 0');
        return;
      }
      productData.append('stock', stock);

      if (formData.description) {
        productData.append('description', formData.description);
      }

      imageData.newFiles.forEach((file, index) => {
        productData.append(`images[${index}]`, file);
      });

      if (imageData.newFiles.length > 0) {
        productData.append('primary_image_index', imageData.primaryIndex);
      }

      if (editingProduct && imageData.deleteIds.length > 0) {
        imageData.deleteIds.forEach((id, index) => {
          productData.append(`delete_images[${index}]`, id);
        });
      }

      productData.append('available', formData.available ? 1 : 0);
      productData.append('featured', formData.featured ? 1 : 0);

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        setSuccessMessage('Producto actualizado exitosamente');
      } else {
        await createProduct(productData);
        setSuccessMessage('Producto creado exitosamente');
      }

      handleCloseModal();
      fetchProducts();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);

      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        setFormError(errors.join(', '));
      } else {
        setFormError(err.response?.data?.message || 'Error al guardar el producto');
      }
    }
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id);
      setSuccessMessage('Producto eliminado exitosamente');
      fetchProducts();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);
      setFormError('Error al eliminar el producto');
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const getDisplayImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.is_primary);
      return primary ? primary.url : product.images[0].url;
    }
    return product.image;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos Base del Catálogo</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las imágenes y detalles de tus productos</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto Base
        </button>
      </div>

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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Producto</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Imágenes</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Sabor</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoría</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mr-3 overflow-hidden">
                          {getDisplayImage(product) ? (
                            <img src={getDisplayImage(product)} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{product.name}</span>
                          {product.featured && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⭐ Destacado
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-500">
                        {product.images?.length || 0} imagen{product.images?.length !== 1 ? 'es' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{product.flavor?.name || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{product.category?.name || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-lg font-bold text-gray-900">${parseFloat(product.final_price || 0).toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-semibold ${(product.stock || 0) > 10 ? 'text-green-600' :
                        (product.stock || 0) > 0 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                        {product.stock || 0} unidades
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.available
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${product.available ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                        {product.available ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
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

          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos base</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo producto para el catálogo.</p>
            </div>
          )}
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Editar Producto Base' : 'Nuevo Producto Base'}
        size="lg"
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
              disabled={loadingOptions}
              className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {editingProduct ? 'Actualizar' : 'Crear'}
            </button>
          </>
        }
      >
        {loadingOptions ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Puedes agregar hasta 5 imágenes por producto. Marca una como principal.
              </p>
            </div>

            <MultipleImageUploader
              existingImages={editingProduct?.images || []}
              onImagesChange={handleImagesChange}
              maxImages={5}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre del producto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                placeholder="Ej: Pastel de Chocolate Premium"
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
                placeholder="Describe las características del producto..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                >
                  <option value="">Seleccionar</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sabor <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.flavor_id}
                  onChange={(e) => setFormData({ ...formData, flavor_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                >
                  <option value="">Seleccionar</option>
                  {flavors.map(flavor => (
                    <option key={flavor.id} value={flavor.id}>{flavor.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Precio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.final_price}
                    onChange={(e) => setFormData({ ...formData, final_price: e.target.value })}
                    required
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>
            </div>


          </form>
        )}
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        title="Eliminar Producto"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(false);
                setProductToDelete(null);
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
            ¿Seguro de eliminar este producto?
          </p>
          {productToDelete && (
            <p className="mt-2 text-sm text-gray-500 font-medium">
              {productToDelete.name}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AdminProducts;