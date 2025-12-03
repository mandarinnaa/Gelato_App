import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { openLogin } = useModal();

  useEffect(() => {
    // Si no está autenticado, solo abrir modal (no redirigir)
    if (!isAuthenticated) {
      openLogin();
    }
  }, [isAuthenticated, openLogin]);

  // Si no está autenticado, redirigir a home con Navigate (sin reload)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Determinar si tiene el rol correcto
  const userRole = user?.role?.name;
  const hasRoleAccess = allowedRoles.length === 0 || (userRole && allowedRoles.includes(userRole));

  // Si está autenticado pero no tiene el rol correcto, redirigir con reload
  if (!hasRoleAccess) {
    window.location.href = '/';
    return null;
  }

  return children;
};

export default PrivateRoute;