import React from 'react';
import Modal from './Modal';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDestructive = false
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="mb-6">
                <p className="text-gray-600 font-medium">{message}</p>
            </div>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                    {cancelText}
                </button>
                <button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className={`px-4 py-2 text-sm font-bold text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${isDestructive
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-black hover:bg-gray-800'
                        }`}
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
