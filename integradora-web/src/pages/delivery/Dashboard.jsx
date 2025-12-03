import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Package,
  TrendingUp,
  CheckCircle,
  Clock,
  RefreshCw,
  MapPin,
  Phone,
  ChevronRight,
  Truck,
  ShoppingBag,
  MessageCircle
} from 'lucide-react';
import OrderStatusManager from '../../components/delivery/OrderStatusManager';
import ChatModal from '../../components/common/ChatModal';
import Loader from '../../components/common/Loader';
import { orderService } from '../../api/orderService';

const DeliveryDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    pending: 0,
    inTransit: 0,
    delivered: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderToChangeStatus, setOrderToChangeStatus] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll({
        delivery_person_id: user?.id,
      });

      const orders = response.data?.data || response.data || [];

      // Calcular estadísticas
      const pending = orders.filter(
        (o) => o.delivery_status?.name === 'preparando' || o.delivery_status?.name === 'pendiente'
      ).length;

      const inTransit = orders.filter(
        (o) => o.delivery_status?.name === 'en_camino'
      ).length;

      const deliveredToday = orders.filter((o) => {
        if (o.delivery_status?.name !== 'entregado') return false;
        const today = new Date();
        const orderDate = new Date(o.updated_at);
        return orderDate.toDateString() === today.toDateString();
      }).length;

      setStats({
        pending,
        inTransit,
        delivered: deliveredToday,
        total: orders.length,
      });

      // Últimos pedidos activos (incluyendo pendientes)
      setRecentOrders(
        orders
          .filter((o) =>
            o.delivery_status?.name === 'pendiente' ||
            o.delivery_status?.name === 'preparando' ||
            o.delivery_status?.name === 'en_camino'
          )
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 5)
      );
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">
          Resumen de tu actividad hoy
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pendientes</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.pending}</span>
            <span className="text-sm text-gray-500">pedidos</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">En Ruta</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.inTransit}</span>
            <span className="text-sm text-gray-500">pedidos</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Entregados</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.delivered}</span>
            <span className="text-sm text-gray-500">hoy</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
            <span className="text-sm text-gray-500">asignados</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Pedidos Activos</h2>
            <button
              onClick={() => window.location.href = '/delivery/orders'}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Ver todos <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">Todo al día</h3>
              <p className="text-gray-500 text-sm">No tienes pedidos activos en este momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                        {order.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.user?.name}</h3>
                        <p className="text-xs text-gray-500">Pedido #{order.id}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.delivery_status?.name)}`}>
                      {getStatusText(order.delivery_status?.name)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                      <span className="line-clamp-2">
                        {order.address?.street}, {order.address?.colony}
                      </span>
                    </div>
                    {order.user?.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{order.user.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="font-bold text-gray-900">
                      ${parseFloat(order.total).toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChatOrder(order)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Mensaje
                      </button>
                      <button
                        onClick={() => setOrderToChangeStatus(order)}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Actualizar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Acciones Rápidas</h2>

          <div className="grid gap-4">
            <button
              onClick={() => window.location.href = '/delivery/orders'}
              className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">Mis Pedidos</h3>
                  <p className="text-xs text-gray-500">Gestionar entregas</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/delivery/history'}
              className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Historial</h3>
                  <p className="text-xs text-gray-500">Ver completados</p>
                </div>
              </div>
            </button>
          </div>

          {/* Mini Tip Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Tip del día</h3>
                <p className="text-xs text-gray-400 mt-1">Mantén tu estado actualizado</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Actualizar el estado de tus pedidos en tiempo real ayuda a mejorar la satisfacción del cliente.
            </p>
          </div>
        </div>
      </div>

      {/* Status Manager Modal */}
      {orderToChangeStatus && (
        <OrderStatusManager
          order={orderToChangeStatus}
          onClose={() => setOrderToChangeStatus(null)}
          onStatusUpdated={fetchStats}
        />
      )}

      {/* Chat Modal */}
      {chatOrder && (
        <ChatModal
          order={chatOrder}
          onClose={() => setChatOrder(null)}
        />
      )}
    </div>
  );
};

export default DeliveryDashboard;