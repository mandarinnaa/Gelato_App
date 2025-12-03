// client/src/pages/client/Memberships.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useMemberships } from '../../hooks/useMemberships';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { membershipService } from '../../api/membershipService';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { useModal } from '../../context/ModalContext'; // ✅ Import Context

const Memberships = () => {
    const dispatch = useDispatch();
    const { memberships, userMembership, loading, error } = useMemberships();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const { openLogin } = useModal(); // ✅ Use Context

    const [selectedMembership, setSelectedMembership] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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

    const handlePurchase = async (membership) => {
        if (!isAuthenticated) {
            openLogin(); // ✅ Open Modal instead of alert/redirect
            return;
        }

        if (user?.membership_id === membership.id) {
            setErrorMessage('Ya tienes esta membresía activa');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        setSelectedMembership(membership);
    };

    const handlePayWithPayPal = async () => {
        if (!selectedMembership) return;

        setProcessingPayment(true);
        setErrorMessage('');

        try {
            const paypalOrder = await membershipService.createPayPalOrder(selectedMembership.id);

            if (!paypalOrder.success || !paypalOrder.approval_url) {
                throw new Error(paypalOrder.message || 'Error al crear orden en PayPal');
            }

            localStorage.setItem('membership_purchase_id', selectedMembership.id.toString());
            localStorage.setItem('membership_paypal_order_id', paypalOrder.order_id);
            localStorage.setItem('membership_name', selectedMembership.name);
            localStorage.setItem('membership_price', selectedMembership.price.toString());

            window.location.href = paypalOrder.approval_url;

        } catch (err) {
            console.error('❌ Error al procesar pago de membresía:', err);
            setErrorMessage(err.message || 'Error al procesar el pago con PayPal');
            setProcessingPayment(false);
        }
    };

    if (loading && memberships.length === 0) {
        return <Loader text="Cargando membresías..." />;
    }

    const filteredMemberships = memberships.filter(m => m.id === 2 || m.id === 3);
    const sortedMemberships = [...filteredMemberships].sort((a, b) =>
        parseFloat(a.price) - parseFloat(b.price)
    );

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {/* Hero Section */}
            <section className="relative bg-white overflow-hidden pt-16 pb-12 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                            Club Exclusivo
                        </p>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-black mb-6 leading-tight uppercase tracking-tight">
                            Membresías
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Únete a nuestro club exclusivo y disfruta de increíbles beneficios, descuentos y recompensas en todos tus pedidos.
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Messages */}
                {successMessage && (
                    <div className="mb-8">
                        <Alert type="success" message={successMessage} />
                    </div>
                )}
                {(error || errorMessage) && (
                    <div className="mb-8">
                        <Alert type="error" message={error || errorMessage} />
                    </div>
                )}

                {/* Current Membership Status */}
                {isAuthenticated && userMembership && (
                    <div className="mb-16 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
                                        Tu membresía actual
                                    </p>
                                    <p className="text-2xl font-black text-black">
                                        {userMembership.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex gap-4">
                                    <div className="bg-gray-50 rounded-lg px-5 py-3 border border-gray-100">
                                        <p className="text-xl font-bold text-black">
                                            {userMembership.discount_percent}%
                                        </p>
                                        <p className="text-xs font-bold text-gray-500 uppercase">Descuento</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg px-5 py-3 border border-gray-100">
                                        <p className="text-xl font-bold text-black">
                                            {userMembership.points_multiplier}x
                                        </p>
                                        <p className="text-xs font-bold text-gray-500 uppercase">Puntos</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/my-membership')}
                                    className="px-6 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg uppercase tracking-wide"
                                >
                                    Administrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Memberships Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
                    {sortedMemberships.map((membership, index) => {
                        const isCurrentMembership = user?.membership_id === membership.id;

                        return (
                            <div
                                key={membership.id}
                                className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border ${isCurrentMembership ? 'border-black ring-1 ring-black' : 'border-gray-200'
                                    }`}
                            >
                                {/* Header */}
                                <div className="p-8 pb-0">
                                    <h3 className="text-2xl font-black text-black mb-2 uppercase tracking-tight">
                                        {membership.name}
                                    </h3>
                                    <div className="flex items-baseline mb-6">
                                        <span className="text-4xl font-bold text-black">
                                            ${parseFloat(membership.price).toFixed(2)}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-2 font-medium">
                                            /mes
                                        </span>
                                    </div>
                                    <div className="h-px w-full bg-gray-100"></div>
                                </div>

                                {/* Benefits */}
                                <div className="p-8 space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-black">
                                                {membership.discount_percent}% OFF
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Descuento en todos tus pedidos
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-black">
                                                {membership.points_multiplier}x Puntos
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Acumula puntos más rápido
                                            </p>
                                        </div>
                                    </div>

                                    {membership.min_spent > 0 && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-black">
                                                    Gasto mínimo
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    ${parseFloat(membership.min_spent).toFixed(2)} por mes
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="p-8 pt-0">
                                    {isCurrentMembership ? (
                                        <div className="w-full bg-gray-100 text-gray-600 py-4 rounded-full text-center font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>Membresía Activa</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handlePurchase(membership)}
                                            className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-wide text-sm transform transition-all duration-300 hover:bg-gray-800 hover:scale-105 shadow-lg"
                                        >
                                            Adquirir Ahora
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
                    <h2 className="text-3xl font-black text-black mb-12 text-center uppercase tracking-tight">
                        ¿Cómo funciona?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl shadow-lg">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-black mb-2 uppercase tracking-wide">
                                        Elige tu plan
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Selecciona entre Premium o VIP según tus necesidades y frecuencia de compra.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl shadow-lg">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-black mb-2 uppercase tracking-wide">
                                        Pago seguro
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Realiza el pago de forma segura con PayPal o tarjeta de crédito/débito.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl shadow-lg">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-black mb-2 uppercase tracking-wide">
                                        Disfruta beneficios
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Todos tus pedidos tendrán descuento automático y acumularás más puntos.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl shadow-lg">
                                    4
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-black mb-2 uppercase tracking-wide">
                                        Flexibilidad total
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Puedes cambiar de plan o cancelar tu suscripción en cualquier momento.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {selectedMembership && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-fade-in-up">
                        <h3 className="text-2xl font-black text-black mb-6 uppercase tracking-tight text-center">
                            Confirmar Compra
                        </h3>

                        <div className="mb-8 space-y-4">
                            <p className="text-gray-600 text-center">
                                Estás a punto de adquirir la membresía:
                            </p>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                                <p className="text-xl font-black text-black uppercase mb-2">{selectedMembership.name}</p>
                                <p className="text-3xl font-bold text-black">
                                    ${parseFloat(selectedMembership.price).toFixed(2)} <span className="text-sm font-medium text-gray-500">/mes</span>
                                </p>
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                Serás redirigido a PayPal para completar tu pago de forma segura.
                            </p>
                        </div>

                        {errorMessage && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 font-medium">
                                {errorMessage}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setSelectedMembership(null)}
                                className="flex-1 bg-gray-100 text-gray-800 py-3.5 rounded-full font-bold hover:bg-gray-200 transition-colors text-sm uppercase tracking-wide"
                                disabled={processingPayment}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handlePayWithPayPal}
                                className="flex-1 bg-[#0070BA] text-white py-3.5 rounded-full font-bold hover:bg-[#003087] transition-colors flex items-center justify-center text-sm uppercase tracking-wide shadow-lg"
                                disabled={processingPayment}
                            >
                                {processingPayment ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando
                                    </>
                                ) : (
                                    <div className="flex items-center">
                                        <span className="mr-2">Pagar con</span>
                                        <svg className="h-4 w-auto" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.946 5.05-4.336 6.794-9.116 6.794H9.468a.522.522 0 0 0-.512.425l-.794 5.04c-.035.22-.224.4-.448.4h-2.638c-.3 0-.53-.26-.48-.56l.807-5.115h1.573l-1.9 11.9z" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Memberships;
