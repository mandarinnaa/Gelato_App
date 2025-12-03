import api from './axiosConfig';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

export const authService = {
  // Registro de usuario
  register: async (userData) => {
    const response = await api.post('/register', userData);
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      console.log('✅ Registro exitoso:', {
        hasToken: true,
        hasUser: true,
        hasMembership: !!response.data.data.user.membership
      });
    }
    
    return response.data;
  },

  // Inicio de sesión
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      console.log('✅ Login exitoso:', {
        hasToken: true,
        user: response.data.data.user.email,
        role: response.data.data.user.role?.name,
        hasMembership: !!response.data.data.user.membership,
        membership: response.data.data.user.membership ? {
          name: response.data.data.user.membership.name,
          discount: response.data.data.user.membership.discount_percent
        } : null
      });
    }
    
    return response.data;
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('👋 Sesión cerrada');
    }
  },

  // Obtener usuario actual
  me: async () => {
    const response = await api.get('/me');
    
    // Actualizar localStorage con los datos más recientes
    if (response.data.success && response.data.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      console.log('👤 Usuario actualizado:', {
        email: response.data.data.user.email,
        hasMembership: !!response.data.data.user.membership,
        membership: response.data.data.user.membership
      });
    }
    
    return response.data;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener usuario del localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

   loginWithGoogle: async () => {
    try {
      // 1. Autenticar con Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // 2. Obtener el ID token de Firebase
      const idToken = await user.getIdToken();
      
      console.log('🔥 Firebase login exitoso:', {
        email: user.email,
        name: user.displayName,
        photo: user.photoURL
      });
      
      // 3. Enviar token a Laravel para validar y crear/obtener usuario
      const response = await api.post('/auth/google', {
        id_token: idToken,
        email: user.email,
        name: user.displayName,
        profile_photo: user.photoURL
      });
      
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        console.log('✅ Login con Google exitoso:', {
          hasToken: true,
          user: response.data.data.user.email,
          role: response.data.data.user.role?.name,
          hasMembership: !!response.data.data.user.membership
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error en login con Google:', error);
      throw error;
    }
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener usuario del localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};