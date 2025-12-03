import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../hooks/useAuth';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import ChatModal from '../../components/common/ChatModal';
import { orderService } from '../../api/orderService';
import { BASE_URL } from '../../api/axiosConfig';
import Loader from '../../components/common/Loader';

const ClientOrders = () => {
  const { user } = useAuth();
  const { orders, loading, fetchOrders } = useOrders();
  const location = useLocation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatOrder, setChatOrder] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Cargar fuentes de Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders({ user_id: user.id });
    }

    if (location.state?.success) {
      setSuccessMessage(location.state.success);
      window.history.replaceState({}, document.title);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [user]);

  const handleViewTracking = async (order) => {
    try {
      const data = await orderService.tracking(order.id);
      setTrackingData(data.data);
      setSelectedOrder(order);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error al cargar tracking:', error);
    }
  };

  const handleViewTicket = (orderId) => {
    window.open(`${BASE_URL}/orders/${orderId}/ticket`, '_blank');
  };

  // ✅ Helper para obtener la URL de la imagen - VERSIÓN SIMPLE
  const getImageUrl = (item) => {
    // Simplemente retorna la imagen tal como viene del backend
    // El backend ya debe enviar la URL completa
    const imageUrl = item.base_product?.image_url || 
                     item.base_product?.image || 
                     item.product?.image_url || 
                     item.product?.image || 
                     item.image_url || 
                     item.image || 
                     null;
    
    console.log('🖼️ Image URL from backend:', imageUrl);
    return imageUrl;
  };

  const getStatusColor = (statusId) => {
    const colors = {
      1: 'bg-yellow-100 text-yellow-800', // Pendiente
      2: 'bg-blue-100 text-blue-800',     // Confirmado
      3: 'bg-purple-100 text-purple-800', // En preparación
      4: 'bg-orange-100 text-orange-800', // En camino
      5: 'bg-green-100 text-green-800'    // Entregado
    };
    return colors[statusId] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (statusId) => {
    const icons = {
      1: ( // Pendiente
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      2: ( // Confirmado
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      3: ( // En preparación
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      4: ( // En camino
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      5: ( // Entregado
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    };
    return icons[statusId] || icons[1];
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <Loader text="Cargando pedidos..." />;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter leading-tight mb-2">
            MIS PEDIDOS.
          </h1>
          <p className="text-base text-black/70 font-medium">
            Historial de tus compras recientes.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-8">
            <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-black uppercase mb-2 tracking-tight">
              No tienes pedidos aún
            </h2>
            <p className="text-gray-500 mb-6 font-medium text-sm">
              Explora nuestra tienda y realiza tu primera compra.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-black text-white font-bold text-xs uppercase rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
            >
              Ir a la Tienda
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {currentOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                          Pedido
                        </p>
                        <p className="text-base font-black text-black">
                          #{order.id}
                        </p>
                      </div>
                      <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                          Fecha
                        </p>
                        <p className="text-xs font-bold text-black">
                          {new Date(order.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                          Total
                        </p>
                        <p className="text-base font-black text-black">
                          ${parseFloat(order.total || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(order.delivery_status_id)}`}>
                      {getStatusIcon(order.delivery_status_id)}
                      <span>{order.delivery_status?.name || 'Pendiente'}</span>
                    </div>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Products List */}
                    <div className="flex-1">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Productos ({order.order_items?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {order.order_items?.map(item => {
                          const imageUrl = getImageUrl(item);
                          return (
                            <div key={item.id} className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                {/* Product Image or Icon */}
                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={item.base_product?.name || item.product?.name || item.product_name || 'Producto'}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        console.error('❌ Error loading image:', imageUrl);
                                        e.target.style.display = 'none';
                                        e.target.parentElement.querySelector('svg').style.display = 'block';
                                      }}
                                    />
                                  ) : null}
                                  <svg 
                                    className="w-5 h-5 text-gray-300" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    style={{ display: imageUrl ? 'none' : 'block' }}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-black group-hover:text-gray-600 transition-colors line-clamp-1">
                                    {item.base_product?.name || item.product?.name || item.product_name || 'Producto Personalizado'}
                                  </p>
                                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                                    Cant: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-black">
                                ${parseFloat(item.subtotal || 0).toFixed(2)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 w-full lg:w-56 flex-shrink-0">
                      <button
                        onClick={() => handleViewTracking(order)}
                        className="w-full px-4 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Seguimiento
                      </button>

                      <button
                        onClick={() => handleViewTicket(order.id)}
                        className="w-full px-4 py-2.5 bg-white text-black border border-black text-xs font-bold uppercase rounded-full hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Ver Ticket
                      </button>

                      {order.delivery_person_id && (
                        <button
                          onClick={() => setChatOrder(order)}
                          className="w-full px-4 py-2.5 bg-green-600 text-white text-xs font-bold uppercase rounded-full hover:bg-green-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Chat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentPage === i + 1
                        ? 'bg-black text-white shadow-lg scale-110'
                        : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tracking Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`SEGUIMIENTO #${selectedOrder?.id}`}
          size="lg"
        >
          {trackingData && (
            <div className="space-y-8">
              {/* Current Status */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Estado Actual
                </h3>
                <div className={`p-6 rounded-2xl ${getStatusColor(trackingData.order.delivery_status_id)}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-2 bg-white/50 rounded-full">
                      {getStatusIcon(trackingData.order.delivery_status_id)}
                    </div>
                    <div>
                      <p className="text-lg font-black uppercase tracking-tight">
                        {trackingData.order.delivery_status?.name}
                      </p>
                      <p className="text-sm font-medium opacity-80">
                        Actualizado el {new Date(trackingData.order.updated_at).toLocaleString('es-MX')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                  Historial
                </h3>
                <div className="relative pl-4">
                  {/* Vertical Line */}
                  <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-100" />
                  
                  <div className="space-y-8">
                    {trackingData.history.map((item, index) => (
                      <div key={index} className="relative flex gap-6">
                        {/* Dot */}
                        <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-black' : 'bg-gray-300'}`} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <p className={`font-bold uppercase tracking-wide ${index === 0 ? 'text-black' : 'text-gray-500'}`}>
                            {item.delivery_status?.name}
                          </p>
                          <p className="text-xs text-gray-400 font-medium mb-2">
                            {new Date(item.created_at).toLocaleString('es-MX', {
                              day: '2-digit',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {item.notes && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 italic">
                              "{item.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Chat Modal */}
        {chatOrder && (
          <ChatModal
            order={chatOrder}
            onClose={() => setChatOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ClientOrders;