import { useSelector, useDispatch } from 'react-redux';
import { 
  setToppings, 
  setCurrentTopping, 
  addTopping as addToppingAction,
  updateTopping as updateToppingAction,
  deleteTopping as deleteToppingAction,
  setLoading, 
  setError 
} from '../redux/slices/toppingsSlice';
import { toppingService } from '../api/toppingService';

export const useToppings = () => {
  const dispatch = useDispatch();
  const { 
    toppings, 
    currentTopping, 
    loading, 
    error 
  } = useSelector((state) => state.toppings);

  const fetchToppings = async (filters = {}) => {
    dispatch(setLoading(true));
    try {
      const data = await toppingService.getAll(filters);
      dispatch(setToppings(data.data || []));
    } catch (err) {
      dispatch(setError(err.message));
      console.error('Error al cargar toppings:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchToppingById = async (id) => {
    dispatch(setLoading(true));
    try {
      const data = await toppingService.getById(id);
      dispatch(setCurrentTopping(data.data));
      return data.data;
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createTopping = async (toppingData) => {
    dispatch(setLoading(true));
    try {
      const data = await toppingService.create(toppingData);
      dispatch(addToppingAction(data.data));
      return data;
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateTopping = async (id, toppingData) => {
    dispatch(setLoading(true));
    try {
      const data = await toppingService.update(id, toppingData);
      dispatch(updateToppingAction(data.data));
      return data;
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteTopping = async (id) => {
    dispatch(setLoading(true));
    try {
      await toppingService.delete(id);
      dispatch(deleteToppingAction(id));
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    toppings,
    currentTopping,
    loading,
    error,
    fetchToppings,
    fetchToppingById,
    createTopping,
    updateTopping,
    deleteTopping,
  };
};  