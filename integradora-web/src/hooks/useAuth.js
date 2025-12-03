import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, logout as logoutAction } from '../redux/slices/authSlice';
import { authService } from '../api/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      dispatch(setCredentials(data.data));

      const userRole = data.data.user.role.name;

      if (userRole === 'superadmin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin/pos-sales');
      } else if (userRole === 'repartidor' || userRole === 'Repartidor') {
        navigate('/delivery/dashboard');
      } else {
        navigate('/shop');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  // ✅ NUEVO: Login con Google
  const loginWithGoogle = async () => {
    try {
      const data = await authService.loginWithGoogle();
      dispatch(setCredentials(data.data));

      const userRole = data.data.user.role.name;

      if (userRole === 'superadmin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin/pos-sales');
      } else if (userRole === 'repartidor' || userRole === 'Repartidor') {
        navigate('/delivery/dashboard');
      } else {
        navigate('/shop');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      dispatch(setCredentials(data.data));
      navigate('/shop');
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch(logoutAction());
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // ✅ NUEVO: Refrescar datos del usuario
  const refreshUser = async () => {
    try {
      const data = await authService.me();
      if (data.success && data.data.user) {
        // Mantenemos el token actual, solo actualizamos el usuario
        const currentToken = localStorage.getItem('token');
        dispatch(setCredentials({
          user: data.data.user,
          token: currentToken
        }));
        return data.data.user;
      }
    } catch (error) {
      console.error('Error refrescando usuario:', error);
    }
    return null;
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshUser,
  };
};