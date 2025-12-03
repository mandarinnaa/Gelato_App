import api from './axiosConfig';

export const deliveryStatusService = {
  // Obtener todos los estados de entrega
  getAll: async () => {
    const response = await api.get('/delivery-statuses');
    return response.data;
  },

  // Obtener un estado de entrega por ID
  getById: async (id) => {
    const response = await api.get(`/delivery-statuses/${id}`);
    return response.data;
  },

  // Crear nuevo estado de entrega (solo admin)
  create: async (statusData) => {
    const response = await api.post('/delivery-statuses', statusData);
    return response.data;
  },

  // Actualizar estado de entrega (solo admin)
  update: async (id, statusData) => {
    const response = await api.put(`/delivery-statuses/${id}`, statusData);
    return response.data;
  },

  // Eliminar estado de entrega (solo admin)
  delete: async (id) => {
    const response = await api.delete(`/delivery-statuses/${id}`);
    return response.data;
  },
};

export default deliveryStatusService;