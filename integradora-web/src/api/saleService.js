import api from './axiosConfig';

export const saleService = {
  // Obtener todas las ventas
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/sales?${params}`);
    return response.data;
  },

  // Obtener una venta por ID
  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  // Crear venta
  create: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  // Actualizar venta
  update: async (id, saleData) => {
    const response = await api.put(`/sales/${id}`, saleData);
    return response.data;
  },

  // Eliminar venta
  delete: async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },

  // ✅ NUEVAS FUNCIONES PARA TICKETS
  
  // Obtener URL del ticket (sin token en URL, ahora es público)
  getTicketUrl: (saleId) => {
    const baseUrl = api.defaults.baseURL;
    return `${baseUrl}/sales/${saleId}/ticket`;
  },

  // Obtener URL de descarga del ticket
  getTicketDownloadUrl: (saleId) => {
    const baseUrl = api.defaults.baseURL;
    return `${baseUrl}/sales/${saleId}/ticket/download`;
  },

  // Generar ticket (abre en nueva ventana)
  openTicket: (saleId) => {
    const url = saleService.getTicketUrl(saleId);
    window.open(url, '_blank', 'width=400,height=600');
  },

  // Descargar ticket
  downloadTicket: async (saleId) => {
    try {
      const response = await fetch(
        `${api.defaults.baseURL}/sales/${saleId}/ticket/download`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) throw new Error('Error al descargar ticket');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${saleId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar ticket:', error);
      throw error;
    }
  },

  // Imprimir ticket directamente
  printTicket: async (saleId) => {
    const url = saleService.getTicketUrl(saleId);
    const printWindow = window.open(url, '_blank', 'width=400,height=600');
    
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  },
};

export default saleService;