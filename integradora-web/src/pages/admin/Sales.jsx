import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { saleService } from '../../api/saleService';

const AdminSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15
  });

  useEffect(() => {
    loadSales(1);
  }, []);

  const loadSales = async (page = 1) => {
    try {
      setLoading(true);
      const response = await saleService.getAll({ page });

      // Manejar respuesta paginada de Laravel
      if (response.data) {
        setSales(response.data.data || response.data);
        setPagination({
          currentPage: response.data.current_page || 1,
          lastPage: response.data.last_page || 1,
          total: response.data.total || 0,
          perPage: response.data.per_page || 15
        });
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      loadSales(newPage);
    }
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      'Efectivo': 'bg-green-100 text-green-800',
      'Tarjeta': 'bg-blue-100 text-blue-800',
      'Transferencia': 'bg-purple-100 text-purple-800',
      'PayPal': 'bg-indigo-100 text-indigo-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  if (loading && sales.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Ventas</h1>
        <p className="text-sm text-gray-500 mt-1">Visualiza el historial completo de ventas</p>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-8 shadow-lg mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-6 h-6 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Ingresos Totales</h2>
            </div>
            <p className="text-5xl font-bold text-white mb-2">
              ${totalRevenue.toFixed(2)}
            </p>
            <div className="flex items-center gap-2 text-emerald-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{pagination.total} ventas registradas</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Ventas</h2>
          <p className="text-sm text-gray-500 mt-1">Registro completo de todas las transacciones</p>
        </div>

        <div className="overflow-x-auto">
          {sales.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ventas registradas</h3>
              <p className="mt-1 text-sm text-gray-500">Las ventas aparecerán aquí cuando se registren.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Empleado</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Método de Pago</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-500">#{sale.id}</td>

                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {sale.employee?.name || 'N/A'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-sm font-bold text-gray-900">
                        ${parseFloat(sale.total || 0).toFixed(2)}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(sale.payment_method?.name)}`}>
                        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {sale.payment_method?.name || 'N/A'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          {new Date(sale.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(sale.created_at).toLocaleTimeString('es-MX', {
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
              Mostrando {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de {pagination.total} venta{pagination.total !== 1 ? 's' : ''}
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

export default AdminSales;
