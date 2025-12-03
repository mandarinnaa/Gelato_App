import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Package,
  Calendar,
  DollarSign,
  CheckCircle,
  Search,
  Filter,
  ArrowUpRight,
  MapPin,
  User
} from 'lucide-react';
import DeliveryOrderDetailModal from '../../components/delivery/DeliveryOrderDetailModal';
import Loader from '../../components/common/Loader';
import { orderService } from '../../api/orderService';

const DeliveryHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, [user]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, dateFilter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll({
        delivery_person_id: user?.id,
      });

      let fetchedOrders = response.data?.data || response.data || [];

      fetchedOrders = fetchedOrders.filter(
        (o) => o.delivery_status?.name === 'entregado'
      );

      fetchedOrders.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(searchTerm) ||
          order.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateFilter === 'today') {
      filtered = filtered.filter(
        (order) => new Date(order.created_at) >= today
      );
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(
        (order) => new Date(order.created_at) >= weekAgo
      );
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(
        (order) => new Date(order.created_at) >= monthAgo
      );
    }

    setFilteredOrders(filtered);
  };

  const calculateStats = () => {
    const total = filteredOrders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );
    return {
      count: filteredOrders.length,
      total: total.toFixed(2),
    };
  };

  const stats = calculateStats();

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
        <h1 className="text-2xl font-bold text-gray-900">Historial</h1>
        <p className="text-gray-500 mt-1">Tus entregas completadas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Entregas</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.count}</span>
            <span className="text-sm text-gray-500">completadas</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Generado</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">${stats.total}</span>
            <span className="text-sm text-gray-500">en ventas</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ID o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          />
        </div>

        <div className="relative w-full md:w-48">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent appearance-none cursor-pointer transition-all"
          >
            <option value="all">Todo el tiempo</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      </div>

      {/* History List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No se encontraron entregas
          </h3>
          <p className="text-gray-500 text-sm">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900">#{order.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold">
                          {order.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.user?.name}</p>
                          <p className="text-xs text-gray-500">{order.user?.phone || 'Sin teléfono'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(order.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-bold text-gray-900">
                        ${parseFloat(order.total).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-gray-400 hover:text-gray-900 transition-colors">
                        <ArrowUpRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <DeliveryOrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default DeliveryHistory;