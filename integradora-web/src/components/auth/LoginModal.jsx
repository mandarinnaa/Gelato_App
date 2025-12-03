import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, onSwitchToForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, loginWithGoogle } = useAuth();

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
            setError('');
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
            await login({ email, password });
            onClose(); // Close modal on success
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            onClose(); // Close modal on success
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión con Google');
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
                        <h2 className="text-2xl font-medium text-black">Bienvenido!</h2>
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
                            ¿No tienes cuenta?{' '}
                            <button
                                onClick={onSwitchToRegister}
                                className="font-bold text-black hover:underline focus:outline-none"
                            >
                                Registrate
                            </button>
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-10 py-10 lg:px-16">
                    <div className="max-w-md w-full mx-auto">
                        <h2 className="text-3xl font-bold text-black mb-8">Login</h2>

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

                        <form onSubmit={handleSubmit} className="space-y-5">
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

                            {/* Password Field */}
                            <div className="space-y-1">
                                <label htmlFor="password" className="block text-sm font-medium text-black">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="block w-full px-0 py-2 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none transition-colors text-base text-black placeholder-gray-400 pr-10"
                                        placeholder="Contraseña"
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

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-black hover:bg-gray-900 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Iniciando...
                                    </>
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </button>

                            {/* Forgot Password */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={onSwitchToForgotPassword}
                                    className="text-xs font-bold text-black hover:underline focus:outline-none"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        </form>

                        {/* DIVIDER */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs font-medium text-gray-500">
                                <span className="px-4 bg-white">O continua con</span>
                            </div>
                        </div>

                        {/* GOOGLE BUTTON */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl text-base font-bold text-black bg-white hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
