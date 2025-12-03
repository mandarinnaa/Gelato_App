// src/api/reviewService.js
import api from './axiosConfig';

export const reviewService = {
  // Obtener todas las reseñas de un producto
  getReviews: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },

  // Obtener estadísticas de rating
  getStats: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews/stats`);
    return response.data;
  },

  // Verificar si el usuario puede dejar reseña
  canReview: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews/can-review`);
    return response.data;
  },

  // Obtener la reseña del usuario actual
  getMyReview: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews/my-review`);
    return response.data;
  },

  // Crear una reseña
  createReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  // Actualizar una reseña
  updateReview: async (productId, reviewId, reviewData) => {
    const response = await api.put(`/products/${productId}/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Eliminar una reseña
  deleteReview: async (productId, reviewId) => {
    const response = await api.delete(`/products/${productId}/reviews/${reviewId}`);
    return response.data;
  },
};