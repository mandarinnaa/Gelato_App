import { useSelector, useDispatch } from 'react-redux';
import { 
  setFillings, 
  setCurrentFilling, 
  addFilling as addFillingAction,
  updateFilling as updateFillingAction,
  deleteFilling as deleteFillingAction,
  setLoading, 
  setError 
} from '../redux/slices/fillingsSlice';
import { fillingService } from '../api/fillingService';

export const useFillings = () => {
  const dispatch = useDispatch();
  const { 
    fillings, 
    currentFilling, 
    loading, 
    error 
  } = useSelector((state) => state.fillings);

  const fetchFillings = async (filters = {}) => {
    dispatch(setLoading(true));
    try {
      const data = await fillingService.getAll(filters);
      dispatch(setFillings(data.data || []));
    } catch (err) {
      dispatch(setError(err.message));
      console.error('Error al cargar rellenos:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchFillingById = async (id) => {
    dispatch(setLoading(true));
    try {
      const data = await fillingService.getById(id);
      dispatch(setCurrentFilling(data.data));
      return data.data;
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createFilling = async (fillingData) => {
    dispatch(setLoading(true));
    try {
      const data = await fillingService.create(fillingData);
      dispatch(addFillingAction(data.data));
      return data;
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateFilling = async (id, fillingData) => {
    dispatch(setLoading(true));
    try {
      const data = await fillingService.update(id, fillingData);
      dispatch(updateFillingAction(data.data));
      return data;
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteFilling = async (id) => {
    dispatch(setLoading(true));
    try {
      await fillingService.delete(id);
      dispatch(deleteFillingAction(id));
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    fillings,
    currentFilling,
    loading,
    error,
    fetchFillings,
    fetchFillingById,
    createFilling,
    updateFilling,
    deleteFilling,
  };
};