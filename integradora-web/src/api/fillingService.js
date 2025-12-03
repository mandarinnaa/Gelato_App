import api from './axiosConfig';

export const fillingService = {
  // Obtener todos los rellenos
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/fillings?${params}`);
    return response.data;
  },

  // Obtener un relleno por ID
  getById: async (id) => {
    const response = await api.get(`/fillings/${id}`);
    return response.data;
  },

  // Crear relleno (admin)
  create: async (fillingData) => {
    const response = await api.post('/fillings', fillingData);
    return response.data;
  },

  // Actualizar relleno (admin)
  update: async (id, fillingData) => {
    const response = await api.put(`/fillings/${id}`, fillingData);
    return response.data;
  },

  // Eliminar relleno (admin)
  delete: async (id) => {
    const response = await api.delete(`/fillings/${id}`);
    return response.data;
  },
};