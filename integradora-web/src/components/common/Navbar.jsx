import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useModal } from '../../context/ModalContext';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import ForgotPasswordModal from '../auth/ForgotPasswordModal';
import ResetPasswordModal from '../auth/ResetPasswordModal';
import LogoutModal from './LogoutModal';
import { getProfilePhotoUrl } from '../../utils/imageUtils';

const Navbar = ({ onCartClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, fetchCart } = useCart();
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ✅ Use Context instead of local state
  const { activeModal, modalProps, openLogin, openRegister, openForgotPassword, openResetPassword, closeModal } = useModal();

  // Cargar carrito al montar (solo si está autenticado)
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  // Cargar fuentes
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setActiveDropdown(null);
  };

  const handleConfirmLogout = async () => {
    await logout();
    navigate('/');
  };

  // Helper to construct profile photo URL
  // ✅ Usando helper centralizado
  const profilePhotoUrl = getProfilePhotoUrl(user?.profile_photo_url);

  // Styles
  const fontMontserrat = { fontFamily: "'Montserrat', sans-serif" };
  const logoStyle = { ...fontMontserrat, fontWeight: 900, color: 'black' }; // Black weight
  const menuStyle = { ...fontMontserrat, fontWeight: 700, color: '#333' }; // Bold

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* LEFT: LOGO */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="text-4xl tracking-tighter hover:opacity-80 transition-opacity"
                style={logoStyle}
              >
                Gelato
              </Link>
            </div>

            {/* RIGHT: NAVIGATION */}
            <div className="hidden md:flex items-center space-x-8">

              {/* PRODUCTOS DROPDOWN */}
              <div
                className="relative group"
                onMouseEnter={() => setActiveDropdown('productos')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className="flex items-center space-x-1 text-sm uppercase tracking-wide hover:text-black transition-colors py-2"
                  style={menuStyle}
                >
                  <span>PRODUCTOS</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'productos' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                <div className={`absolute left-0 mt-0 w-56 bg-white rounded-md shadow-lg py-2 transition-all duration-200 origin-top-left ${activeDropdown === 'productos' ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                  <Link
                    to="/shop"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    style={{ ...fontMontserrat, fontWeight: 500 }}
                  >
                    PASTELES
                  </Link>
                  <Link
                    to="/custom-cake"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    style={{ ...fontMontserrat, fontWeight: 500 }}
                  >
                    PASTELES PERSONALIZADOS
                  </Link>
                </div>
              </div>

              {/* NOSOTROS DROPDOWN */}
              <div
                className="relative group"
                onMouseEnter={() => setActiveDropdown('nosotros')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className="flex items-center space-x-1 text-sm uppercase tracking-wide hover:text-black transition-colors py-2"
                  style={menuStyle}
                >
                  <span>NOSOTROS</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'nosotros' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                <div className={`absolute left-0 mt-0 w-56 bg-white rounded-md shadow-lg py-2 transition-all duration-200 origin-top-left ${activeDropdown === 'nosotros' ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                  <Link
                    to="/about"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    style={{ ...fontMontserrat, fontWeight: 500 }}
                  >
                    SOBRE NOSOTROS
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    style={{ ...fontMontserrat, fontWeight: 500 }}
                  >
                    CONTACTANOS
                  </Link>
                </div>
              </div>

              {/* MEMBRESÍAS DROPDOWN */}
              {isAuthenticated ? (
                <div
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown('membresias')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className="flex items-center space-x-1 text-sm uppercase tracking-wide hover:text-black transition-colors py-2"
                    style={menuStyle}
                  >
                    <span>MEMBRESÍAS</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'membresias' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  <div className={`absolute left-0 mt-0 w-56 bg-white rounded-md shadow-lg py-2 transition-all duration-200 origin-top-left ${activeDropdown === 'membresias' ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                    <Link
                      to="/memberships"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                      style={{ ...fontMontserrat, fontWeight: 500 }}
                    >
                      MEMBRESÍAS
                    </Link>
                    <Link
                      to="/my-membership"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                      style={{ ...fontMontserrat, fontWeight: 500 }}
                    >
                      MI MEMBRESÍA
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  to="/memberships"
                  className="text-sm uppercase tracking-wide hover:text-black transition-colors"
                  style={menuStyle}
                >
                  MEMBRESÍAS
                </Link>
              )}

              {/* AUTH SECTION */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-6">
                  {/* CART */}
                  {(user?.role?.name === 'cliente' || user?.role?.name === 'admin' || user?.role?.name === 'superadmin') && (
                    <button
                      onClick={onCartClick}
                      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* USER DROPDOWN */}
                  <div
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown('user')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                        {profilePhotoUrl ? (
                          <img src={profilePhotoUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </button>

                    <div className={`absolute right-0 mt-0 w-48 bg-white rounded-md shadow-lg py-2 transition-all duration-200 origin-top-right ${activeDropdown === 'user' ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate" style={fontMontserrat}>{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate" style={fontMontserrat}>{user?.email}</p>
                      </div>

                      {user?.role?.name === 'superadmin' && (
                        <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" style={fontMontserrat}>Dashboard</Link>
                      )}
                      {user?.role?.name === 'repartidor' && (
                        <Link to="/delivery/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" style={fontMontserrat}>Dashboard</Link>
                      )}
                      {user?.role?.name === 'admin' && (
                        <Link to="/admin/pos-sales" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" style={fontMontserrat}>Punto de Venta</Link>
                      )}
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" style={fontMontserrat}>Mi Perfil</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" style={fontMontserrat}>Mis Pedidos</Link>

                      <button
                        onClick={handleLogoutClick}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        style={fontMontserrat}
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-6">
                  <button
                    onClick={openLogin} // ✅ Use Context
                    className="text-sm uppercase tracking-wide hover:text-black transition-colors"
                    style={menuStyle}
                  >
                    LOGIN
                  </button>
                  <button
                    onClick={openRegister} // ✅ Use Context
                    className="px-6 py-2.5 bg-black text-white text-sm font-bold uppercase tracking-wide rounded-full hover:bg-gray-800 transition-all transform hover:scale-105 shadow-md"
                    style={fontMontserrat}
                  >
                    REGISTRARSE
                  </button>
                </div>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden flex items-center">
              {/* CART MOBILE */}
              {isAuthenticated && (user?.role?.name === 'cliente' || user?.role?.name === 'admin' || user?.role?.name === 'superadmin') && (
                <button
                  onClick={onCartClick}
                  className="relative p-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'mobile' ? null : 'mobile')}
                className="p-2 rounded-md text-gray-800 hover:bg-gray-100 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activeDropdown === 'mobile' ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {activeDropdown === 'mobile' && (
          <div className="md:hidden bg-white border-t border-gray-100 max-h-[calc(100vh-80px)] overflow-y-auto shadow-xl">
            <div className="px-4 pt-2 pb-6 space-y-1">
              <div className="py-2 border-b border-gray-100">
                <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider" style={fontMontserrat}>PRODUCTOS</p>
                <Link to="/shop" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" style={fontMontserrat} onClick={() => setActiveDropdown(null)}>Pasteles</Link>
                <Link to="/custom-cake" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" style={fontMontserrat} onClick={() => setActiveDropdown(null)}>Pasteles Personalizados</Link>
              </div>

              <div className="py-2 border-b border-gray-100">
                <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider" style={fontMontserrat}>NOSOTROS</p>
                <Link to="/about" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" style={fontMontserrat} onClick={() => setActiveDropdown(null)}>Sobre Nosotros</Link>
                <Link to="/contact" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" style={fontMontserrat} onClick={() => setActiveDropdown(null)}>Contactanos</Link>
              </div>

              {/* MEMBRESÍAS */}
              <div className="py-2 border-b border-gray-100">
                <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider" style={fontMontserrat}>MEMBRESÍAS</p>
                <Link to="/memberships" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" style={fontMontserrat} onClick={() => setActiveDropdown(null)}>Membresías</Link>
                {isAuthenticated && (
                  <Link to="/my-membership" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" style={fontMontserrat} onClick={() => setActiveDropdown(null)}>Mi Membresía</Link>
                )}
              </div>

              {!isAuthenticated ? (
                <div className="pt-4 pb-2 flex flex-col space-y-3 px-3">
                  <button
                    onClick={() => { openLogin(); setActiveDropdown(null); }} // ✅ Use Context
                    className="w-full text-center py-3 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                    style={fontMontserrat}
                  >
                    LOGIN
                  </button>
                  <button
                    onClick={() => { openRegister(); setActiveDropdown(null); }} // ✅ Use Context
                    className="w-full text-center py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
                    style={fontMontserrat}
                  >
                    REGISTRARSE
                  </button>
                </div>
              ) : (
                <div className="py-2">
                  <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider" style={fontMontserrat}>MI CUENTA</p>
                  {user?.role?.name === 'superadmin' && (
                    <Link to="/admin/dashboard" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" style={fontMontserrat} onClick={() => setActiveDropdown(null)}>Dashboard</Link>
                  )}
                  {user?.role?.name === 'repartidor' && (
                    <Link to="/delivery/dashboard" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" style={fontMontserrat} onClick={() => setActiveDropdown(null)}>Dashboard</Link>
                  )}
                  {user?.role?.name === 'admin' && (
                    <Link to="/admin/pos-sales" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" style={fontMontserrat} onClick={() => setActiveDropdown(null)}>Punto de Venta</Link>
                  )}
                  <Link to="/profile" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" style={fontMontserrat} onClick={() => setActiveDropdown(null)}>Mi Perfil</Link>
                  <Link to="/orders" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md" style={fontMontserrat} onClick={() => setActiveDropdown(null)}>Mis Pedidos</Link>
                  <button
                    onClick={handleLogoutClick}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                    style={fontMontserrat}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* MODALS - Controlled by Context */}
      <LoginModal
        isOpen={activeModal === 'login'}
        onClose={closeModal}
        onSwitchToRegister={openRegister}
        onSwitchToForgotPassword={openForgotPassword}
      />
      <RegisterModal
        isOpen={activeModal === 'register'}
        onClose={closeModal}
        onSwitchToLogin={openLogin}
      />
      <ForgotPasswordModal
        isOpen={activeModal === 'forgot-password'}
        onClose={closeModal}
        onSwitchToLogin={openLogin}
      />
      <ResetPasswordModal
        isOpen={activeModal === 'reset-password'}
        onClose={closeModal}
        onSwitchToLogin={openLogin}
        {...modalProps}
      />
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default Navbar;