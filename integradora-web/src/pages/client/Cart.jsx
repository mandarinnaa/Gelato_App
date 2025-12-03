import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useState } from 'react';

const Cart = () => {
  const { items, total, loading, fetchCart, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  // ✅ CRÍTICO: Cargar carrito al montar el componente
  useEffect(() => {
    console.log('🔄 Cart montado - Cargando carrito...');
    fetchCart();
  }, []); // Array vacío = solo se ejecuta al montar

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

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isDestructive: false
  });

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(item.id, newQuantity);
  };

  const handleRemove = (itemId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar producto',
      message: '¿Estás seguro de que deseas eliminar este producto del carrito?',
      onConfirm: async () => {
        await removeItem(itemId);
      },
      isDestructive: true
    });
  };

  const handleClear = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Vaciar carrito',
      message: '¿Estás seguro de que deseas vaciar todo el carrito?',
      onConfirm: async () => {
        await clearCart();
      },
      isDestructive: true
    });
  };

  // ✅ Función para calcular la entrega estimada
  const getEstimatedDeliveryTime = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // Horario de atención: 8:00 AM - 8:00 PM
    const OPENING_HOUR = 8;
    const CLOSING_HOUR = 20;

    if (currentHour >= OPENING_HOUR && currentHour < CLOSING_HOUR) {
      // Pedido durante horario de atención: entrega el mismo día
      return 'Hoy (durante horario de atención)';
    } else if (currentHour >= CLOSING_HOUR) {
      // Pedido después de las 8:00 PM: entrega mañana a partir de las 8:00 AM
      return 'Mañana a partir de las 8:00 AM';
    } else {
      // Pedido en la madrugada (antes de las 8:00 AM): entrega hoy a partir de las 8:00 AM
      return 'Hoy a partir de las 8:00 AM';
    }
  };

  if (loading) return <Loader text="Cargando carrito..." />;

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Yellow Banner */}
        <section className="bg-[#E8F442] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-7xl font-black text-black uppercase tracking-tighter" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              TU CARRITO.
            </h1>
          </div>
        </section>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white border-2 border-black rounded-3xl p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#f5f0e8] border-2 border-black flex items-center justify-center">
              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2
              className="text-3xl font-black text-black mb-3 uppercase"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Tu carrito está vacío
            </h2>
            <p
              className="text-gray-600 mb-8 text-lg font-medium"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Agrega productos desde la tienda para comenzar tu compra
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-[#E8F442] hover:text-black border-2 border-black transition-all duration-300 shadow-lg hover:shadow-none uppercase tracking-wide"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Ir a la Tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shippingCost = 50;
  const finalTotal = parseFloat(total) + shippingCost;

  return (
    <div className="min-h-screen bg-white">
      {/* Yellow Banner */}
      <section className="bg-[#E8F442] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-black uppercase tracking-tighter" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            TU CARRITO.
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <p
            className="text-lg font-bold text-black uppercase"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {items.length} producto{items.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={handleClear}
            className="inline-flex items-center px-6 py-2 text-sm font-bold text-black bg-white border-2 border-black rounded-full hover:bg-gray-100 transition-all duration-300 uppercase tracking-wide hover:shadow-md"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Vaciar Carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Products List */}
          <div className="lg:col-span-2 space-y-6">
            {items.map(item => (
              <div key={item.id} className="bg-white border-2 border-black rounded-3xl p-6 relative hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-32 rounded-2xl bg-[#f5f0e8] border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-black opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.506 2.506 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                      </svg>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-xl font-black text-black mb-2 uppercase"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {item.name || 'Producto'}
                    </h3>

                    {/* Detalles del producto */}
                    <div className="space-y-1 mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {item.flavor && (
                        <p className="text-sm text-gray-600 font-medium">
                          <span className="font-bold text-black">Sabor:</span> {item.flavor}
                        </p>
                      )}
                      {item.size && (
                        <p className="text-sm text-gray-600 font-medium">
                          <span className="font-bold text-black">Tamaño:</span> {item.size}
                        </p>
                      )}
                      {item.filling && (
                        <p className="text-sm text-gray-600 font-medium">
                          <span className="font-bold text-black">Relleno:</span> {item.filling}
                        </p>
                      )}
                      {item.toppings && item.toppings.length > 0 && (
                        <p className="text-sm text-gray-600 font-medium">
                          <span className="font-bold text-black">Toppings:</span> {item.toppings.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="space-y-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        <p className="text-sm text-gray-500 font-medium">
                          Precio unitario: <span className="font-bold text-black">${parseFloat(item.unit_price).toFixed(2)}</span>
                        </p>
                        <p className="text-lg font-black text-black">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span
                          className="w-8 text-center text-lg font-bold text-black"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          disabled={item.type === 'base' && item.product?.stock && item.quantity >= item.product.stock}
                          className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button (Desktop: Top Right, Mobile: Bottom Right) */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-black rounded-3xl p-8 sticky top-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3
                className="text-2xl font-black text-black mb-6 uppercase"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Resumen
              </h3>

              {/* Summary Items */}
              <div className="space-y-4 mb-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <div className="flex justify-between text-base font-medium">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-black">${parseFloat(total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-medium">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-bold text-black">${shippingCost.toFixed(2)}</span>
                </div>

                <div className="border-t-2 border-gray-100 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span
                      className="text-xl font-black text-black uppercase"
                    >
                      Total
                    </span>
                    <span
                      className="text-3xl font-black text-black"
                    >
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mb-8 p-4 bg-[#f5f0e8] rounded-2xl border border-gray-200">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    <p className="text-sm font-bold text-black">Envío a domicilio</p>
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      Entrega estimada: <span className="text-black">{getEstimatedDeliveryTime()}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center px-6 py-4 bg-black text-white font-bold rounded-full hover:bg-[#E8F442] hover:text-black border-2 border-black transition-all duration-300 shadow-lg hover:shadow-none uppercase tracking-wide"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Proceder al Pago
                </button>

                <button
                  onClick={() => navigate('/shop')}
                  className="w-full px-6 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-50 border-2 border-gray-200 hover:border-black transition-all duration-300 uppercase tracking-wide"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Seguir Comprando
                </button>
              </div>

              {/* Security Badge */}
              <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Pago 100% seguro
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
      />
    </div>
  );
};

export default Cart;