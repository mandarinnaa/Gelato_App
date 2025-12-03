import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import api from '../../api/axiosConfig';
import paymentService from '../../api/paymentService';
import pointsService from '../../api/pointsService';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

const Checkout = () => {
  const { user } = useAuth();
  const { items, total, loading: cartLoading, fetchCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Estados para el sistema de puntos
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [showPointsSection, setShowPointsSection] = useState(false);
  const [inputPoints, setInputPoints] = useState('');
  const [calculatingDiscount, setCalculatingDiscount] = useState(false);
  const [membershipInfo, setMembershipInfo] = useState(null);

  const SHIPPING_COST = 50.00;

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

  useEffect(() => {
    fetchCart();
    loadAddresses();
    loadPayPalScript();
    loadUserPoints();
  }, []);

  const loadUserPoints = async () => {
    if (!user) return;

    try {
      const response = await pointsService.getBalance();
      setAvailablePoints(response.data.available || 0);
      setMembershipInfo(response.data.membership);
    } catch (err) {
      console.error('Error al cargar puntos:', err);
    }
  };

  useEffect(() => {
    const calculateDiscount = async () => {
      if (pointsToRedeem > 0) {
        setCalculatingDiscount(true);
        try {
          const cartSubtotal = parseFloat(total) || 0;
          const totalWithShipping = cartSubtotal + SHIPPING_COST;

          const result = await pointsService.calculateDiscount(pointsToRedeem, totalWithShipping);
          setPointsDiscount(result.data.discount_amount || 0);
        } catch (err) {
          console.error('Error al calcular descuento:', err);
          setPointsDiscount(0);
        } finally {
          setCalculatingDiscount(false);
        }
      } else {
        setPointsDiscount(0);
      }
    };
    calculateDiscount();
  }, [pointsToRedeem, total]);

  const loadAddresses = async () => {
    try {
      const response = await api.get('/my-addresses');
      const addressList = response.data.data || [];
      setAddresses(addressList);

      if (addressList.length > 0) {
        setSelectedAddress(addressList[0]);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError('Error al cargar direcciones');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadPayPalScript = () => {
    if (document.getElementById('paypal-sdk')) return;
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = 'https://www.paypal.com/sdk/js?client-id=AWGGG3nb1hYEbagOrih6dPCbRrH7d4rWGJsuAQhjzkXIWxVEHoqucqDoc_sUJelW2iUHelDyhd2z9qkf&currency=USD';
    script.async = true;
    document.body.appendChild(script);
  };

  const handleApplyPoints = () => {
    const points = parseInt(inputPoints) || 0;

    if (points <= 0) {
      setError('Por favor ingresa una cantidad válida de puntos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (points > availablePoints) {
      setError(`No tienes suficientes puntos. Disponibles: ${availablePoints}`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    const cartSubtotal = parseFloat(total) || 0;
    const totalWithShipping = cartSubtotal + SHIPPING_COST;

    if (points > totalWithShipping) {
      setError('Los puntos no pueden exceder el total incluyendo envío');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setPointsToRedeem(points);
  };

  const handleClearPoints = () => {
    setInputPoints('');
    setPointsToRedeem(0);
    setPointsDiscount(0);
  };

  const handleUseAllPoints = () => {
    const cartSubtotal = parseFloat(total) || 0;
    const totalWithShipping = cartSubtotal + SHIPPING_COST;
    const maxPoints = Math.min(availablePoints, totalWithShipping);

    setInputPoints(maxPoints.toString());
    setPointsToRedeem(maxPoints);
  };

  const handlePayWithPayPal = async () => {
    if (!selectedAddress) {
      setError('Por favor selecciona una dirección de entrega');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const cartItems = Array.isArray(items) ? items : [];
    const cartSubtotal = parseFloat(total) || 0;
    const totalWithShipping = cartSubtotal + SHIPPING_COST;
    const grandTotal = totalWithShipping - pointsDiscount;

    if (cartItems.length === 0 || grandTotal <= 0) {
      setError('Tu carrito está vacío o el total es inválido');
      setTimeout(() => navigate('/shop'), 2000);
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const paypalOrder = await paymentService.createPayPalOrder({
        total: grandTotal,
        description: `Pedido de ${cartItems.length} producto(s) - Envío incluido`
      });

      if (!paypalOrder.success || !paypalOrder.approval_url) {
        throw new Error(paypalOrder.message || 'Error al crear orden en PayPal');
      }

      localStorage.setItem('checkout_address_id', selectedAddress.id.toString());
      localStorage.setItem('checkout_paypal_order_id', paypalOrder.order_id);
      localStorage.setItem('checkout_subtotal', cartSubtotal.toString());
      localStorage.setItem('checkout_shipping', SHIPPING_COST.toString());
      localStorage.setItem('checkout_points_to_redeem', pointsToRedeem.toString());
      localStorage.setItem('checkout_points_discount', pointsDiscount.toString());
      localStorage.setItem('checkout_total', grandTotal.toString());

      window.location.href = paypalOrder.approval_url;
    } catch (err) {
      console.error('Error al procesar pago:', err);
      setError(err.message || 'Error al procesar el pago con PayPal');
      setProcessing(false);
    }
  };

  if (cartLoading || loadingAddresses) {
    return <Loader text="Cargando checkout..." />;
  }

  const cartItems = Array.isArray(items) ? items : [];
  const cartSubtotal = parseFloat(total) || 0;
  const totalWithShipping = cartSubtotal + SHIPPING_COST;
  const finalTotal = totalWithShipping - pointsDiscount;
  const isCartEmpty = cartItems.length === 0 || cartSubtotal <= 0;

  if (isCartEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-black mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>Tu carrito está vacío</h2>
          <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>Agrega productos para continuar con tu compra</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wide"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  const maxPointsAllowed = Math.min(availablePoints, totalWithShipping);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black text-black mb-8 uppercase tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Finalizar Compra
        </h1>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dirección de entrega */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Dirección de entrega
                </h2>
                {addresses.length > 0 && (
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    + Agregar nueva
                  </button>
                )}
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-600 mb-4 text-sm">No tienes direcciones registradas</p>
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-6 py-2 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Agregar dirección
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-all ${selectedAddress?.id === addr.id
                        ? 'border-black bg-gray-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress?.id === addr.id}
                        onChange={() => setSelectedAddress(addr)}
                        className="mt-1 mr-3 flex-shrink-0 w-4 h-4"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-black mb-1 truncate" style={{ fontFamily: "'Montserrat', sans-serif" }}>{addr.title}</p>
                        <p className="text-xs text-gray-600 break-words">
                          {addr.street} {addr.number}, {addr.neighborhood}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {addr.city}, {addr.state} {addr.postal_code}
                        </p>
                        {addr.reference && (
                          <p className="text-xs text-gray-500 mt-2 break-words">
                            <span className="font-medium">Ref:</span> {addr.reference}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Sección de puntos */}
            {availablePoints > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>Canjear Puntos</h3>
                      <p className="text-xs text-gray-600">
                        Tienes <span className="font-bold text-black">{availablePoints}</span> puntos disponibles
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPointsSection(!showPointsSection)}
                    className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {showPointsSection ? 'Ocultar' : 'Usar puntos'}
                  </button>
                </div>

                {showPointsSection && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="font-bold text-black mb-3 text-sm">¿Cómo funciona?</p>
                      <ul className="space-y-2 text-xs text-gray-600">
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>1 punto = $1 MXN de descuento</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Sin límite - usa todos tus puntos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          <span>Incluye productos y envío</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Puntos a canjear
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={maxPointsAllowed}
                          value={inputPoints}
                          onChange={(e) => setInputPoints(e.target.value)}
                          placeholder={`Máximo ${maxPointsAllowed}`}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <button
                          onClick={handleUseAllPoints}
                          className="px-4 py-2.5 bg-white text-black font-bold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          Usar todos
                        </button>
                        <button
                          onClick={handleApplyPoints}
                          disabled={!inputPoints || parseInt(inputPoints) <= 0 || calculatingDiscount}
                          className="px-6 py-2.5 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {calculatingDiscount ? 'Calculando...' : 'Aplicar'}
                        </button>
                        {pointsToRedeem > 0 && (
                          <button
                            onClick={handleClearPoints}
                            className="px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-sm"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>

                    {pointsDiscount > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-green-800">
                            Descuento aplicado: ${pointsDiscount.toFixed(2)} MXN
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Información de pago */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg className="w-8 h-8" viewBox="0 0 124 33" fill="none">
                    <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z" fill="#253B80" />
                    <path d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zM119.295 7.23l-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.939-.803l2.768-17.536a.57.57 0 0 0-.562-.659h-3.16a.571.571 0 0 0-.562.482z" fill="#179BD7" />
                    <path d="M7.266 29.154l.523-3.322-1.165-.027H1.061L4.927 1.292a.316.316 0 0 1 .314-.268h9.38c3.114 0 5.263.648 6.385 1.927.526.6.861 1.227 1.023 1.917.17.724.173 1.589.007 2.644l-.012.077v.676l.526.298a3.69 3.69 0 0 1 1.065.812c.45.513.741 1.165.864 1.938.127.795.085 1.741-.123 2.812-.24 1.232-.628 2.305-1.152 3.183a6.547 6.547 0 0 1-1.825 2c-.696.494-1.523.869-2.458 1.109-.906.236-1.939.355-3.072.355h-.73c-.522 0-1.029.188-1.427.525a2.21 2.21 0 0 0-.744 1.328l-.055.299-.924 5.855-.042.215c-.011.068-.03.102-.058.125a.155.155 0 0 1-.096.035H7.266z" fill="#253B80" />
                    <path d="M23.048 7.667c-.028.179-.06.362-.096.55-1.237 6.351-5.469 8.545-10.874 8.545H9.326c-.661 0-1.218.48-1.321 1.132L6.596 26.83l-.399 2.533a.704.704 0 0 0 .695.814h4.881c.578 0 1.069-.42 1.16-.99l.048-.248.919-5.832.059-.32c.09-.572.582-.992 1.16-.992h.73c4.729 0 8.431-1.92 9.513-7.476.452-2.321.218-4.259-.978-5.622a4.667 4.667 0 0 0-1.336-1.03z" fill="#179BD7" />
                    <path d="M21.754 7.151a9.757 9.757 0 0 0-1.203-.267 15.284 15.284 0 0 0-2.426-.177h-7.352a1.172 1.172 0 0 0-1.159.992L8.05 17.605l-.045.289a1.336 1.336 0 0 1 1.321-1.132h2.752c5.405 0 9.637-2.195 10.874-8.545.037-.188.068-.371.096-.55a6.594 6.594 0 0 0-1.017-.429 9.045 9.045 0 0 0-.277-.087z" fill="#222D65" />
                    <path d="M9.614 7.699a1.169 1.169 0 0 1 1.159-.991h7.352c.871 0 1.684.057 2.426.177a9.757 9.757 0 0 1 1.481.353c.365.121.704.264 1.017.429.368-2.347-.003-3.945-1.272-5.392C20.378.682 17.853 0 14.622 0h-9.38c-.66 0-1.223.48-1.325 1.133L.01 25.898a.806.806 0 0 0 .795.932h5.791l1.454-9.225 1.564-9.906z" fill="#253B80" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-black mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>Pago seguro con PayPal</h3>
                  <p className="text-sm text-gray-600">
                    Serás redirigido a PayPal para completar tu pago de forma segura.
                    Puedes pagar con tu cuenta PayPal o con tarjeta de crédito/débito.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Resumen del pedido</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cartItems.map(item => {
                  const productName = item.name ||
                    item.base_product?.name ||
                    item.custom_product?.flavor?.name ||
                    'Producto';

                  return (
                    <div key={item.id} className="flex justify-between items-start text-sm pb-3 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="font-bold text-black text-sm">{productName}</p>
                        <p className="text-gray-500 text-xs mt-0.5">Cantidad: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-black ml-2">
                        ${parseFloat(item.subtotal || 0).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totales */}
              <div className="space-y-2 mb-6 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>${SHIPPING_COST.toFixed(2)}</span>
                </div>

                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Descuento por puntos</span>
                    <span>-${pointsDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-black pt-3 border-t border-gray-200 mt-3">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Botón de pago */}
              <button
                onClick={handlePayWithPayPal}
                disabled={processing || !selectedAddress || addresses.length === 0}
                className="w-full py-3.5 text-white font-bold rounded-full transition-all duration-300 uppercase tracking-wide text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: "'Montserrat', sans-serif", backgroundColor: '#E53935' }}
                onMouseEnter={(e) => !processing && !(!selectedAddress || addresses.length === 0) && (e.currentTarget.style.backgroundColor = '#c62828')}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E53935'}
              >
                {processing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  'Proceder al Pago'
                )}
              </button>

              {/* Mensaje de seguridad */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Pago 100% seguro y encriptado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;