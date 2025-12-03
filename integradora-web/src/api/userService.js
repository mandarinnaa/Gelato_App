import api from './axiosConfig';

export const userService = {
  // Obtener todos los usuarios con paginación
  getUsers: async (page = 1, search = '') => {
    const params = { page };
    if (search) params.search = search;
    
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Obtener un usuario específico
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Crear nuevo usuario
  createUser: async (userData) => {
    const formData = new FormData();
    
    // Agregar campos básicos
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        // Si es un archivo (profile_photo)
        if (key === 'profile_photo' && userData[key] instanceof File) {
          formData.append(key, userData[key]);
        } else if (key !== 'profile_photo') {
          formData.append(key, userData[key]);
        }
      }
    });

    const response = await api.post('/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    const formData = new FormData();
    
    // Agregar _method para simular PUT en FormData
    formData.append('_method', 'PUT');
    
    // Agregar campos básicos
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        // Si es un archivo (profile_photo)
        if (key === 'profile_photo' && userData[key] instanceof File) {
          formData.append(key, userData[key]);
        } else if (key !== 'profile_photo') {
          formData.append(key, userData[key]);
        }
      }
    });

    const response = await api.post(`/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Actualizar solo la foto de perfil
  updateProfilePhoto: async (id, photoFile) => {
    const formData = new FormData();
    formData.append('profile_photo', photoFile);

    const response = await api.post(`/users/${id}/profile-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Eliminar foto de perfil
  deleteProfilePhoto: async (id) => {
    const response = await api.delete(`/users/${id}/profile-photo`);
    return response.data;
  },

  // Actualizar número de teléfono
  updatePhone: async (id, phone) => {
    const response = await api.patch(`/users/${id}/phone`, { phone });
    return response.data;
  },

  // Obtener roles disponibles
  getRoles: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  // Obtener membresías disponibles
  getMemberships: async () => {
    const response = await api.get('/memberships');
    return response.data;
  },
};