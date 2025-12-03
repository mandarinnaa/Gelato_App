import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
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

  return (
    <footer className="mt-auto bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div>
            <div className="mb-4">
              <span
                className="text-4xl tracking-tighter"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  color: 'black'
                }}
              >
                Gelato
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                color: '#6b7280'
              }}
            >
              Los mejores pasteles artesanales hechos con ingredientes de la más alta calidad.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/SerenoCaf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
              >
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/serenocafeteria?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
              >
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="mb-4 text-sm uppercase tracking-wider"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                color: 'black',
                letterSpacing: '0.1em'
              }}
            >
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/shop"
                  className="text-sm transition-colors duration-300 hover:text-gray-900"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    color: '#6b7280'
                  }}
                >
                  Tienda
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm transition-colors duration-300 hover:text-gray-900"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    color: '#6b7280'
                  }}
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm transition-colors duration-300 hover:text-gray-900"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    color: '#6b7280'
                  }}
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3
              className="mb-4 text-sm uppercase tracking-wider"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                color: 'black',
                letterSpacing: '0.1em'
              }}
            >
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p
                    className="text-xs mb-0.5"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      color: '#9ca3af'
                    }}
                  >
                    EMAIL
                  </p>
                  <a
                    href="mailto:gelatopasteleria@gmail.com"
                    className="text-sm transition-colors duration-300 hover:text-gray-900"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      color: 'black'
                    }}
                  >
                    gelatopasteleria@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p
                    className="text-xs mb-0.5"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      color: '#9ca3af'
                    }}
                  >
                    TELÉFONO
                  </p>
                  <a
                    href="tel:+527841353775"
                    className="text-sm transition-colors duration-300 hover:text-gray-900"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      color: 'black'
                    }}
                  >
                    (784) 135-3775
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p
                    className="text-xs mb-0.5"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      color: '#9ca3af'
                    }}
                  >
                    DIRECCIÓN
                  </p>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      color: 'black'
                    }}
                  >
                    Papantla, Veracruz
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3
              className="mb-4 text-sm uppercase tracking-wider"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                color: 'black',
                letterSpacing: '0.1em'
              }}
            >
              Horario
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    color: '#6b7280'
                  }}
                >
                  Lun - Sáb
                </span>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    color: 'black'
                  }}
                >
                  8:00 - 20:00
                </span>
              </li>
              <li className="flex justify-between">
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    color: '#6b7280'
                  }}
                >
                  Domingo
                </span>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    color: 'black'
                  }}
                >
                  Cerrado
                </span>
              </li>
            </ul>
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
              <p
                className="text-xs mb-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  color: '#6b7280'
                }}
              >
                ENTREGAS A DOMICILIO
              </p>
              <p
                className="text-sm"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  color: 'black'
                }}
              >
                Disponible en toda la ciudad
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              className="text-xs"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                color: '#6b7280'
              }}
            >
              © 2025 GELATO. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-xs">
              <Link
                to="/privacy"
                className="transition-colors duration-300 hover:text-gray-900"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  color: '#6b7280'
                }}
              >
                Privacidad
              </Link>
              <Link
                to="/terms"
                className="transition-colors duration-300 hover:text-gray-900"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  color: '#6b7280'
                }}
              >
                Términos
              </Link>
              <Link
                to="/cookies"
                className="transition-colors duration-300 hover:text-gray-900"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  color: '#6b7280'
                }}
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;