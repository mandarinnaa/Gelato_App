import api from './axiosConfig';

/**
 * Servicio para manejar las operaciones CRUD de sabores (flavors)
 */
const flavorService = {
  /**
   * Obtener todos los sabores
   */
  getAllFlavors: async () => {
    try {
      const response = await api.get('/flavors');
      return response.data;
    } catch (error) {
      console.error('Error fetching flavors:', error);
      throw error;
    }
  },

  /**
   * Obtener un sabor por ID
   */
  getFlavorById: async (id) => {
    try {
      const response = await api.get(`/flavors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching flavor ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo sabor
   */
  createFlavor: async (flavorData) => {
    try {
      const response = await api.post('/flavors', flavorData);
      return response.data;
    } catch (error) {
      console.error('Error creating flavor:', error);
      throw error;
    }
  },

  /**
   * Actualizar un sabor existente
   */
  updateFlavor: async (id, flavorData) => {
    try {
      const response = await api.put(`/flavors/${id}`, flavorData);
      return response.data;
    } catch (error) {
      console.error(`Error updating flavor ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un sabor
   */
  deleteFlavor: async (id) => {
    try {
      const response = await api.delete(`/flavors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting flavor ${id}:`, error);
      throw error;
    }
  },
};

export default flavorService;