import React from 'react';
import { X, MapPin, User, Phone, Package, CreditCard, Clock } from 'lucide-react';

const DeliveryOrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'text-yellow-600',
      preparando: 'text-blue-600',
      en_camino: 'text-purple-600',
      entregado: 'text-green-600',
      cancelado: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const getStatusText = (status) => {
    const texts = {
      pendiente: 'Pendiente',
      preparando: 'Preparando',
      en_camino: 'En Camino',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
    };
    return texts[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Detalles del Pedido #{order.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estado Actual</span>
              <span className={`text-lg font-semibold ${getStatusColor(order.delivery_status?.name)}`}>
                {getStatusText(order.delivery_status?.name)}
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Cliente</h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-700">
                <User className="w-5 h-5 mr-3 text-gray-400" />
                <span>{order.user?.name}</span>
              </div>
              {order.user?.phone && (
                <div className="flex items-center text-gray-700">
                  <Phone className="w-5 h-5 mr-3 text-gray-400" />
                  <a 
                    href={`tel:${order.user.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {order.user.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Dirección de Entrega</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">
                    {order.address?.street}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {order.address?.colony}, {order.address?.city}
                  </p>
                  {order.address?.postal_code && (
                    <p className="text-gray-600 text-sm">
                      CP: {order.address.postal_code}
                    </p>
                  )}
                  {order.address?.reference && (
                    <p className="text-gray-600 text-sm mt-2">
                      <span className="font-medium">Referencia:</span> {order.address.reference}
                    </p>
                  )}
                  {/* Google Maps Link */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${order.address?.street}, ${order.address?.colony}, ${order.address?.city}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-600 hover:underline text-sm font-medium"
                  >
                    Abrir en Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Productos</h3>
            <div className="border rounded-lg divide-y">
              {order.order_items?.map((item, index) => (
                <div key={index} className="p-4 flex justify-between items-center">
                  <div className="flex items-center flex-1">
                    <Package className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${parseFloat(item.subtotal).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${parseFloat(item.unit_price).toFixed(2)} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-gray-600">
                <CreditCard className="w-5 h-5 mr-2" />
                <span className="text-sm">Método de Pago</span>
              </div>
              <span className="font-medium text-gray-900">
                {order.payment_method?.name || 'PayPal'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                ${parseFloat(order.total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Order Date */}
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Pedido realizado el{' '}
              {new Date(order.created_at).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderDetailModal;