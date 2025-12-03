import api from './axiosConfig';

export const toppingService = {
  // Obtener todos los toppings
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/toppings?${params}`);
    return response.data;
  },

  // Obtener un topping por ID
  getById: async (id) => {
    const response = await api.get(`/toppings/${id}`);
    return response.data;
  },

  // Crear topping (admin)
  create: async (toppingData) => {
    const response = await api.post('/toppings', toppingData);
    return response.data;
  },

  // Actualizar topping (admin)
  update: async (id, toppingData) => {
    const response = await api.put(`/toppings/${id}`, toppingData);
    return response.data;
  },

  // Eliminar topping (admin)
  delete: async (id) => {
    const response = await api.delete(`/toppings/${id}`);
    return response.data;
  },
};