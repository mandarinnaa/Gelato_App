import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

const ForgotPasswordModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setError('');
            setSuccess(false);
        }
    }, [isOpen]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/password/forgot', { email });
            if (response.data.success) {
                setSuccess(true);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.errors?.email?.[0] ||
                'Error al enviar el correo. Inténtalo de nuevo.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col lg:flex-row min-h-[550px] animate-in fade-in zoom-in duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-black transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Left Side - Brand Panel */}
                <div className="w-full lg:w-1/2 bg-[#F3F0E7] flex flex-col justify-between p-10 relative">
                    {/* Top Text */}
                    <div>
                        <h2 className="text-2xl font-medium text-black">Recuperar Acceso</h2>
                    </div>

                    {/* Center Brand */}
                    <div className="flex items-baseline justify-center">
                        <h1 className="text-7xl xl:text-8xl font-black text-black tracking-tighter">Gelato</h1>
                        <img
                            src="/choco-2.png"
                            alt="."
                            className="w-10 h-10 xl:w-12 xl:h-12 ml-1 object-contain translate-y-2"
                        />
                    </div>

                    {/* Bottom Link */}
                    <div>
                        <p className="text-sm font-medium text-gray-600">
                            ¿Ya recordaste tu contraseña?{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="font-bold text-black hover:underline focus:outline-none"
                            >
                                Inicia sesión
                            </button>
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-10 py-10 lg:px-16">
                    <div className="max-w-md w-full mx-auto">

                        {success ? (
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-black mb-4">
                                    ¡Correo enviado!
                                </h2>
                                <p className="text-gray-600 mb-8">
                                    Hemos enviado las instrucciones de recuperación a <span className="font-bold text-black">{email}</span>
                                </p>
                                <button
                                    onClick={onSwitchToLogin}
                                    className="w-full px-6 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-black hover:bg-gray-900 transition-all duration-300"
                                >
                                    Volver al inicio de sesión
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-black mb-4">¿Olvidaste tu contraseña?</h2>
                                <p className="text-gray-600 mb-8">
                                    No te preocupes, ingresa tu correo y te enviaremos las instrucciones.
                                </p>

                                {/* Error Alert */}
                                {error && (
                                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-bold text-red-800 uppercase">Error</p>
                                            <p className="text-sm text-red-600 mt-1 font-medium">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Email Field */}
                                    <div className="space-y-1">
                                        <label htmlFor="email" className="block text-sm font-medium text-black">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="block w-full px-0 py-2 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors text-base text-black placeholder-gray-400"
                                            placeholder="ejemplo@hotmail.com"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-black hover:bg-gray-900 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Enviando...
                                            </>
                                        ) : (
                                            'Enviar instrucciones'
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
