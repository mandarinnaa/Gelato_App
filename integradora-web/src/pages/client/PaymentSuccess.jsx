import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../../api/paymentService';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth'; // ✅ Importar useAuth
import { BASE_URL } from '../../api/axiosConfig';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { checkout } = useCart();
  const { refreshUser } = useAuth(); // ✅ Obtener refreshUser
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState('');
  const [orderInfo, setOrderInfo] = useState(null);
  const [step, setStep] = useState(1);
  const [debugInfo, setDebugInfo] = useState(null);

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

  useEffect(() => {
    handlePaymentReturn();
  }, []);

  const handlePaymentReturn = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paypalToken = urlParams.get('token');
      const payerId = urlParams.get('PayerID');

      if (!paypalToken) {
        throw new Error('Token de pago inválido');
      }

      const addressId = localStorage.getItem('checkout_address_id');
      const paypalOrderId = localStorage.getItem('checkout_paypal_order_id');
      const total = localStorage.getItem('checkout_total');
      const pointsToRedeem = parseInt(localStorage.getItem('checkout_points_to_redeem')) || 0;

      if (!addressId) {
        throw new Error('No se encontró la dirección de entrega');
      }

      setStep(1);

      let captureResponse;
      try {
        captureResponse = await paymentService.capturePayPalOrder(paypalToken);
        if (!captureResponse.success) {
          throw new Error(captureResponse.message || 'Error al verificar el pago');
        }
      } catch (captureError) {
        setDebugInfo({
          step: 'capture',
          token: paypalToken,
          error: captureError.response?.data || captureError.message
        });
        throw new Error(
          `Error al verificar el pago: ${captureError.response?.data?.message || captureError.message}`
        );
      }

      setStep(2);
      const checkoutData = {
        address_id: parseInt(addressId),
        paypal_order_id: paypalOrderId,
        paypal_transaction_id: captureResponse.transaction_id,
        payer_id: payerId,
        points_to_redeem: pointsToRedeem
      };

      let orderResponse;
      try {
        orderResponse = await checkout(checkoutData);
        if (!orderResponse.success) {
          throw new Error(orderResponse.message || 'Error al crear la orden');
        }
      } catch (checkoutError) {
        setDebugInfo({
          step: 'checkout',
          data: checkoutData,
          error: checkoutError.response?.data || checkoutError.message
        });
        throw new Error(
          `Error al crear la orden: ${checkoutError.response?.data?.message || checkoutError.message}`
        );
      }

      localStorage.removeItem('checkout_address_id');
      localStorage.removeItem('checkout_paypal_order_id');
      localStorage.removeItem('checkout_subtotal');
      localStorage.removeItem('checkout_shipping');
      localStorage.removeItem('checkout_points_to_redeem');
      localStorage.removeItem('checkout_points_discount');
      localStorage.removeItem('checkout_total');

      setStep(3);
      setOrderInfo({
        orderId: orderResponse.data?.order?.id || 'N/A',
        total: parseFloat(total) || 0,
        transactionId: captureResponse.transaction_id,
        status: captureResponse.status,
        pointsInfo: orderResponse.data?.points_info || null
      });

      // ✅ Refrescar datos del usuario (puntos)
      await refreshUser();

      setProcessing(false);
    } catch (err) {
      console.error('❌ Error general:', err);
      setError(err.message || 'Error al procesar el pago');
      setProcessing(false);
    }
  };

  const handleViewTicket = () => {
    if (orderInfo?.orderId) {
      window.open(`${BASE_URL}/orders/${orderInfo.orderId}/ticket`, '_blank');
    }
  };

  const handleDownloadTicket = () => {
    if (orderInfo?.orderId) {
      window.open(`${BASE_URL}/orders/${orderInfo.orderId}/ticket/download`, '_blank');
    }
  };

  // LOADING STATE
  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pb-20" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full animate-pulse">
                {/* Icono de Tarjeta de Crédito (Procesando) */}
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-black text-black mb-2 uppercase tracking-tight">
              Procesando pago
            </h2>
            <p className="text-gray-600 mb-8 font-medium">
              Por favor espera un momento
            </p>
            <div className="space-y-4 text-sm text-left bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${step >= 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={step >= 1 ? 'text-black font-bold' : 'text-gray-400 font-medium'}>
                  Verificando pago
                </span>
                {step === 1 && (
                  <svg className="animate-spin h-4 w-4 text-black ml-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${step >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={step >= 2 ? 'text-black font-bold' : 'text-gray-400 font-medium'}>
                  Creando orden
                </span>
                {step === 2 && (
                  <svg className="animate-spin h-4 w-4 text-black ml-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${step >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={step >= 3 ? 'text-black font-bold' : 'text-gray-400 font-medium'}>
                  Finalizando
                </span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-xs font-bold text-amber-800 flex items-center justify-center gap-2 uppercase tracking-wide">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                No cierres esta ventana
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-tight">
              Hubo un problema
            </h2>
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg mb-8">
              <p className="text-sm text-red-800 font-bold mb-1 uppercase tracking-wide">Error:</p>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>

            {debugInfo && (
              <details className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left">
                <summary className="cursor-pointer text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Ver detalles técnicos
                </summary>
                <pre className="text-xs text-gray-600 overflow-auto max-h-40 mt-2 font-mono bg-white p-2 rounded border border-gray-200">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full px-6 py-3.5 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all shadow-lg text-sm uppercase tracking-wide"
              >
                Ver Mis Pedidos
              </button>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full px-6 py-3.5 bg-white text-black font-bold rounded-full border border-gray-200 hover:bg-gray-50 transition-all text-sm uppercase tracking-wide"
              >
                Volver al Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS STATE
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-gray-100">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full shadow-sm">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-black text-black mb-2 uppercase tracking-tight">
            ¡Pago Exitoso!
          </h2>
          <p className="text-gray-600 mb-8 font-medium">
            Tu pedido ha sido procesado correctamente
          </p>

          {/* Order Details */}
          {orderInfo && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-100">
              <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pedido</span>
                <span className="text-sm font-black text-black">#{orderInfo.orderId}</span>
              </div>
              <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total</span>
                <span className="text-sm font-black text-green-600">
                  ${parseFloat(orderInfo.total).toFixed(2)} MXN
                </span>
              </div>
              <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Estado</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 uppercase tracking-wide">
                  {orderInfo.status || 'COMPLETED'}
                </span>
              </div>

              {/* Información de puntos si aplica */}
              {orderInfo.pointsInfo && orderInfo.pointsInfo.redeemed > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-black text-black uppercase tracking-wide">Puntos Canjeados</span>
                  </div>
                  <div className="space-y-2 text-xs font-medium text-gray-600">
                    <div className="flex justify-between">
                      <span>Usados</span>
                      <span className="font-bold text-black">{orderInfo.pointsInfo.redeemed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ahorro</span>
                      <span className="font-bold text-green-600">
                        ${parseFloat(orderInfo.pointsInfo.discount_applied || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ganados</span>
                      <span className="font-bold text-blue-600">+{orderInfo.pointsInfo.earned || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">ID Transacción</span>
                <span className="text-xs font-mono text-gray-500 break-all">
                  {orderInfo.transactionId}
                </span>
              </div>
            </div>
          )}

          {/* BOTONES DE TICKET */}
          <div className="mb-8 space-y-3">
            <button
              onClick={handleViewTicket}
              className="w-full px-6 py-3.5 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver Ticket Digital
            </button>

            <button
              onClick={handleDownloadTicket}
              className="w-full px-6 py-3.5 bg-white text-black font-bold rounded-full border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar Ticket
            </button>
          </div>

          {/* Success Message */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs font-medium text-blue-800 leading-relaxed">
              Puedes consultar el estado de tu pedido en cualquier momento.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full px-6 py-3.5 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all shadow-md flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Ver Mis Pedidos
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="w-full px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-full hover:bg-gray-200 transition-colors text-sm uppercase tracking-wide"
            >
              Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;