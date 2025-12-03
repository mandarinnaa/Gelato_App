import { useSelector, useDispatch } from 'react-redux';
import { setOrders, setCurrentOrder, addOrder, setLoading, setError } from '../redux/slices/orderSlice';
import { orderService } from '../api/orderService';

export const useOrders = () => {
  const dispatch = useDispatch();
  const { orders, currentOrder, loading, error } = useSelector((state) => state.orders);

  const fetchOrders = async (filters = {}) => {
    dispatch(setLoading(true));
    try {
      const data = await orderService.getAll(filters);
      dispatch(setOrders(data.data.data || data.data));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchOrderById = async (id) => {
    dispatch(setLoading(true));
    try {
      const data = await orderService.getById(id);
      dispatch(setCurrentOrder(data.data));
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createOrder = async (orderData) => {
    dispatch(setLoading(true));
    try {
      const data = await orderService.create(orderData);
      dispatch(addOrder(data.data));
      return data;
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    createOrder,
  };
};