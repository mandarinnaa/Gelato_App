import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ links }) => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="px-6 py-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-xs text-gray-500 mt-1">Gestión del sistema</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {links.map((link, index) => {
            const isActive = location.pathname === link.path;
            
            return (
              <li key={index}>
                <Link
                  to={link.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-semibold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
            <p className="text-xs text-gray-500 truncate">admin@sistema.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;