import api from './axiosConfig';

export const productService = {
  // ==================== PRODUCTOS BASE ====================

  // Obtener todos los productos base
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    // Usar endpoint autenticado si hay token (para descuentos), sino usar público
    const token = localStorage.getItem('token');
    const endpoint = token ? `/base-products?${params}` : `/base-products-public?${params}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  // Obtener un producto base por ID
  getById: async (id) => {
    // Usar endpoint autenticado si hay token (para descuentos), sino usar público
    const token = localStorage.getItem('token');
    const endpoint = token ? `/base-products/${id}` : `/base-products-public/${id}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  // Crear producto base (admin)
  create: async (productData) => {
    const response = await api.post('/base-products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Actualizar producto base (admin)
  update: async (id, productData) => {
    // Si productData es FormData, usar POST con _method
    if (productData instanceof FormData) {
      if (!productData.has('_method')) {
        productData.append('_method', 'PUT');
      }
      const response = await api.post(`/base-products/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Si no es FormData, usar PUT normal
      const response = await api.put(`/base-products/${id}`, productData);
      return response.data;
    }
  },

  // Eliminar producto base (admin)
  delete: async (id) => {
    const response = await api.delete(`/base-products/${id}`);
    return response.data;
  },

  // ==================== PRODUCTOS PERSONALIZADOS ====================

  // Obtener productos personalizados del usuario
  getCustomProducts: async () => {
    const response = await api.get('/custom-products');
    return response.data;
  },

  // Crear producto personalizado
  createCustomProduct: async (customData) => {
    const response = await api.post('/custom-products', customData);
    return response.data;
  },

  // Calcular precio de producto personalizado
  calculateCustomPrice: async (customData) => {
    const response = await api.post('/custom-products/calculate-price', customData);
    return response.data;
  },

  // Eliminar producto personalizado
  deleteCustomProduct: async (id) => {
    const response = await api.delete(`/custom-products/${id}`);
    return response.data;
  },
};