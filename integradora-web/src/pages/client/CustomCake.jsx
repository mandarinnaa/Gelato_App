import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomProductBuilder from '../../components/client/CustomProductBuilder';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth'; // ✅ Import useAuth
import { useModal } from '../../context/ModalContext'; // ✅ Import useModal
import Alert from '../../components/common/Alert';
import FullCake from '../../components/public/FullCake.png';

const CustomCake = () => {
  const navigate = useNavigate();
  const { addCustomProductToCart } = useCart();
  const { isAuthenticated } = useAuth(); // ✅ Get auth state
  const { openLogin } = useModal(); // ✅ Get modal context
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Load Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleAddCustomProduct = async (customData) => {
    try {
      await addCustomProductToCart(customData);
      // Success handled in CustomProductBuilder
    } catch (err) {
      console.error('Error agregando producto personalizado:', err);
      setError('Error al agregar al carrito. Intenta de nuevo.');
      setTimeout(() => setError(''), 3000);
      throw err;
    }
  };

  const handleStartCreating = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setIsBuilderOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Success/Error Alerts */}
      {(successMessage || error) && (
        <div className="fixed top-24 right-4 z-50 w-full max-w-md">
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-black text-black p-4 mb-4 shadow-lg rounded" role="alert">
              <p className="font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>¡Éxito!</p>
              <p style={{ fontFamily: "'Montserrat', sans-serif" }}>{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border-l-4 border-black text-black p-4 mb-4 shadow-lg rounded" role="alert">
              <p className="font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Error</p>
              <p style={{ fontFamily: "'Montserrat', sans-serif" }}>{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Hero Section - Split Layout */}
      <section className="w-full min-h-[600px] flex flex-col md:flex-row">
        {/* Left Side - Text */}
        <div className="w-full md:w-1/2 bg-[#E8F442] flex items-center justify-center px-8 md:px-12 lg:px-16 py-12">
          <div className="w-full max-w-xl">
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-black text-black leading-none mb-8 uppercase"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}
            >
              CREA TU<br />
              PROPIO<br />
              PASTEL.
            </h1>

            <p
              className="text-xl md:text-2xl text-black mb-12 font-medium"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Diseña un pastel único y especial. Elige cada detalle: sabor, tamaño, relleno y los toppings más deliciosos.
            </p>

            <button
              onClick={handleStartCreating} // ✅ Use handler
              className="px-10 py-4 bg-black text-white text-lg md:text-xl font-bold rounded-full hover:bg-white hover:text-black border-2 border-black transition-all duration-300 uppercase shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Comenzar a Crear
            </button>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center overflow-hidden relative min-h-[400px]">
          {/* Decorative Circle */}
          <div className="absolute w-[500px] h-[500px] bg-pink-100 rounded-full -z-0"></div>

          <img
            src={FullCake}
            alt="Custom Cake"
            className="relative z-10 object-contain w-3/4 max-w-[500px] hover:scale-105 transition-transform duration-500"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-black text-black text-center mb-16 uppercase"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            PERSONALIZACIÓN TOTAL
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border-2 border-black rounded-3xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 group">
              <div className="w-16 h-16 bg-[#F4D4F4] rounded-full flex items-center justify-center mb-6 border-2 border-black group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-4 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Sabor</h3>
              <p className="text-black font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Chocolate, vainilla, red velvet y más sabores deliciosos.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border-2 border-black rounded-3xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 group">
              <div className="w-16 h-16 bg-[#E8F442] rounded-full flex items-center justify-center mb-6 border-2 border-black group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-4 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Tamaño</h3>
              <p className="text-black font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Desde individual hasta gigante. Perfecto para tu ocasión.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border-2 border-black rounded-3xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 group">
              <div className="w-16 h-16 bg-[#FB8C00] rounded-full flex items-center justify-center mb-6 border-2 border-black group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-4 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Relleno</h3>
              <p className="text-black font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Dale un toque especial con rellenos de fresa, cajeta o crema.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border-2 border-black rounded-3xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 group">
              <div className="w-16 h-16 bg-[#7CB342] rounded-full flex items-center justify-center mb-6 border-2 border-black group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-4 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Toppings</h3>
              <p className="text-black font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Fresas, nueces, chispas y más para la decoración perfecta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-black text-black text-center mb-16 uppercase"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            ¿CÓMO FUNCIONA?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-black z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-3xl font-black border-4 border-white shadow-lg mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                1
              </div>
              <h3 className="text-xl font-black text-black mb-2 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Elige Sabor</h3>
              <p className="text-gray-600 font-medium">Selecciona tu base favorita</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center text-3xl font-black border-4 border-black shadow-lg mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                2
              </div>
              <h3 className="text-xl font-black text-black mb-2 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Tamaño</h3>
              <p className="text-gray-600 font-medium">Elige las porciones ideales</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-3xl font-black border-4 border-white shadow-lg mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                3
              </div>
              <h3 className="text-xl font-black text-black mb-2 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Personaliza</h3>
              <p className="text-gray-600 font-medium">Añade rellenos y toppings</p>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#E8F442] text-black rounded-full flex items-center justify-center text-3xl font-black border-4 border-black shadow-lg mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                4
              </div>
              <h3 className="text-xl font-black text-black mb-2 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Ordena</h3>
              <p className="text-gray-600 font-medium">¡Disfruta tu creación!</p>
            </div>
          </div>

          <div className="text-center mt-20">
            <button
              onClick={handleStartCreating} // ✅ Use handler
              className="px-12 py-5 bg-black text-white text-xl font-bold rounded-full hover:bg-[#E8F442] hover:text-black border-2 border-black transition-all duration-300 uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              EMPEZAR AHORA
            </button>
          </div>
        </div>
      </section>

      {/* Modal de Personalización */}
      <CustomProductBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onAddToCart={handleAddCustomProduct}
      />
    </div>
  );
};

export default CustomCake;