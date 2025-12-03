import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import ProductReviewsSection from '../../components/product/ProductReviewsSection';
import ProductCard from '../../components/common/ProductCard';
import { useModal } from '../../context/ModalContext'; // ✅ Import Context

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProduct, products, loading, error, fetchProductById, fetchProducts } = useProducts();
  const { addBaseProduct, loading: cartLoading } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { openLogin } = useModal(); // ✅ Use Context

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  // Cargar fuentes de Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Cargar producto actual
  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    fetchProductById(id).catch(err => console.error('Error al cargar producto:', err));
  }, [id]);

  // Cargar lista de productos solo una vez
  useEffect(() => {
    if (!initialLoadDone && (!products || products.length === 0)) {
      fetchProducts().catch(err => console.error('Error al cargar productos:', err));
      setInitialLoadDone(true);
    }
  }, [initialLoadDone, products]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      openLogin(); // ✅ Open Modal instead of alert/redirect
      return;
    }

    if (!currentProduct.available) {
      setErrorMessage('Este producto no está disponible');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (currentProduct.stock === 0) {
      setErrorMessage('Este producto está agotado');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      await addBaseProduct(currentProduct.id, null, quantity);
    } catch (err) {
      console.error('Error:', err);
      setErrorMessage(err.response?.data?.message || 'Error al agregar al carrito. Por favor intenta de nuevo.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}/storage${cleanPath}`;
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) return <Loader text="Cargando producto..." />;
  if (error) return <Alert type="error" message={error} />;
  if (!currentProduct) return <Alert type="error" message="Producto no encontrado" />;

  const images = currentProduct.images && currentProduct.images.length > 0
    ? currentProduct.images
    : [{ url: currentProduct.image, is_primary: true }];

  const originalPrice = parseFloat(currentProduct.original_price || currentProduct.final_price || 0);
  const finalPrice = parseFloat(currentProduct.final_price || 0);
  const discountPercent = parseFloat(currentProduct.discount_applied || 0);
  const hasDiscount = currentProduct.has_discount === true || (originalPrice > finalPrice && discountPercent > 0);
  const stock = currentProduct.stock || 0;
  const isOutOfStock = stock === 0;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Hero Section - Yellow/Cream Background */}
      <section className="bg-[#FFFACD] py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Side - Product Info */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter leading-tight">
                {currentProduct.name}
              </h1>

              {currentProduct.description && (
                <p className="text-base md:text-lg text-black leading-relaxed">
                  {currentProduct.description}
                </p>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4">
                  <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-5xl md:text-6xl font-black text-black">
                  ${finalPrice.toFixed(2)}
                </span>
                {hasDiscount && originalPrice > finalPrice && (
                  <span className="text-2xl text-gray-500 line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center border-2 border-black rounded-lg hover:bg-black hover:text-white hover:scale-110 transition-all duration-300 font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentProduct.available || isOutOfStock}
                >
                  -
                </button>
                <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center border-2 border-black rounded-lg hover:bg-black hover:text-white hover:scale-110 transition-all duration-300 font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentProduct.available || isOutOfStock || quantity >= stock}
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!currentProduct.available || cartLoading || isOutOfStock}
                className={`px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 ${!currentProduct.available || isOutOfStock
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                  }`}
              >
                {cartLoading ? 'Agregando...' : isOutOfStock ? 'Agotado' : !currentProduct.available ? 'No Disponible' : 'Añadir al carrito'}
              </button>

              {/* Stock Info */}
              {stock > 0 && (
                <p className="text-sm text-gray-700">
                  {stock} disponibles
                </p>
              )}
            </div>

            {/* Right Side - Image Carousel */}
            <div className="relative">
              <div className="relative w-full" style={{ aspectRatio: '1/1', minHeight: '650px' }}>
                {/* Main Image */}
                <img
                  src={getImageUrl(images[selectedImage]?.url)}
                  alt={currentProduct.name}
                  className="w-full h-full object-contain rounded-2xl"
                />

                {/* Carousel Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 border-2 border-black rounded-full flex items-center justify-center transition-all hover:bg-black hover:text-white hover:scale-110 z-10 bg-white/80 backdrop-blur-sm"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 border-2 border-black rounded-full flex items-center justify-center transition-all hover:bg-black hover:text-white hover:scale-110 z-10 bg-white/80 backdrop-blur-sm"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`h-2 rounded-full transition-all ${selectedImage === index ? 'bg-black w-8' : 'bg-white/60 hover:bg-white w-2'
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MÁS PRODUCTOS Section - No Background */}
      {products && products.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-black text-black uppercase text-center mb-12">
              MÁS PRODUCTOS.
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {products
                .filter(p => p.id !== currentProduct.id && p.available)
                .slice(0, 4)
                .map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isHovered={hoveredProduct === product.id}
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    onClick={() => navigate(`/product/${product.id}`)}
                    onAddToCart={(e) => {
                      e.stopPropagation();
                      if (!isAuthenticated) {
                        openLogin(); // ✅ Open Modal instead of alert
                        return;
                      }
                      addBaseProduct(product.id, 1);
                    }}
                    cartLoading={cartLoading}
                    imageError={imageErrors[product.id]}
                    onImageError={() => handleImageError(product.id)}
                  />
                ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate('/shop')}
                className="inline-flex items-center px-8 py-4 bg-black text-white font-bold text-sm uppercase rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section - Purple Background Only for Title */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Purple Title Container */}
          <div className="bg-[#E6D5FF] rounded-2xl p-8 mb-8">
            <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight mb-2">
              RESEÑAS Y CALIFICACIONES.
            </h2>
            <p className="text-black text-base md:text-lg">
              Opiniones de clientes que han comprado este producto.
            </p>
          </div>

          {/* Reviews Content - No Background */}
          <ProductReviewsSection
            productId={currentProduct.id}
            userId={user?.id || null}
          />
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;