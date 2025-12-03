// client/src/api/membershipService.js
import api from './axiosConfig';

export const membershipService = {
  // Obtener todas las membresías disponibles
  getAll: async () => {
    const response = await api.get('/memberships');
    return response.data;
  },

  // Obtener una membresía específica
  getById: async (id) => {
    const response = await api.get(`/memberships/${id}`);
    return response.data;
  },

  // ✅ NUEVO: Crear orden de PayPal para membresía
  createPayPalOrder: async (membershipId) => {
    const response = await api.post(`/memberships/${membershipId}/create-paypal-order`);
    return response.data;
  },

  // Actualizar membresía (después de confirmar pago)
  upgrade: async (membershipId) => {
    const response = await api.post(`/memberships/${membershipId}/upgrade`);
    return response.data;
  },

  // ✅ NUEVO: Obtener membresía actual del usuario
  getCurrentMembership: async () => {
    const response = await api.get('/membership/current');
    return response.data;
  },

  // ✅ NUEVO: Cancelar membresía
  cancelMembership: async () => {
    const response = await api.post('/membership/cancel');
    return response.data;
  },

  // ✅ NUEVO: Reactivar membresía
  reactivateMembership: async () => {
    const response = await api.post('/membership/reactivate');
    return response.data;
  },

  // Crear membresía (admin)
  create: async (membershipData) => {
    const response = await api.post('/memberships', membershipData);
    return response.data;
  },

  // Actualizar membresía (admin)
  update: async (id, membershipData) => {
    const response = await api.put(`/memberships/${id}`, membershipData);
    return response.data;
  },

  // Eliminar membresía (admin)
  delete: async (id) => {
    const response = await api.delete(`/memberships/${id}`);
    return response.data;
  },
};