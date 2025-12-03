import React, { useState, useEffect } from 'react';

const DollarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PaymentModal = ({ isOpen, onClose, total, onConfirmPayment }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setAmountPaid('');
      setChange(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const paid = parseFloat(amountPaid) || 0;
    const calculatedChange = paid - total;
    setChange(calculatedChange >= 0 ? calculatedChange : 0);
  }, [amountPaid, total]);

  const handleQuickAmount = (amount) => {
    setAmountPaid(amount.toString());
  };

  const handleExactAmount = () => {
    setAmountPaid(total.toFixed(2));
  };

  const handleConfirm = () => {
    const paid = parseFloat(amountPaid) || 0;
    if (paid >= total) {
      onConfirmPayment(paid, change);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && parseFloat(amountPaid) >= total) {
      handleConfirm();
    }
  };

  const quickAmounts = [50, 100, 200, 500, 1000];
  const isValidPayment = parseFloat(amountPaid) >= total;
  const isInsufficientPayment = amountPaid !== '' && parseFloat(amountPaid) < total;

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>

      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <DollarIcon />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Procesar Pago</h3>
                  <p className="text-sm text-slate-200">Ingresa el monto recibido</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Total a Pagar */}
            <div className="bg-slate-900 text-white rounded-xl p-5">
              <p className="text-sm opacity-80 mb-1">Total a Pagar</p>
              <p className="text-4xl font-bold">${total.toFixed(2)}</p>
            </div>

            {/* Monto Recibido */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monto Recibido
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-semibold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="0.00"
                  autoFocus
                  className={`w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    isInsufficientPayment
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50'
                      : isValidPayment
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50'
                      : 'border-gray-300 focus:border-slate-900 focus:ring-slate-200'
                  }`}
                />
              </div>
              {isInsufficientPayment && (
                <p className="text-red-600 text-sm mt-2 font-medium">
                  El monto es insuficiente. Faltan ${(total - parseFloat(amountPaid)).toFixed(2)}
                </p>
              )}
            </div>

            {/* Botones de Monto Rápido */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Montos Rápidos
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleExactAmount}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
                >
                  Exacto
                </button>
                {quickAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Cambio */}
            {isValidPayment && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-5 animate-scale-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Cambio a Devolver</p>
                    <p className="text-4xl font-bold">${change.toFixed(2)}</p>
                  </div>
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <CheckIcon />
                  </div>
                </div>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isValidPayment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 flex items-center justify-center gap-2"
              >
                <CheckIcon />
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;