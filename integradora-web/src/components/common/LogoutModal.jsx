import React from 'react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
      `}</style>

            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 animate-fadeIn backdrop-blur-sm"
                onClick={onClose}
            >
                {/* Modal */}
                <div
                    className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-scaleIn border border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="pt-8 pb-4 px-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <h3
                            className="text-2xl font-bold text-gray-900"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            Cerrar Sesión
                        </h3>
                    </div>

                    {/* Body */}
                    <div className="px-8 pb-8">
                        <p
                            className="text-gray-500 text-center mb-8 text-sm leading-relaxed"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            ¿Estás seguro que deseas salir de tu cuenta?
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-white text-gray-700 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="flex-1 px-4 py-3 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-lg shadow-gray-200"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LogoutModal;
