import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Determinar si es superadmin
  const isSuperAdmin = user?.role?.name === 'superadmin' || user?.role_id === 1;

  const adminLinks = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      roles: ['superadmin']
    },
    {
      path: '/admin/users',
      label: 'Usuarios',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      roles: ['superadmin']
    },
    {
      path: '/admin/products',
      label: 'Productos Base',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      roles: ['superadmin']
    },
    {
      path: '/admin/flavors',
      label: 'Sabores',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      roles: ['superadmin']
    },
    {
      path: '/admin/fillings',
      label: 'Rellenos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      roles: ['superadmin']
    },
    {
      path: '/admin/toppings',
      label: 'Toppings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      roles: ['superadmin']
    },
    {
      path: '/admin/orders',
      label: 'Pedidos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      roles: ['superadmin']
    },
    {
      path: '/admin/sales',
      label: 'Ventas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      roles: ['superadmin']
    },
    {
      path: '/admin/pos-sales',
      label: 'Punto de Venta',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      roles: ['superadmin', 'admin']
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Filtrar enlaces según rol
  const filteredLinks = adminLinks.filter(link => {
    if (isSuperAdmin) return true;
    return link.roles.includes('admin');
  });

  return (
    <div
      className={`bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 shadow-sm transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'
        }`}
    >
      {/* Header del Sidebar */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center w-full'}`}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          {isOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h2 className="text-sm font-bold text-gray-900">Panel Admin</h2>
              <p className="text-xs text-gray-500">Gestión del sistema</p>
            </div>
          )}
        </div>

        {/* Botón de colapsar (solo visible si está abierto, o siempre visible pero ajustado) */}
        {isOpen && (
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Botón de expandir si está cerrado */}
      {!isOpen && (
        <div className="flex justify-center py-2 border-b border-gray-100">
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {filteredLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.path)
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              } ${!isOpen ? 'justify-center' : ''}`}
            title={!isOpen ? link.label : ''}
          >
            <span className={`${isActive(link.path) ? 'text-white' : 'text-gray-400'} flex-shrink-0`}>
              {link.icon}
            </span>

            {isOpen && (
              <>
                <span className="whitespace-nowrap">{link.label}</span>
                {isActive(link.path) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Footer del Sidebar */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => navigate('/')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 ${!isOpen ? 'justify-center' : ''}`}
          title={!isOpen ? "Ir al inicio" : ""}
        >
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {isOpen && <span>Ir al inicio</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;