import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/common/Navbar';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loginWithGoogle } = useAuth();

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pt-24" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-w-6xl w-full flex flex-col lg:flex-row min-h-[600px]">

          {/* Left Side - Brand Panel */}
          <div className="w-full lg:w-1/2 bg-[#F3F0E7] flex flex-col justify-between p-12 relative">
            {/* Top Text */}
            <div>
              <h2 className="text-2xl font-medium text-black">Bienvenido!</h2>
            </div>

            {/* Center Brand */}
            <div className="flex items-baseline justify-center">
              <h1 className="text-8xl font-black text-black tracking-tighter">Gelato</h1>
              <img
                src="/choco-2.png"
                alt="."
                className="w-12 h-12 ml-1 object-contain translate-y-2"
              />
            </div>

            {/* Bottom Link */}
            <div>
              <p className="text-sm font-medium text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="font-bold text-black hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-12 py-12 lg:px-20 relative overflow-y-auto">
            <div className="max-w-md w-full mx-auto">
              <h2 className="text-4xl font-bold text-black mb-8">Registro</h2>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-red-800 uppercase">Error</p>
                    <p className="text-sm text-red-600 mt-1 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-base font-medium text-black">
                    Nombre completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full px-0 py-2 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors text-base text-black placeholder-gray-400"
                    placeholder="Juan Pérez"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-base font-medium text-black">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full px-0 py-2 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors text-base text-black placeholder-gray-400"
                    placeholder="ejemplo@hotmail.com"
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-1">
                  <label htmlFor="phone" className="block text-base font-medium text-black">
                    Teléfono <span className="text-gray-400 font-normal text-sm">(opcional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full px-0 py-2 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors text-base text-black placeholder-gray-400"
                    placeholder="(123) 456-7890"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-base font-medium text-black">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full px-0 py-2 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors text-base text-black placeholder-gray-400"
                    placeholder="Contraseña"
                  />
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1">
                  <label htmlFor="password_confirmation" className="block text-base font-medium text-black">
                    Confirmar contraseña
                  </label>
                  <input
                    id="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    className="block w-full px-0 py-2 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors text-base text-black placeholder-gray-400"
                    placeholder="Confirmar contraseña"
                  />
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start pt-2">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer mt-1"
                  />
                  <label htmlFor="terms" className="ml-3 block text-sm text-gray-600 cursor-pointer font-medium">
                    Acepto los{' '}
                    <Link to="/terms" className="font-bold text-black hover:underline">
                      Términos de Servicio
                    </Link>
                    {' '}y la{' '}
                    <Link to="/privacy" className="font-bold text-black hover:underline">
                      Política de Privacidad
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-black hover:bg-gray-900 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </form>

              {/* DIVIDER */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs font-medium text-gray-500">
                  <span className="px-4 bg-white">O continua con</span>
                </div>
              </div>

              {/* GOOGLE BUTTON */}
              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3.5 border border-gray-300 rounded-xl text-base font-bold text-black bg-white hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;