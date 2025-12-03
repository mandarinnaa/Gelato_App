import { useState, useCallback } from 'react';
import flavorService from '../api/flavorService';

/**
 * Custom hook para manejar las operaciones CRUD de sabores
 */
export const useFlavors = () => {
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtener todos los sabores
   */
  const fetchFlavors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await flavorService.getAllFlavors();
      setFlavors(response.data || response);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los sabores');
      console.error('Error fetching flavors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener un sabor por ID
   */
  const fetchFlavorById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await flavorService.getFlavorById(id);
      return response.data || response;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el sabor');
      console.error('Error fetching flavor:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear un nuevo sabor
   */
  const createFlavor = useCallback(async (flavorData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await flavorService.createFlavor(flavorData);
      return response.data || response;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el sabor');
      console.error('Error creating flavor:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar un sabor existente
   */
  const updateFlavor = useCallback(async (id, flavorData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await flavorService.updateFlavor(id, flavorData);
      return response.data || response;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el sabor');
      console.error('Error updating flavor:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar un sabor
   */
  const deleteFlavor = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await flavorService.deleteFlavor(id);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el sabor');
      console.error('Error deleting flavor:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    flavors,
    loading,
    error,
    fetchFlavors,
    fetchFlavorById,
    createFlavor,
    updateFlavor,
    deleteFlavor,
  };
};