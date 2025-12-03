import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader, Clock, Package, Truck, XCircle } from 'lucide-react';
import api from '../../api/axiosConfig';
import Alert from '../common/Alert';

const OrderStatusManager = ({ order, onClose, onStatusUpdated }) => {
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(order.delivery_status_id);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const response = await api.get('/delivery-statuses');
      setStatuses(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error al cargar estados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.delivery_status_id) {
      setAlertInfo({ type: 'warning', message: '⚠️ Por favor selecciona un estado diferente' });
      setTimeout(() => setAlertInfo({ type: '', message: '' }), 3000);
      return;
    }

    try {
      setUpdating(true);

      await api.post(`/orders/${order.id}/update-status`, {
        delivery_status_id: selectedStatus,
        notes: notes || `Estado actualizado por repartidor`,
      });

      setAlertInfo({ type: 'success', message: '✅ Estado actualizado exitosamente' });

      if (onStatusUpdated) {
        onStatusUpdated();
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setAlertInfo({ type: 'error', message: '❌ Error al actualizar el estado del pedido' });
      setTimeout(() => setAlertInfo({ type: '', message: '' }), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (statusName) => {
    const colors = {
      pendiente: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
      preparando: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      en_camino: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
      entregado: 'border-green-200 bg-green-50 hover:bg-green-100',
      cancelado: 'border-red-200 bg-red-50 hover:bg-red-100',
    };
    return colors[statusName] || 'border-gray-200 bg-gray-50 hover:bg-gray-100';
  };

  const getStatusIcon = (statusName) => {
    const icons = {
      pendiente: <Clock className="w-6 h-6 text-yellow-600" />,
      preparando: <Package className="w-6 h-6 text-blue-600" />,
      en_camino: <Truck className="w-6 h-6 text-purple-600" />,
      entregado: <CheckCircle className="w-6 h-6 text-green-600" />,
      cancelado: <XCircle className="w-6 h-6 text-red-600" />,
    };
    return icons[statusName] || <Package className="w-6 h-6 text-gray-600" />;
  };

  const getStatusTextColor = (statusName) => {
    const colors = {
      pendiente: 'text-yellow-700',
      preparando: 'text-blue-700',
      en_camino: 'text-purple-700',
      entregado: 'text-green-700',
      cancelado: 'text-red-700',
    };
    return colors[statusName] || 'text-gray-700';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 flex items-center gap-4 shadow-xl">
          <Loader className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-gray-700 font-medium">Cargando estados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Actualizar Estado
            </h2>
            <p className="text-sm text-gray-500">
              Pedido #{order.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {alertInfo.message && (
            <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo({ type: '', message: '' })} />
          )}

          {/* Current Status */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Estado Actual</p>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                {getStatusIcon(order.delivery_status?.name)}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 capitalize">
                  {order.delivery_status?.name?.replace('_', ' ') || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {order.delivery_status?.description || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4">
              Seleccionar Nuevo Estado
            </label>
            <div className="grid grid-cols-1 gap-3">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status.id)}
                  disabled={status.id === order.delivery_status_id}
                  className={`
                    relative flex items-center gap-4 p-4 rounded-xl border transition-all text-left group
                    ${selectedStatus === status.id
                      ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                      : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                    }
                    ${status.id === order.delivery_status_id
                      ? 'opacity-50 cursor-not-allowed bg-gray-50'
                      : 'cursor-pointer'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${selectedStatus === status.id ? 'bg-white shadow-sm' : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'}
                  `}>
                    {getStatusIcon(status.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${selectedStatus === status.id ? 'text-emerald-900' : 'text-gray-900'
                      }`}>
                      {status.name.charAt(0).toUpperCase() + status.name.slice(1).replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {status.description}
                    </p>
                  </div>

                  {selectedStatus === status.id && status.id !== order.delivery_status_id && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe una nota sobre este cambio..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={updating}
            className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={updating || selectedStatus === order.delivery_status_id}
            className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
          >
            {updating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Confirmar Cambio</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusManager;