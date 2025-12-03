import { useState, useEffect } from 'react';
import paymentService from '../api/paymentService';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.getPaymentMethods();
      setPaymentMethods(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (methodData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.addPaymentMethod(methodData);
      await fetchPaymentMethods();
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al agregar método de pago';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentMethod = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await paymentService.deletePaymentMethod(id);
      await fetchPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar método de pago');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await paymentService.setDefaultPaymentMethod(id);
      await fetchPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al establecer método predeterminado');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createPayPalPayment = async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.createPayPalPayment(paymentData);
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al crear pago con PayPal';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    createPayPalPayment,
    refreshPaymentMethods: fetchPaymentMethods,
  };
};