import axios from 'axios';
import { toastManager } from '../utils/toastManager';

// Leer URL desde variables de entorno
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Mostrar en consola para verificar
console.log('API conectada a:', BASE_URL);

// Crear instancia de axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // ✅ 30 segundos (aumentado desde 10 segundos)
  headers: {
    'Accept': 'application/json',
    // NO establecer 'Content-Type' aquí - se configurará dinámicamente
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // 🔍 DEBUGGING: Mostrar info del request
    console.log('📤 REQUEST:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
      timeout: config.timeout // ✅ Mostrar timeout configurado
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CRÍTICO: Solo establecer Content-Type si NO es FormData
    // FormData establece automáticamente el Content-Type correcto con el boundary
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    // Si ES FormData, no tocar el Content-Type para que axios lo maneje automáticamente

    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores globales
api.interceptors.response.use(
  (response) => {
    // 🔍 DEBUGGING: Mostrar info de la respuesta
    console.log('📥 RESPONSE:', {
      url: response.config.url,
      status: response.status,
      hasMembershipInfo: !!response.data?.membership_info,
      membershipInfo: response.data?.membership_info,
      dataCount: Array.isArray(response.data?.data) ? response.data.data.length : 'N/A'
    });

    // Log especial para productos
    if (response.config.url?.includes('base-products') && Array.isArray(response.data?.data)) {
      const firstProduct = response.data.data[0];
      if (firstProduct) {
        console.log('🎂 PRIMER PRODUCTO:', {
          name: firstProduct.name,
          original_price: firstProduct.original_price,
          final_price: firstProduct.final_price,
          discount_applied: firstProduct.discount_applied,
          has_discount: firstProduct.has_discount
        });
      }
    }

    return response;
  },
  (error) => {
    // ✅ Manejo especial para timeout
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ TIMEOUT: La solicitud tardó demasiado (>30s)');
      toastManager.error('La solicitud tardó demasiado tiempo. Por favor intenta nuevamente.');
      return Promise.reject(error);
    }

    if (error.response) {
      // 🔍 DEBUGGING: Mostrar error detallado
      console.error('❌ RESPONSE ERROR:', {
        url: error.config?.url,
        status: error.response.status,
        message: error.response.data?.message,
        errors: error.response.data?.errors
      });

      switch (error.response.status) {
        case 401:
          console.error('🔒 No autorizado - Token inválido');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // No redirigir forzosamente, dejar que la UI maneje el estado de no autenticado
          break;

        case 403:
          console.error('⛔ Acceso prohibido - Sin permisos');
          toastManager.error('No tienes permisos para realizar esta acción');
          break;

        case 404:
          console.error('🔍 Recurso no encontrado');
          break;

        case 422:
          console.error('⚠️ Error de validación:', error.response.data.errors);
          break;

        case 500:
          console.error('💥 Error interno del servidor');
          toastManager.error('Error del servidor. Por favor intenta más tarde.');
          break;

        default:
          console.error('❓ Error:', error.response.status);
      }
    } else if (error.request) {
      console.error('🌐 No hay respuesta del servidor');
      toastManager.error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      console.error('⚠️ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };