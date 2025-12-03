import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop con blur */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
      
      {/* Modal Container */}
      <div 
        className={`relative bg-white rounded-2xl ${sizeClasses[size]} w-full shadow-xl transform animate-slideUp`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header minimalista */}
        <div className="flex items-start justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-900 pr-8">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all duration-200 -mr-2 -mt-2 p-2 rounded-lg hover:bg-gray-100 group"
            aria-label="Cerrar"
          >
            <svg 
              className="w-5 h-5 group-hover:scale-110 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-2 text-gray-600 leading-relaxed max-h-[60vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer minimalista */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 pt-4">
            {footer}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default Modal;