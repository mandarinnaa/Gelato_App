import React from 'react';
import { MapPin, Clock, Package, User, Phone } from 'lucide-react';

const DeliveryOrderCard = ({ order, onUpdateStatus, onViewDetails }) => {
  const getStatusBadge = (status) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      preparando: 'bg-blue-100 text-blue-800',
      en_camino: 'bg-purple-100 text-purple-800',
      entregado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
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

  const canUpdateToInTransit = order.delivery_status?.name === 'preparando';
  const canUpdateToDelivered = order.delivery_status?.name === 'en_camino';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Pedido #{order.id}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
            order.delivery_status?.name
          )}`}
        >
          {getStatusText(order.delivery_status?.name)}
        </span>
      </div>

      {/* Customer Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-700">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm">{order.user?.name}</span>
        </div>
        
        {order.user?.phone && (
          <div className="flex items-center text-gray-700">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <a 
              href={`tel:${order.user.phone}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {order.user.phone}
            </a>
          </div>
        )}

        <div className="flex items-start text-gray-700">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
          <span className="text-sm">
            {order.address?.street}, {order.address?.colony}
            {order.address?.reference && (
              <span className="block text-xs text-gray-500 mt-1">
                Ref: {order.address.reference}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="border-t pt-3 mb-4">
        <div className="flex items-center text-gray-600 mb-2">
          <Package className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">
            {order.order_items?.length || 0} productos
          </span>
        </div>
        <div className="text-lg font-bold text-gray-900">
          ${parseFloat(order.total).toFixed(2)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(order)}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Ver Detalles
        </button>
        
        {canUpdateToInTransit && (
          <button
            onClick={() => onUpdateStatus(order.id, 'en_camino')}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            En Camino
          </button>
        )}
        
        {canUpdateToDelivered && (
          <button
            onClick={() => onUpdateStatus(order.id, 'entregado')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Entregado
          </button>
        )}
      </div>
    </div>
  );
};

export default DeliveryOrderCard;