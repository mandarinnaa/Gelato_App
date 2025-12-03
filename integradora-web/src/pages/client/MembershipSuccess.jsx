// client/src/pages/client/MembershipSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
import paymentService from '../../api/paymentService';
import { membershipService } from '../../api/membershipService';
import Loader from '../../components/common/Loader';

const MembershipSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [membershipInfo, setMembershipInfo] = useState(null);

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
    processMembershipPayment();
  }, []);

  const processMembershipPayment = async () => {
    try {
      const token = searchParams.get('token');

      if (!token) {
        throw new Error('Token de pago no encontrado');
      }

      const membershipId = localStorage.getItem('membership_purchase_id');
      const membershipName = localStorage.getItem('membership_name');
      const membershipPrice = localStorage.getItem('membership_price');

      if (!membershipId) {
        throw new Error('Información de membresía no encontrada');
      }

      const paymentResult = await paymentService.capturePayPalOrder(token);

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Error al procesar el pago');
      }

      const upgradeResult = await membershipService.upgrade(membershipId);

      if (!upgradeResult.success) {
        throw new Error(upgradeResult.message || 'Error al activar membresía');
      }

      const token_auth = localStorage.getItem('token');
      if (upgradeResult.data && token_auth) {
        dispatch(setCredentials({
          user: upgradeResult.data,
          token: token_auth
        }));
        localStorage.setItem('user', JSON.stringify(upgradeResult.data));
      }

      setMembershipInfo({
        name: membershipName,
        price: membershipPrice,
        discount: upgradeResult.data?.membership?.discount_percent || upgradeResult.membership?.discount_percent || 0,
        points: upgradeResult.data?.membership?.points_multiplier || upgradeResult.membership?.points_multiplier || 1
      });

      localStorage.removeItem('membership_purchase_id');
      localStorage.removeItem('membership_paypal_order_id');
      localStorage.removeItem('membership_name');
      localStorage.removeItem('membership_price');

      setSuccess(true);

    } catch (err) {
      console.error('❌ Error al procesar membresía:', err);
      setError(err.message || 'Error al procesar la compra');
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex justify-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="text-center">
          <Loader text="Procesando tu membresía..." />
          <p className="mt-6 text-gray-500 text-sm font-medium uppercase tracking-wide">Por favor espera, no cierres esta ventana</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100 mx-auto">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-tight">Error en el pago</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/memberships')}
            className="w-full bg-black text-white py-3.5 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg text-sm uppercase tracking-wide"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  if (success && membershipInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-gray-100 mx-auto">
          {/* Icono de éxito */}
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Título */}
          <h1 className="text-4xl font-black text-black mb-4 uppercase tracking-tight">
            ¡Felicidades!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Tu membresía <span className="font-bold text-black">{membershipInfo.name}</span> está activa
          </p>

          {/* Beneficios */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
            <p className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide">Tus nuevos beneficios</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-3xl font-black text-black mb-1">
                  {membershipInfo.discount}%
                </p>
                <p className="text-xs font-bold text-gray-500 uppercase">Descuento</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-3xl font-black text-black mb-1">
                  {membershipInfo.points}x
                </p>
                <p className="text-xs font-bold text-gray-500 uppercase">Puntos</p>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8 text-left">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-bold mb-2 uppercase tracking-wide text-xs">¿Qué sigue?</p>
                <ul className="space-y-1.5 text-xs font-medium opacity-80">
                  <li>• Los descuentos se aplican automáticamente</li>
                  <li>• Acumularás más puntos por cada pedido</li>
                  <li>• Tu membresía se renueva cada mes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/shop')}
              className="w-full bg-black text-white py-4 rounded-full font-bold text-sm hover:bg-gray-800 transition-all hover:scale-105 shadow-lg uppercase tracking-wide"
            >
              Empezar a comprar
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-white text-gray-900 py-3.5 rounded-full font-bold hover:bg-gray-50 transition-colors border border-gray-200 text-sm uppercase tracking-wide"
            >
              Ver mi perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MembershipSuccess;