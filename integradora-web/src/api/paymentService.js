import api from './axiosConfig';

const paymentService = {
  // Crear orden en PayPal
  createPayPalOrder: async (orderData) => {
    const response = await api.post('/paypal/create-order', orderData);
    return response.data;
  },

  // Capturar orden después de aprobación
  capturePayPalOrder: async (token) => {
    const response = await api.get(`/paypal/capture-order?token=${token}`);
    return response.data;
  }
};

export default paymentService;