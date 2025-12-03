import api from './axiosConfig';

export const orderService = {
  // Obtener todos los pedidos
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/orders?${params}`);
    return response.data;
  },

  // Obtener un pedido por ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Crear pedido
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Actualizar pedido
  update: async (id, orderData) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  // Actualizar estado del pedido
  updateStatus: async (id, statusData) => {
    const response = await api.post(`/orders/${id}/update-status`, statusData);
    return response.data;
  },

  // Asignar repartidor
  assignDelivery: async (id, deliveryData) => {
    const response = await api.post(`/orders/${id}/assign-delivery`, deliveryData);
    return response.data;
  },

  // Rastrear pedido
  tracking: async (id) => {
    const response = await api.get(`/orders/${id}/tracking`);
    return response.data;
  },

  // Eliminar pedido
  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};