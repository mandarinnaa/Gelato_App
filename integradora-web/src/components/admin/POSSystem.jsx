import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axiosConfig';
import { saleService } from '../../api/saleService';
import TicketModal from './TicketModal';
import PaymentModal from './PaymentModal';
import Loader from '../common/Loader';

// Iconos SVG directos
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const POSSystem = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [lastSaleId, setLastSaleId] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({ amountPaid: 0, change: 0 });

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.get('/base-products');

      if (response.data.success && response.data.data) {
        setProducts(response.data.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError('Error al cargar productos: ' + errorMsg);
      console.error('Error completo:', err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.id === selectedCategory;
    const isAvailable = product.available;

    return matchesSearch && matchesCategory && isAvailable;
  });

  const addToCart = (product) => {
    // ✅ Validar stock disponible
    if (!product.stock || product.stock === 0) {
      setError(`${product.name} no tiene stock disponible`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newQuantity = currentQuantity + 1;

    // ✅ Verificar que no exceda el stock
    if (newQuantity > product.stock) {
      setError(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}, en carrito: ${currentQuantity}`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.final_price,
        image: product.image,
        quantity: 1,
        stock: product.stock // ✅ Guardar stock para validaciones futuras
      }]);
    }
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;

        // No permitir cantidades menores o iguales a 0
        if (newQuantity <= 0) return null;

        // ✅ Validar stock al incrementar
        if (change > 0) {
          const product = products.find(p => p.id === productId);
          if (product && newQuantity > product.stock) {
            setError(`Stock insuficiente para ${item.name}. Disponible: ${product.stock}`);
            setTimeout(() => setError(''), 3000);
            return item; // Mantener cantidad actual
          }
        }

        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleInitiatePayment = () => {
    if (cart.length === 0) {
      setError('El carrito está vacío');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!user || !user.id) {
      setError('Usuario no identificado. Por favor, recarga la página o vuelve a iniciar sesión.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (amountPaid, change) => {
    setShowPaymentModal(false);
    setPaymentInfo({ amountPaid, change });
    setIsSaving(true);
    setError('');

    try {
      const saleData = {
        employee_id: user.id,
        payment_method_id: 4,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await saleService.create(saleData);

      if (response.success) {
        setShowSuccess(true);
        setLastSaleId(response.data.id);
        setCart([]);
        setShowTicketModal(true);

        // Recargar productos para actualizar stock
        await loadProducts();

        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        throw new Error(response.message || 'Error al procesar la venta');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError('Error al procesar venta: ' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Funciones del modal
  const handlePrintTicket = () => {
    if (lastSaleId) {
      try {
        saleService.printTicket(lastSaleId);
        setShowTicketModal(false);
        setLastSaleId(null);
        setPaymentInfo({ amountPaid: 0, change: 0 });
      } catch (error) {
        console.error('Error al imprimir:', error);
        setError('Error al imprimir el ticket');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleDownloadTicket = async () => {
    if (lastSaleId) {
      try {
        await saleService.downloadTicket(lastSaleId);
        setShowTicketModal(false);
        setLastSaleId(null);
        setPaymentInfo({ amountPaid: 0, change: 0 });
      } catch (error) {
        console.error('Error al descargar:', error);
        setError('Error al descargar el ticket');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleOpenTicket = () => {
    if (lastSaleId) {
      saleService.openTicket(lastSaleId);
      setShowTicketModal(false);
      setLastSaleId(null);
      setPaymentInfo({ amountPaid: 0, change: 0 });
    }
  };

  const handleCloseModal = () => {
    setShowTicketModal(false);
    setLastSaleId(null);
    setPaymentInfo({ amountPaid: 0, change: 0 });
  };

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Ventas</h1>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg">
              <ShoppingCartIcon />
              <span className="font-semibold">{cart.length} productos</span>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 text-red-600">
              <AlertIcon />
            </div>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 text-green-600">
                <CheckIcon />
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-800 font-semibold">¡Venta registrada exitosamente!</p>
                <p className="text-xs text-green-600 mt-1">
                  Venta #{lastSaleId} | Pago: ${paymentInfo.amountPaid.toFixed(2)} | Cambio: ${paymentInfo.change.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 text-yellow-600">
              <AlertIcon />
            </div>
            <div>
              <p className="text-sm text-yellow-800 font-semibold">Usuario no detectado</p>
              <p className="text-xs text-yellow-700 mt-1">Por favor, recarga la página o vuelve a iniciar sesión.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Panel de Productos */}
          <div className="lg:col-span-2 space-y-4">
            {/* Búsqueda y Filtros */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Todos
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid de Productos */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              {isLoading ? (
                <Loader text="Cargando productos..." size="md" />
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se encontraron productos</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={!product.stock || product.stock === 0}
                      className={`bg-white border-2 rounded-lg p-3 text-left transition-all ${!product.stock || product.stock === 0
                        ? 'border-gray-200 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-slate-900 hover:shadow-md'
                        }`}
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingCartIcon />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold text-slate-900">
                        ${product.final_price.toFixed(2)}
                      </p>
                      {product.category && (
                        <p className="text-xs text-gray-500 mt-1">
                          {product.category.name}
                        </p>
                      )}
                      <p className={`text-xs mt-1 font-medium ${product.stock > 10 ? 'text-green-600' :
                        product.stock > 0 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                        {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel del Carrito */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCartIcon />
                Carrito de Venta
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 text-gray-300 mx-auto mb-3 flex items-center justify-center">
                    <ShoppingCartIcon />
                  </div>
                  <p className="text-gray-500 text-sm">El carrito está vacío</p>
                  <p className="text-gray-400 text-xs mt-1">Agrega productos para comenzar</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm text-gray-900 flex-1 pr-2">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <TrashIcon />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors"
                            >
                              <MinusIcon />
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors"
                            >
                              <PlusIcon />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              ${item.price.toFixed(2)} c/u
                            </p>
                            <p className="font-bold text-slate-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-slate-900">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleInitiatePayment}
                      disabled={isSaving || !user}
                      className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <DollarIcon />
                          Cobrar ${total.toFixed(2)}
                        </>
                      )}
                    </button>

                    <button
                      onClick={clearCart}
                      disabled={isSaving}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Limpiar Carrito
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pago */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Modal de Ticket */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={handleCloseModal}
        saleId={lastSaleId}
        onPrint={handlePrintTicket}
        onDownload={handleDownloadTicket}
        onView={handleOpenTicket}
      />
    </div>
  );
};

export default POSSystem;

