import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipService } from '../../api/membershipService';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MyMembership = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [membershipData, setMembershipData] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [processing, setProcessing] = useState(false);

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

    const fetchMembershipData = async () => {
        try {
            setLoading(true);
            const response = await membershipService.getCurrentMembership();

            if (response.success) {
                if (!response.has_membership) {
                    navigate('/memberships');
                    return;
                }
                setMembershipData(response.data);
            } else {
                setError(response.message || 'Error al cargar información de membresía');
            }
        } catch (err) {
            console.error('Error fetching membership:', err);
            setError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembershipData();
    }, [navigate]);

    const handleCancelMembership = async () => {
        try {
            setProcessing(true);
            const response = await membershipService.cancelMembership();

            if (response.success) {
                setSuccessMessage(response.message);
                setShowCancelModal(false);
                fetchMembershipData();
            } else {
                setError(response.message);
            }
        } catch (err) {
            console.error('Error cancelling membership:', err);
            setError('Error al cancelar la membresía');
        } finally {
            setProcessing(false);
        }
    };

    const handleReactivateMembership = async () => {
        try {
            setProcessing(true);
            const response = await membershipService.reactivateMembership();

            if (response.success) {
                setSuccessMessage(response.message);
                fetchMembershipData();
            } else {
                setError(response.message);
            }
        } catch (err) {
            console.error('Error reactivating membership:', err);
            setError('Error al reactivar la membresía');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <Loader text="Cargando tu membresía..." />;

    if (!membershipData) return null;

    const { membership, expires_at, is_cancelled, days_remaining } = membershipData;
    const isPremium = membership.id === 2;

    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Tu Cuenta
                    </p>
                    <h1 className="text-4xl font-black text-black uppercase tracking-tight">
                        Mi Membresía
                    </h1>
                </div>

                {successMessage && (
                    <div className="mb-8">
                        <Alert type="success" message={successMessage} />
                    </div>
                )}

                {error && (
                    <div className="mb-8">
                        <Alert type="error" message={error} />
                    </div>
                )}

                {/* Tarjeta Principal */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    {/* Header */}
                    <div className="p-8 md:p-10 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        Plan Actual
                                    </span>
                                    {is_cancelled && (
                                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                            Cancelada
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-4xl font-black text-black mb-2 uppercase tracking-tight">
                                    {membership.name}
                                </h2>
                                <p className="text-gray-600 text-lg font-medium">
                                    ${parseFloat(membership.price).toFixed(2)} <span className="text-sm text-gray-400">/ mes</span>
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 md:text-right w-full md:w-auto">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Próxima renovación</p>
                                <p className="text-xl font-bold text-black mb-1">
                                    {format(new Date(expires_at), "d 'de' MMMM, yyyy", { locale: es })}
                                </p>
                                <p className={`text-sm font-bold ${days_remaining < 7 ? 'text-red-500' : 'text-green-600'}`}>
                                    {days_remaining} días restantes
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 md:p-10">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Beneficios */}
                            <div>
                                <h3 className="text-lg font-bold text-black mb-6 uppercase tracking-wide">
                                    Tus Beneficios Activos
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center p-4 rounded-xl bg-gray-50 border border-gray-100 transition-all hover:shadow-md">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-xl font-black text-black border border-gray-100">
                                            %
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-xl font-bold text-black">
                                                {membership.discount_percent}% OFF
                                            </p>
                                            <p className="text-sm text-gray-600 font-medium">En todos tus pedidos</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 rounded-xl bg-gray-50 border border-gray-100 transition-all hover:shadow-md">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-xl font-black text-black border border-gray-100">
                                            x{membership.points_multiplier}
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-xl font-bold text-black">
                                                Puntos Extra
                                            </p>
                                            <p className="text-sm text-gray-600 font-medium">Multiplicador de puntos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estado y Acciones */}
                            <div className="flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-black mb-6 uppercase tracking-wide">
                                        Configuración
                                    </h3>
                                    <div className="bg-white p-0">
                                        {is_cancelled ? (
                                            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                                                <div className="flex items-center text-red-700 mb-3">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    <span className="font-bold text-sm uppercase tracking-wide">Renovación Cancelada</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                                    Tu membresía finalizará el {format(new Date(expires_at), "d 'de' MMMM", { locale: es })}.
                                                    Puedes reactivarla antes de esa fecha para no perder tus beneficios.
                                                </p>
                                                <button
                                                    onClick={handleReactivateMembership}
                                                    disabled={processing}
                                                    className="w-full bg-black text-white py-3.5 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg text-sm uppercase tracking-wide"
                                                >
                                                    {processing ? 'Procesando...' : 'Reactivar Membresía'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                                <div className="flex items-center text-green-700 mb-3">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="font-bold text-sm uppercase tracking-wide">Renovación Automática</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                                    Tu próximo pago se procesará automáticamente el {format(new Date(expires_at), "d 'de' MMMM", { locale: es })}.
                                                </p>
                                                <button
                                                    onClick={() => setShowCancelModal(true)}
                                                    className="text-red-600 text-xs font-bold hover:text-red-800 uppercase tracking-wide transition-colors"
                                                >
                                                    Cancelar renovación automática
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upgrade Option (Only for Premium) */}
                                {isPremium && !is_cancelled && (
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <button
                                            onClick={() => navigate('/memberships')}
                                            className="w-full bg-white border-2 border-black text-black py-3.5 rounded-full font-bold hover:bg-black hover:text-white transition-all text-sm uppercase tracking-wide"
                                        >
                                            Mejorar a VIP
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Cancelación */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-fade-in-up">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-black mb-3 uppercase tracking-tight">¿Estás seguro?</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Si cancelas ahora, seguirás disfrutando de tus beneficios hasta el <span className="font-bold text-black">{format(new Date(expires_at), "d 'de' MMMM")}</span>, pero tu membresía no se renovará automáticamente.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={processing}
                                className="flex-1 bg-gray-100 text-gray-800 py-3.5 rounded-full font-bold hover:bg-gray-200 transition-colors text-sm uppercase tracking-wide"
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleCancelMembership}
                                disabled={processing}
                                className="flex-1 bg-red-600 text-white py-3.5 rounded-full font-bold hover:bg-red-700 transition-colors text-sm uppercase tracking-wide shadow-lg"
                            >
                                {processing ? '...' : 'Sí, Cancelar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyMembership;
