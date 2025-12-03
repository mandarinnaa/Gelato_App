import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axiosConfig';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import ProductCard from '../../components/common/ProductCard';
import { useModal } from '../../context/ModalContext'; // ✅ Import Context

const Shop = () => {
  const navigate = useNavigate();
  const { products = [], loading, error, fetchProducts } = useProducts();
  const { addBaseProduct, loading: cartLoading } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { openLogin } = useModal(); // ✅ Use Context

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default'); // default, rating, best_selling, a-z

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

  useEffect(() => {
    fetchProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');

      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      openLogin(); // ✅ Open Modal instead of alert
      return;
    }

    try {
      await addBaseProduct(product.id, 1);
      setSuccessMessage(`${product.name} agregado al carrito`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error:', err);
      setErrorMessage('Error al agregar al carrito. Por favor intenta de nuevo.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleImageError = (productId) => {
    console.error(`Error al cargar imagen del producto ${productId}`);
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Filtrar y ordenar productos con useMemo
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    // 1. Filtrar
    let result = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.flavor?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category?.id === selectedCategory;
      const isAvailable = product.available;

      return matchesSearch && matchesCategory && isAvailable;
    });

    // 2. Ordenar
    if (sortBy !== 'default') {
      result.sort((a, b) => {
        switch (sortBy) {
          case 'a-z':
            return a.name.localeCompare(b.name);
          case 'best_selling':
            return (b.sold_count || 0) - (a.sold_count || 0);
          case 'rating':
            return (b.average_rating || 0) - (a.average_rating || 0);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortBy]);

  if (loading) return <Loader text="Cargando productos..." />;

  return (
    <div className="min-h-screen bg-white">
      {/* Yellow Banner Section */}
      <section className="bg-[#E8F442] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-black uppercase tracking-tighter" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            NUESTROS PASTELES.
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-gray-50 border-l-4 border-black p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-black mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-black font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 animate-fade-in">
            <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
          </div>
        )}

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Left Sidebar */}
          <div className="space-y-8 pt-14"> {/* Added pt-14 to align with product grid/sort bar */}

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar"
                className="w-full py-3 pl-12 pr-4 rounded-xl text-black font-bold placeholder-black focus:outline-none transition-all duration-300"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  backgroundColor: '#f5f0e8' // Matches ProductCard image background
                }}
              />
            </div>

            {/* Categories */}
            <div>
              {/* Category Header with Background */}
              <div className="rounded-xl p-3 mb-4 inline-block w-full" style={{ backgroundColor: '#f5f0e8' }}>
                <h3 className="text-lg font-black text-black uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Categorias
                </h3>
              </div>

              {/* Category Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${selectedCategory === 'all'
                    ? 'bg-black text-white border-black'
                    : 'bg-transparent text-black border-gray-200 hover:border-black hover:scale-105'
                    }`}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Todas
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${selectedCategory === category.id
                      ? 'bg-black text-white border-black'
                      : 'bg-transparent text-black border-gray-200 hover:border-black hover:scale-105'
                      }`}
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Top Bar - Sorting */}
            <div className="flex justify-end mb-8 items-center">
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Filtrar
                </span>
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-transparent text-black font-medium pr-8 cursor-pointer focus:outline-none"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    <option value="default">Por defecto</option>
                    <option value="rating">Calificados</option>
                    <option value="best_selling">Mejores Vendidos</option>
                    <option value="a-z">A-Z</option>
                  </select>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  NO SE ENCONTRARON PRODUCTOS
                </h3>
                <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {searchTerm
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Intenta seleccionando una categoría diferente'
                  }
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchTerm('');
                  }}
                  className="inline-flex items-center px-8 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isHovered={hoveredProduct === product.id}
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    onClick={() => handleProductClick(product.id)}
                    onAddToCart={(e) => handleAddToCart(e, product)}
                    cartLoading={cartLoading}
                    imageError={imageErrors[product.id]}
                    onImageError={() => handleImageError(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;