// client/src/hooks/usePoints.js
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPoints, setPointsHistory, setLoading, setError } from '../redux/slices/pointsSlice';
import pointsService from '../api/pointsService';

export const usePoints = () => {
  const dispatch = useDispatch();
  const { points, history, loading, error } = useSelector(state => state.points);
  const [balance, setBalance] = useState(null);

  /**
   * Cargar balance de puntos
   */
  const fetchBalance = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const response = await pointsService.getBalance();
      const data = response.data;
      
      setBalance(data);
      dispatch(setPoints(data.available));
      dispatch(setError(null));
    } catch (err) {
      console.error('Error al cargar balance de puntos:', err);
      dispatch(setError(err.response?.data?.message || 'Error al cargar puntos'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Cargar historial de puntos
   */
  const fetchHistory = useCallback(async (page = 1, perPage = 20) => {
    dispatch(setLoading(true));
    try {
      const response = await pointsService.getHistory(page, perPage);
      dispatch(setPointsHistory(response.data));
      dispatch(setError(null));
      return response;
    } catch (err) {
      console.error('Error al cargar historial:', err);
      dispatch(setError(err.response?.data?.message || 'Error al cargar historial'));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Calcular descuento por puntos
   */
  const calculateDiscount = useCallback(async (pointsToRedeem, cartTotal) => {
    try {
      const response = await pointsService.calculateDiscount(pointsToRedeem, cartTotal);
      return response.data;
    } catch (err) {
      console.error('Error al calcular descuento:', err);
      throw err;
    }
  }, []);

  /**
   * Obtener información de cómo ganar puntos
   */
  const getEarnInfo = useCallback(async () => {
    try {
      const response = await pointsService.getEarnInfo();
      return response.data;
    } catch (err) {
      console.error('Error al obtener info:', err);
      throw err;
    }
  }, []);

  return {
    points,
    balance,
    history,
    loading,
    error,
    fetchBalance,
    fetchHistory,
    calculateDiscount,
    getEarnInfo
  };
};