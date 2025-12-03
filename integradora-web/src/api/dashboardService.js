// src/api/dashboardService.js
import api from './axiosConfig';

export const dashboardService = {
  /**
   * Get all dashboard data in a single request (OPTIMIZED)
   */
  getAllDashboardData: async (period = 'month', month = null, year = null) => {
    let url = `/dashboard/all-data?period=${period}`;
    if (month && year) {
      url += `&month=${month}&year=${year}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get dashboard statistics
   */
  getStats: async (period = 'month', month = null, year = null) => {
    let url = `/dashboard/stats?period=${period}`;
    if (month && year) {
      url += `&month=${month}&year=${year}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get revenue chart data
   */
  getRevenueChart: async (period = 'month', month = null, year = null) => {
    let url = `/dashboard/revenue-chart?period=${period}`;
    if (month && year) {
      url += `&month=${month}&year=${year}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get orders by status
   */
  getOrdersByStatus: async (period = 'month', month = null, year = null) => {
    let url = `/dashboard/orders-by-status?period=${period}`;
    if (month && year) {
      url += `&month=${month}&year=${year}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get top products
   */
  getTopProducts: async (period = 'month', month = null, year = null) => {
    let url = `/dashboard/top-products?period=${period}`;
    if (month && year) {
      url += `&month=${month}&year=${year}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get recent orders
   */
  getRecentOrders: async () => {
    const response = await api.get('/dashboard/recent-orders');
    return response.data;
  },

  /**
   * Get revenue by month (últimos 12 meses)
   */
  getRevenueByMonth: async () => {
    const response = await api.get('/dashboard/revenue-by-month');
    return response.data;
  },

  /**
   * Get revenue by year (Enero - Diciembre)
   */
  getRevenueByYear: async () => {
    const response = await api.get('/dashboard/revenue-by-year');
    return response.data;
  },

  /**
   * Generate PDF report
   */
  downloadReport: (period = 'month', month = null, year = null) => {
    const baseURL = api.defaults.baseURL;
    const token = localStorage.getItem('token');

    let url = `${baseURL}/dashboard/report/${period}?token=${token}`;
    if (month && year) {
      url += `&month=${month}&year=${year}`;
    }

    // Open in new tab for download
    window.open(url, '_blank');
  },

  /**
   * Get report URL for printing
   */
  getReportUrl: (period = 'month', month = null, year = null) => {
    const baseURL = api.defaults.baseURL;
    const token = localStorage.getItem('token');

    let url = `${baseURL}/dashboard/report/${period}?token=${token}`;
    if (month && year) {
      url += `&month=${month}&year=${year}`;
    }

    return url;
  }
};