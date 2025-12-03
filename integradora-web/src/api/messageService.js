import api from './axiosConfig';

export const messageService = {
  // Get all messages for an order
  getMessages: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/messages`);
    return response.data;
  },

  // Send a message
  sendMessage: async (orderId, content) => {
    const response = await api.post(`/orders/${orderId}/messages`, { content });
    return response.data;
  },
};
