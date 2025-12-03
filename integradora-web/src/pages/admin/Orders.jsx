import React, { useEffect, useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { orderService } from '../../api/orderService';

const AdminOrders = () => {
  const { orders, loading, fetchOrders } = useOrders();
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15
  });

  useEffect(() => {
    loadOrders(1);
  }, [filter]);

  const loadOrders = async (page = 1) => {
    try {
      const filters = filter !== 'all' ? { delivery_status_id: filter, page } : { page };
      const response = await orderService.getAll(filters);

      // Manejar respuesta paginada de Laravel
      if (response.data.data) {
        fetchOrders(filters);
        setPagination({
          currentPage: response.data.current_page || 1,
          lastPage: response.data.last_page || 1,
          total: response.data.total || 0,
          perPage: response.data.per_page || 15
        });
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatusId) => {
    try {
      await orderService.updateStatus(orderId, {
        delivery_status_id: newStatusId,
        notes: 'Estado actualizado por administrador'
      });
      loadOrders(pagination.currentPage);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      loadOrders(newPage);
    }
  };

  const getStatusColor = (statusId) => {
    const colors = {
      1: 'bg-yellow-100 text-yellow-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-purple-100 text-purple-800',
      4: 'bg-emerald-100 text-emerald-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[statusId] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDotColor = (statusId) => {
    const colors = {
      1: 'bg-yellow-500',
      2: 'bg-blue-500',
      3: 'bg-purple-500',
      4: 'bg-emerald-500',
      5: 'bg-red-500'
    };
    return colors[statusId] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
        <p className="text-sm text-gray-500 mt-1">Administra y supervisa todos los pedidos</p>
      </div>

      <Card>
        {/* Filter Section */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all bg-white"
            >
              <option value="all">Todos los pedidos</option>
              <option value="1">Pendiente</option>
              <option value="2">En preparación</option>
              <option value="3">En camino</option>
              <option value="4">Entregado</option>
              <option value="5">Cancelado</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{pagination.total}</span>
            <span>pedido{pagination.total !== 1 ? 's' : ''} total{pagination.total !== 1 ? 'es' : ''}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pedidos</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter !== 'all' ? 'No hay pedidos con este estado.' : 'Aún no se han registrado pedidos.'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-500">#{order.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center mr-3">
                          <span className="text-xs font-semibold text-indigo-700">
                            {order.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.user?.name || 'Usuario'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.user?.email || 'Sin email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                      ${parseFloat(order.total || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.delivery_status_id)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotColor(order.delivery_status_id)}`} />
                        {order.delivery_status?.name || 'Desconocido'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          {new Date(order.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de {pagination.total} pedido{pagination.total !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {[...Array(pagination.lastPage)].map((_, index) => {
                  const pageNum = index + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.lastPage ||
                    (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${pagination.currentPage === pageNum
                            ? 'bg-slate-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.currentPage - 2 ||
                    pageNum === pagination.currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-2 py-1.5 text-gray-500">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default AdminOrders;