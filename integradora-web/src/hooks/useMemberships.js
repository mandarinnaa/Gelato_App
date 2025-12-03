// client/src/hooks/useMemberships.js
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { membershipService } from '../api/membershipService';

export const useMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const user = useSelector((state) => state.auth.user);

  // Cargar todas las membresías
  const fetchMemberships = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await membershipService.getAll();
      setMemberships(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar membresías');
      console.error('Error al cargar membresías:', err);
    } finally {
      setLoading(false);
    }
  };

  // Comprar/Actualizar membresía
  const upgradeMembership = async (membershipId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await membershipService.upgrade(membershipId);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar membresía';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Obtener membresía por ID
  const getMembershipById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await membershipService.getById(id);
      setCurrentMembership(data.data);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar membresía');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  return {
    memberships,
    currentMembership,
    userMembership: user?.membership,
    loading,
    error,
    fetchMemberships,
    upgradeMembership,
    getMembershipById,
  };
};