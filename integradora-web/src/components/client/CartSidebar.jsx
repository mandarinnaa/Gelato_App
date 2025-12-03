import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';

// Componente de Item de Carrito con Estado Local para evitar flickering
const CartItem = ({ item, updateQuantity, removeItem }) => {
    const [localQuantity, setLocalQuantity] = useState(item.quantity);

    // Sincronizar con props solo si la diferencia es grande (ej. actualización externa)
    // o si es la primera carga. Pero evitamos sobrescribir mientras el usuario edita.
    useEffect(() => {
        setLocalQuantity(item.quantity);
    }, [item.quantity]);

    // Debounce para actualizar el carrito global
    const debouncedUpdate = useCallback(
        (id, qty) => {
            const handler = setTimeout(() => {
                updateQuantity(id, qty);
            }, 500);
            return () => clearTimeout(handler);
        },
        [updateQuantity]
    );

    // Ref para guardar la función de limpieza del debounce
    const debounceCleanup = useRef(null);

    const handleQuantityChange = (newQty) => {
        if (newQty < 1) return;
        if (item.type === 'base' && item.product?.stock && newQty > item.product.stock) return;

        // 1. Actualizar estado local inmediatamente (Feedback instantáneo)
        setLocalQuantity(newQty);

        // 2. Cancelar timeout anterior
        if (debounceCleanup.current) debounceCleanup.current();

        // 3. Programar nuevo update
        debounceCleanup.current = debouncedUpdate(item.id, newQty);
    };

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex gap-4">
            {/* Image */}
            <div className="w-20 h-20 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
                {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-black truncate pr-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {item.name}
                    </h4>
                    <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 -mr-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

                <div className="text-xs text-gray-500 space-y-0.5 mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {item.flavor && <p>Sabor: {item.flavor}</p>}
                    {item.size && item.size !== 'N/A' && <p>Tamaño: {item.size}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1.5">
                        <button
                            onClick={() => handleQuantityChange(localQuantity - 1)}
                            disabled={localQuantity <= 1}
                            className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-black hover:bg-[#E53935] hover:text-white disabled:opacity-50 transition-all active:scale-95"
                        >
                            <span className="text-lg font-medium">-</span>
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{localQuantity}</span>
                        <button
                            onClick={() => handleQuantityChange(localQuantity + 1)}
                            disabled={item.type === 'base' && item.product?.stock && localQuantity >= item.product.stock}
                            className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-black hover:bg-[#E53935] hover:text-white disabled:opacity-50 transition-all active:scale-95"
                        >
                            <span className="text-lg font-medium">+</span>
                        </button>
                    </div>
                    <p className="text-sm font-bold text-black">
                        ${parseFloat(item.subtotal).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
};

const CartSidebar = ({ isOpen, onClose }) => {
    const { items, total, loading, fetchCart, updateQuantity, removeItem, clearCart } = useCart();
    const navigate = useNavigate();
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        isDestructive: false
    });

    // Cargar carrito al montar
    useEffect(() => {
        if (isOpen) {
            fetchCart();
        }
    }, [isOpen]);

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    const handleRemove = async (itemId) => {
        await removeItem(itemId);
    };

    const handleClear = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Vaciar carrito',
            message: '¿Estás seguro de que deseas vaciar todo el carrito?',
            onConfirm: async () => {
                await clearCart();
            },
            isDestructive: true
        });
    };

    // Función para calcular la entrega estimada
    const getEstimatedDeliveryTime = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const OPENING_HOUR = 8;
        const CLOSING_HOUR = 20;

        if (currentHour >= OPENING_HOUR && currentHour < CLOSING_HOUR) {
            return 'Hoy (durante horario de atención)';
        } else if (currentHour >= CLOSING_HOUR) {
            return 'Mañana a partir de las 8:00 AM';
        } else {
            return 'Hoy a partir de las 8:00 AM';
        }
    };

    const shippingCost = 50;
    const finalTotal = parseFloat(total) + shippingCost;

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel */}
            <aside
                className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[70] transform transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">

                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                        <div>
                            <h2
                                className="text-2xl font-black text-black uppercase tracking-tight"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                                Tu Carrito
                            </h2>
                            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                {items?.length || 0} producto{items?.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {items && items.length > 0 && (
                                <button
                                    onClick={handleClear}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Vaciar carrito"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        {loading && !items ? (
                            <div className="flex justify-center py-10">
                                <Loader text="Cargando..." />
                            </div>
                        ) : !items || items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-black mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                        Tu carrito está vacío
                                    </h3>
                                    <p className="text-sm text-gray-500" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                        ¡Agrega algunos postres deliciosos!
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        onClose();
                                        navigate('/shop');
                                    }}
                                    className="px-6 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors uppercase tracking-wide"
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    Ir a la Tienda
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map(item => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        updateQuantity={updateQuantity}
                                        removeItem={handleRemove}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items && items.length > 0 && (
                        <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <div className="space-y-2 mb-4 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${parseFloat(total).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Envío estimado</span>
                                    <span>${shippingCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 font-medium">
                                    <span>Entrega estimada:</span>
                                    <span>{getEstimatedDeliveryTime()}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-black pt-2 border-t border-gray-200 mt-2">
                                    <span>Total</span>
                                    <span>${finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-3.5 text-white font-bold rounded-full transition-all duration-300 uppercase tracking-wide text-sm shadow-lg"
                                    style={{ fontFamily: "'Montserrat', sans-serif", backgroundColor: '#E53935' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c62828'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E53935'}
                                >
                                    Proceder al Pago
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3.5 text-white font-bold rounded-full transition-colors uppercase tracking-wide text-sm"
                                    style={{ fontFamily: "'Montserrat', sans-serif", backgroundColor: '#000000' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000000'}
                                >
                                    Seguir Comprando
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
            />
        </>
    );
};

export default CartSidebar;