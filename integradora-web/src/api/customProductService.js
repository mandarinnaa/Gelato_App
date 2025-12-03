import api from './axiosConfig';

export const customProductService = {
  /**
   * Obtener todas las opciones para personalización
   */
  getCustomizationOptions: async () => {
    const [flavorsRes, sizesRes, fillingsRes, toppingsRes] = await Promise.all([
      api.get('/catalog/flavors'),
      api.get('/catalog/sizes'),
      api.get('/catalog/fillings'),
      api.get('/catalog/toppings'),
    ]);

    return {
      flavors: flavorsRes.data.data || flavorsRes.data || [],
      sizes: sizesRes.data.data || sizesRes.data || [],
      fillings: fillingsRes.data.data || fillingsRes.data || [],
      toppings: toppingsRes.data.data || toppingsRes.data || [],
    };
  },

  /**
   * Calcular precio del producto personalizado
   */
  calculatePrice: async (customData) => {
    const response = await api.post('/custom-products/calculate-price', customData);
    return response.data;
  },

  /**
   * Crear producto personalizado
   */
  create: async (customData) => {
    const response = await api.post('/custom-products', customData);
    return response.data;
  },

  /**
   * Obtener productos personalizados del usuario
   */
  getMyCustomProducts: async () => {
    const response = await api.get('/custom-products');
    return response.data;
  },

  /**
   * Eliminar producto personalizado
   */
  delete: async (id) => {
    const response = await api.delete(`/custom-products/${id}`);
    return response.data;
  },
};