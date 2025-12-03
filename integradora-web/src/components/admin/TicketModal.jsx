import React from 'react';

// Iconos SVG
const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PrintIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TicketModal = ({ isOpen, onClose, saleId, onPrint, onDownload, onView }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Estilos para la animación */}
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.15s ease-out;
        }
      `}</style>

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckIcon />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Venta Completada</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Venta #{saleId}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-6">
              ¿Qué deseas hacer con el ticket de venta?
            </p>

            <div className="space-y-2">
              {/* Botón Imprimir */}
              <button
                onClick={onPrint}
                className="w-full flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
              >
                <div className="flex-shrink-0 text-gray-700">
                  <PrintIcon />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Imprimir Ticket</p>
                  <p className="text-xs text-gray-500 mt-0.5">Imprime directamente el ticket</p>
                </div>
              </button>

              {/* Botón Ver Ticket */}
              <button
                onClick={onView}
                className="w-full flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
              >
                <div className="flex-shrink-0 text-gray-700">
                  <EyeIcon />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Ver Ticket</p>
                  <p className="text-xs text-gray-500 mt-0.5">Abre el ticket en nueva ventana</p>
                </div>
              </button>

              {/* Botón Descargar */}
              <button
                onClick={onDownload}
                className="w-full flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
              >
                <div className="flex-shrink-0 text-gray-700">
                  <DownloadIcon />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Descargar PDF</p>
                  <p className="text-xs text-gray-500 mt-0.5">Guarda el ticket en tu dispositivo</p>
                </div>
              </button>
            </div>

            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              className="w-full mt-6 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketModal;