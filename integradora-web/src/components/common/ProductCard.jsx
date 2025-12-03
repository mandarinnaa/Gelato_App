import React from 'react';

const ProductCard = ({
  product,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onAddToCart,
  cartLoading,
  imageError,
  onImageError
}) => {

  // Función para construir la URL completa de la imagen
  const getImageUrl = (product) => {
    if (!product.image && !product.image_url) return null;

    const imagePath = product.image_url || product.image;

    if (imagePath?.startsWith('http')) {
      return imagePath;
    }

    const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8000';
    const cleanPath = imagePath?.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${baseUrl}/storage${cleanPath}`;
  };

  const imageUrl = getImageUrl(product);
  const originalPrice = parseFloat(product.original_price || product.final_price || 0);
  const finalPrice = parseFloat(product.final_price || 0);
  const hasDiscount = product.has_discount === true || (originalPrice > finalPrice);

  // ✅ Verificar si el producto está sin stock
  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  return (
    <div
      className="group relative bg-white rounded-lg overflow-hidden transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Product Image Container with Overlay Button */}
      <div className="relative w-full aspect-square bg-[#f5f0e8] flex items-center justify-center overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-95' : 'scale-100'
              }`}
            onError={onImageError}
            loading="lazy"
          />
        ) : (
          <svg className="w-40 h-40 text-[#d4c4b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.506 2.506 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
          </svg>
        )}

        {/* Add to Cart Button Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ease-in-out ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
        >
          <button
            onClick={onAddToCart}
            disabled={!product.available || cartLoading || isOutOfStock}
            className={`w-full flex items-center justify-center px-6 py-4 text-sm font-bold transition-all duration-300 uppercase tracking-wide ${!product.available || isOutOfStock
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-100'
              }`}
            style={{ fontFamily: "'Lexend Giga', sans-serif" }}
          >
            {cartLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Agregando...
              </>
            ) : !product.available || isOutOfStock ? (
              'No Disponible'
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Añadir al Carrito
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 bg-white pl-0">
        <h3 className="text-base font-bold text-black mb-0.5 uppercase tracking-wide leading-tight" style={{ fontFamily: "'Lexend Giga', sans-serif", fontSize: '0.8rem' }}>
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-0.5" style={{ fontFamily: "'Open Sans', sans-serif" }}>
          {product.flavor?.name || product.description || 'Delicioso pastel'}
        </p>

        {/* Price Section */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-2xl font-bold text-black" style={{ fontFamily: "'Lexend Giga', sans-serif" }}>
            ${finalPrice.toFixed(2)}
          </span>

          {hasDiscount && originalPrice > finalPrice && (
            <span className="text-lg font-medium text-gray-400 line-through" style={{ fontFamily: "'Lexend Giga', sans-serif" }}>
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;