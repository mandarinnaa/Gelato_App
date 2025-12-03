import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

const ResetPasswordModal = ({ isOpen, onClose, onSwitchToLogin, token, email }) => {
    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [tokenValid, setTokenValid] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({ password: '', password_confirmation: '' });
            setSuccess(false);
            setError('');
            setVerifying(true);
            setTokenValid(false);

            if (token && email) {
                verifyToken();
            } else {
                setVerifying(false);
                setError('Link de restablecimiento inválido');
            }
        }
    }, [isOpen, token, email]);

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

    const verifyToken = async () => {
        try {
            const response = await api.post('/password/verify-token', { token, email });
            if (response.data.success) {
                setTokenValid(true);
                setUserInfo(response.data.data);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'El link de restablecimiento es inválido o ha expirado'
            );
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password_confirmation) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/password/reset', {
                token,
                email,
                password: formData.password,
                password_confirmation: formData.password_confirmation
            });

            if (response.data.success) {
                setSuccess(true);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.errors?.password?.[0] ||
                'Error al restablecer la contraseña'
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
                        <h2 className="text-2xl font-medium text-black">Nueva Contraseña</h2>
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
                            ¿Ya tienes cuenta?{' '}
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

                        {verifying ? (
                            <div className="text-center py-10">
                                <svg className="animate-spin h-10 w-10 text-black mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-600 font-medium">Verificando enlace...</p>
                            </div>
                        ) : success ? (
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-black mb-4">
                                    ¡Contraseña Actualizada!
                                </h2>
                                <p className="text-gray-600 mb-8">
                                    Tu contraseña ha sido restablecida exitosamente.
                                </p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onSwitchToLogin();
                                    }}
                                    className="w-full px-6 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-black hover:bg-gray-900 transition-all duration-300"
                                >
                                    Iniciar Sesión Ahora
                                </button>
                            </div>
                        ) : !tokenValid ? (
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-black mb-4">
                                    Enlace Inválido
                                </h2>
                                <p className="text-gray-600 mb-8">
                                    {error || 'El enlace de restablecimiento es inválido o ha expirado.'}
                                </p>
                                <button
                                    onClick={onClose}
                                    className="w-full px-6 py-3.5 border border-gray-300 text-base font-bold rounded-xl text-black hover:bg-gray-50 transition-all duration-300"
                                >
                                    Cerrar
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-black mb-2">Restablecer Contraseña</h2>
                                <p className="text-gray-600 mb-8">
                                    Ingresa tu nueva contraseña a continuación.
                                </p>

                                {/* Google User Info */}
                                {userInfo?.is_google_user && (
                                    <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        </svg>
                                        <div className="text-sm text-blue-800">
                                            <p className="font-bold mb-1">Cuenta vinculada con Google</p>
                                            <p>Podrás seguir usando Google o usar esta nueva contraseña.</p>
                                        </div>
                                    </div>
                                )}

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
                                    {/* Email Display */}
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                        <p className="text-sm text-gray-600">
                                            Para: <span className="font-bold text-black">{email}</span>
                                        </p>
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-black">
                                            Nueva Contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                className="block w-full px-0 py-2 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors text-base text-black placeholder-gray-400 pr-10"
                                                placeholder="Mínimo 8 caracteres"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-0 top-2 text-gray-400 hover:text-black transition-colors"
                                            >
                                                {showPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-black">
                                            Confirmar Contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={formData.password_confirmation}
                                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                                required
                                                className="block w-full px-0 py-2 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors text-base text-black placeholder-gray-400 pr-10"
                                                placeholder="Repite tu contraseña"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-0 top-2 text-gray-400 hover:text-black transition-colors"
                                            >
                                                {showConfirmPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                )}
                                            </button>
                                        </div>
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
                                                Guardando...
                                            </>
                                        ) : (
                                            'Restablecer Contraseña'
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

export default ResetPasswordModal;
