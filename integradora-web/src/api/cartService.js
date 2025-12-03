// src/api/cartService.js
import api from './axiosConfig';

export const cartService = {
  /**
   * Obtener el carrito del usuario
   */
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  /**
   * Agregar producto BASE al carrito
   */
  addBaseProduct: async (data) => {
    const response = await api.post('/cart/base-product', data);
    return response.data;
  },

  /**
   * Agregar producto PERSONALIZADO al carrito
   */
  addCustomProduct: async (data) => {
    const response = await api.post('/cart/custom-product', data);
    return response.data;
  },

  /**
   * Actualizar cantidad de un item
   * ✅ CORREGIDO: Usar paréntesis () en lugar de backticks `` incorrectos
   */
  updateQuantity: async (itemId, quantity) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  /**
   * Eliminar item del carrito
   * ✅ CORREGIDO: Usar paréntesis () en lugar de backticks `` incorrectos
   */
  removeItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  /**
   * Vaciar carrito
   */
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },

  /**
   * ✅ Procesar compra (checkout) con datos de PayPal
   */
  checkout: async (data) => {
    const response = await api.post('/cart/checkout', data);
    return response.data;
  },

  // ===== MÉTODOS LEGACY (mantener por compatibilidad) =====
  
  /**
   * @deprecated Usar addBaseProduct o addCustomProduct
   */
  addItem: async (data) => {
    const response = await api.post('/cart/add', data);
    return response.data;
  },

  /**
   * Sincronizar carrito desde localStorage
   */
  syncCart: async (items) => {
    const response = await api.post('/cart/sync', { items });
    return response.data;
  },
};

export default cartService;