import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FlavorCard from '../../components/common/flavorCard';
import ChessCake from '../../components/public/chess-2.png';
import ChocoCake from '../../components/public/choco-2.png';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../context/ModalContext'; // ✅ Import Context

const Home = () => {
  const navigate = useNavigate();
  const { products, fetchProducts } = useProducts();
  const { addBaseProduct } = useCart();
  const { isAuthenticated } = useAuth();
  const { openLogin, openRegister } = useModal(); // ✅ Use Context

  const [displayProducts, setDisplayProducts] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Cargar fuente de Google Fonts
  useEffect(() => {
    const link1 = document.createElement('link');
    link1.href = 'https://fonts.googleapis.com/css2?family=Lexend+Giga:wght@100..900&family=Momo+Signature&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap';
    link1.rel = 'stylesheet';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.href = 'https://fonts.googleapis.com/css2?family=Open+Sans&display=swap';
    link2.rel = 'stylesheet';
    document.head.appendChild(link2);

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
    };
  }, []);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Process products when loaded
  useEffect(() => {
    if (products.length > 0) {
      // Helper to construct image URL (same as in ProductCard)
      const getImageUrl = (product) => {
        if (!product.image && !product.image_url) return null;
        const imagePath = product.image_url || product.image;
        if (imagePath?.startsWith('http')) return imagePath;

        const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';
        const cleanPath = imagePath?.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${baseUrl}/storage${cleanPath}`;
      };

      // Take first 3 products or available ones
      const selectedProducts = products.slice(0, 3).map((product, index) => {
        // Assign visual properties cyclically
        const visualProps = [
          {
            hoverColor: "#7CB342", // Green
            imageSize: "w-[300px] md:w-[400px] lg:w-[530px]",
            imagePositionH: "left-0 md:left-5 lg:left-0",
            imagePositionV: "top-2/3 -translate-y-2/3"
          },
          {
            hoverColor: "#E53935", // Red
            imageSize: "w-[300px] md:w-[400px] lg:w-[600px]",
            imagePositionH: "right-0 md:right-5 lg:right-0",
            imagePositionV: "top-2/3 -translate-y-2/3"
          },
          {
            hoverColor: "#FB8C00", // Orange
            imageSize: "w-[300px] md:w-[400px] lg:w-[580px]",
            imagePositionH: "left-0 md:left-5 lg:left-0",
            imagePositionV: "top-2/3 -translate-y-2/3"
          }
        ];

        const props = visualProps[index % visualProps.length];
        const constructedImage = getImageUrl(product);

        return {
          ...product,
          ...props,
          // Use constructed image URL, fallback to prop image if construction failed, or keep original if needed
          image: constructedImage || props.image || product.image_url
        };
      });
      setDisplayProducts(selectedProducts);
    }
  }, [products]);

  const handleOrder = async (product) => {
    if (!isAuthenticated) {
      openLogin(); // ✅ Open Modal instead of redirect
      return;
    }

    try {
      await addBaseProduct(product.id, 1);
      setSuccessMessage(`¡${product.name} agregado al carrito!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Error al agregar al carrito. Intenta de nuevo.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLearnMore = (productId) => {
    if (!isAuthenticated) {
      openLogin(); // ✅ Open Modal instead of redirect
      return;
    }
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Success/Error Alerts */}
      {(successMessage || error) && (
        <div className="fixed top-24 right-4 z-50 w-full max-w-md">
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 shadow-lg rounded" role="alert">
              <p className="font-bold">¡Éxito!</p>
              <p>{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 shadow-lg rounded" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Primera Sección - Amarillo con Cheesecake */}
      <section className="w-full h-screen min-h-[700px] flex">
        {/* Lado Izquierdo - Texto */}
        <div className="w-1/2 bg-white flex items-center justify-center px-8 md:px-12 lg:px-16">
          <div className="w-full max-w-2xl">
            <h1
              className="text-6xl md:text-7xl lg:text-8xl font-black text-black leading-none mb-8 uppercase"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}
            >
              AMOR<br />
              PASTELERO.
            </h1>

            <p
              className="text-xl md:text-2xl lg:text-3xl text-black mb-12"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
            >
              Hechos con amor para tus mejores momentos.
            </p>

            <button
              onClick={() => navigate('/shop')}
              className="px-10 py-4 bg-transparent border-2 border-black text-black text-lg md:text-xl font-bold rounded-full hover:bg-black hover:text-white transition-all duration-300 uppercase"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Comprar
            </button>
          </div>
        </div>

        {/* Lado Derecho - Imagen Amarilla */}
        <div className="w-1/2 flex items-center justify-end overflow-hidden pr-4 md:pr-6 lg:pr-8" style={{ backgroundColor: '#E8F442' }}>
          <div className="flex items-center justify-center">
            <img
              src={ChessCake}
              alt="Cheesecake"
              className="object-contain"
              style={{ maxWidth: '600px', maxHeight: '600px' }}
            />
          </div>
        </div>
      </section>

      {/* Línea Divisora */}
      <div className="w-full h-px bg-gray-300"></div>

      {/* Segunda Sección - Rosa con Chocolate */}
      <section className="w-full h-screen min-h-[700px] flex">
        {/* Lado Izquierdo - Imagen Rosa */}
        <div className="w-1/2 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#F4D4F4' }}>
          <img
            src={ChocoCake}
            alt="Chocolate Cake"
            className="w-full h-full object-contain p-4"
            style={{ maxWidth: '700px', maxHeight: '700px' }}
          />
        </div>

        {/* Lado Derecho - Texto */}
        <div className="w-1/2 bg-white flex items-center justify-end px-8 md:px-12 lg:px-16">
          <div className="text-right">
            <h1
              className="text-6xl md:text-7xl lg:text-8xl font-black text-black leading-none mb-8 uppercase"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}
            >
              ENDULZA<br />
              TU DÍA.
            </h1>

            <p
              className="text-xl md:text-2xl lg:text-3xl text-black mb-12"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
            >
              No te pierdas de las mejores recetas.
            </p>

            <button
              onClick={() => isAuthenticated ? navigate('/contact') : openRegister()} // ✅ Use Context
              className="px-10 py-4 bg-transparent border-2 border-black text-black text-lg md:text-xl font-bold rounded-full hover:bg-black hover:text-white transition-all duration-300 uppercase"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {isAuthenticated ? 'CONTACTANOS' : 'Regístrate'}
            </button>
          </div>
        </div>
      </section>

      {/* Línea Divisora */}
      <div className="w-full h-px bg-gray-300"></div>

      {/* Sección de Productos */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-5xl md:text-6xl lg:text-7xl font-black text-black text-center mb-16 uppercase"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}
          >
            NUESTROS MEJORES<br />
            PRODUCTOS.
          </h2>

          <div className="space-y-56 mt-32">
            {displayProducts.length > 0 ? (
              displayProducts.map((flavor, index) => (
                <FlavorCard
                  key={flavor.id}
                  flavor={flavor}
                  imagePosition={index % 2 === 0 ? 'left' : 'right'}
                  onOrder={() => handleOrder(flavor)}
                  onLearnMore={() => handleLearnMore(flavor.id)}
                />
              ))
            ) : (
              // Fallback or loading state could go here, for now just empty or skeleton
              <div className="text-center text-gray-500">Cargando productos...</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;