import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Package,
  MapPin,
  Phone,
  User,
  RefreshCw,
  Eye,
  MessageCircle,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import DeliveryOrderDetailModal from '../../components/delivery/DeliveryOrderDetailModal';
import OrderStatusManager from '../../components/delivery/OrderStatusManager';
import ChatModal from '../../components/common/ChatModal';
import Loader from '../../components/common/Loader';
import { orderService } from '../../api/orderService';

const DeliveryOrders = () => {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToChangeStatus, setOrderToChangeStatus] = useState(null);
  const [filter, setFilter] = useState('active');
  const [chatOrder, setChatOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [user, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll({
        delivery_person_id: user?.id,
      });

      let fetchedOrders = response.data?.data || response.data || [];

      if (filter === 'active') {
        fetchedOrders = fetchedOrders.filter(
          (o) =>
            o.delivery_status?.name !== 'entregado' &&
            o.delivery_status?.name !== 'cancelado'
        );
      }

      fetchedOrders.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'text-yellow-600 bg-yellow-50 border-yellow-100',
      preparando: 'text-blue-600 bg-blue-50 border-blue-100',
      en_camino: 'text-purple-600 bg-purple-50 border-purple-100',
      entregado: 'text-green-600 bg-green-50 border-green-100',
      cancelado: 'text-red-600 bg-red-50 border-red-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-100';
  };

  const getStatusText = (status) => {
    const texts = {
      pendiente: 'Pendiente',
      preparando: 'En Preparación',
      en_camino: 'En Camino',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
    };
    return texts[status] || status;
  };

  const filteredOrders = orders.filter(order =>
    order.id.toString().includes(searchTerm) ||
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-gray-500 mt-1">Gestiona tus entregas asignadas</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent w-full md:w-64 transition-all"
            />
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'active'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Todos
            </button>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No se encontraron pedidos
          </h3>
          <p className="text-gray-500 text-sm">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : filter === 'active'
                ? 'No tienes pedidos activos en este momento'
                : 'No tienes pedidos asignados'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group"
            >
              <div className="p-6">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 font-bold text-sm border border-gray-100">
                      {order.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {order.user?.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Pedido #{order.id} • {new Date(order.created_at).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.delivery_status?.name)}`}>
                    {getStatusText(order.delivery_status?.name)}
                  </span>
                </div>

                {/* Card Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{order.address?.street}</p>
                      <p className="text-xs text-gray-500">{order.address?.colony}, {order.address?.city}</p>
                    </div>
                  </div>

                  {order.user?.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <a href={`tel:${order.user.phone}`} className="hover:text-gray-900 transition-colors">
                        {order.user.phone}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Package className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{order.order_items?.length || 0} productos</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-lg font-bold text-gray-900">
                    ${parseFloat(order.total).toFixed(2)}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setChatOrder(order)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Enviar mensaje"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setOrderToChangeStatus(order)}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Actualizar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedOrder && (
        <DeliveryOrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {orderToChangeStatus && (
        <OrderStatusManager
          order={orderToChangeStatus}
          onClose={() => setOrderToChangeStatus(null)}
          onStatusUpdated={fetchOrders}
        />
      )}

      {chatOrder && (
        <ChatModal
          order={chatOrder}
          onClose={() => setChatOrder(null)}
        />
      )}
    </div>
  );
};

export default DeliveryOrders;