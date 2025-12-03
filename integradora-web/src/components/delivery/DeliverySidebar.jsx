import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutDashboard, Package, History, LogOut } from 'lucide-react';

const DeliverySidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const deliveryLinks = [
    {
      path: '/delivery/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      path: '/delivery/orders',
      label: 'Mis Pedidos',
      icon: <Package className="w-5 h-5" />
    },
    {
      path: '/delivery/history',
      label: 'Historial',
      icon: <History className="w-5 h-5" />
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className={`${isOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 shadow-sm transition-all duration-300 z-50`}
    >
      {/* Header del Sidebar */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between h-20">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center w-full'}`}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m-4 0v1a1 1 0 001 1h2m8-2a2 2 0 104 0m-4 0a2 2 0 114 0m-4 0v1a1 1 0 001 1h2" />
            </svg>
          </div>
          {isOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h2 className="text-sm font-bold text-gray-900">Panel Repartidor</h2>
              <p className="text-xs text-gray-500">Gestión de entregas</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button - Absolute positioned to sit on the border */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-24 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-50 text-gray-500 hover:text-emerald-600 transition-colors z-50"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden mt-6">
        {deliveryLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`w-full flex items-center ${isOpen ? 'px-4' : 'justify-center px-2'
              } py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${isActive(link.path)
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            <span className={`${isActive(link.path) ? 'text-white' : 'text-gray-400 group-hover:text-emerald-600'} flex-shrink-0`}>
              {link.icon}
            </span>

            {isOpen && (
              <span className="ml-3 whitespace-nowrap overflow-hidden transition-all duration-300">
                {link.label}
              </span>
            )}

            {isActive(link.path) && isOpen && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}

            {/* Tooltip for collapsed state */}
            {!isOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {link.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Footer del Sidebar */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={() => navigate('/')}
          className={`w-full flex items-center ${isOpen ? 'px-4 gap-3' : 'justify-center'
            } py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group relative`}
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
          {isOpen && <span>Ir al inicio</span>}

          {!isOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
              Ir al inicio
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default DeliverySidebar;