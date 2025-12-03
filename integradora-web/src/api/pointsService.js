// client/src/api/pointsService.js
import api from './axiosConfig';

export const pointsService = {
  /**
   * Obtener balance de puntos del usuario
   */
  getBalance: async () => {
    const response = await api.get('/points/balance');
    return response.data;
  },

  /**
   * Obtener historial de transacciones
   */
  getHistory: async (page = 1, perPage = 20) => {
    const response = await api.get('/points/history', {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  /**
   * Calcular descuento por puntos
   */
  calculateDiscount: async (points, cartTotal) => {
    const response = await api.post('/points/calculate-discount', {
      points,
      cart_total: cartTotal
    });
    return response.data;
  },

  /**
   * Obtener información de cómo ganar puntos
   */
  getEarnInfo: async () => {
    const response = await api.get('/points/earn-info');
    return response.data;
  }
};

export default pointsService;