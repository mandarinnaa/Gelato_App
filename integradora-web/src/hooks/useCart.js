import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart as clearCartAction,
  setLoading,
  setError,
  updateQuantityOptimistic,
  removeItemOptimistic,
} from '../redux/slices/cartSlice';
import { cartService } from '../api/cartService';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, total, loading, error } = useSelector((state) => state.cart);

  /**
   * ✅ FUNCIÓN AUXILIAR: Extraer datos del carrito de forma consistente
   */
  const extractCartData = (response) => {
    console.log('🔍 extractCartData - Response completa:', response);

    // Caso 1: response.data.data (estructura con success)
    if (response.data?.data) {
      console.log('✅ Usando response.data.data');
      return response.data.data;
    }

    // Caso 2: response.data (estructura directa)
    if (response.data) {
      console.log('✅ Usando response.data');
      return response.data;
    }

    // Caso 3: response directamente
    console.log('✅ Usando response directamente');
    return response;
  };

  /**
   * Obtener el carrito del usuario
   */
  const fetchCart = async () => {
    dispatch(setLoading(true));
    try {
      const response = await cartService.getCart();
      console.log('📦 fetchCart - Response completa:', response);

      const cartData = extractCartData(response);
      console.log('📦 fetchCart - cartData extraído:', cartData);
      console.log('📦 fetchCart - items:', cartData.items);
      console.log('📦 fetchCart - total:', cartData.total);

      dispatch(setCart(cartData));
    } catch (err) {
      dispatch(setError(err.message));
      console.error('❌ Error al cargar carrito:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Agregar PRODUCTO BASE al carrito
   */
  const addBaseProduct = async (baseProductId, sizeId, quantity = 1) => {
    dispatch(setLoading(true));
    try {
      const response = await cartService.addBaseProduct({
        base_product_id: baseProductId,
        size_id: sizeId,
        quantity,
      });

      console.log('🛒 addBaseProduct - Response completa:', response);

      const cartData = extractCartData(response);
      console.log('🛒 addBaseProduct - cartData extraído:', cartData);

      dispatch(setCart(cartData));
      return response;
    } catch (err) {
      dispatch(setError(err.message || 'Error al agregar al carrito'));
      console.error('❌ Error al agregar al carrito:', err);
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Agregar PRODUCTO PERSONALIZADO al carrito
   */
  const addCustomProductToCart = async (customData) => {
    dispatch(setLoading(true));
    try {
      const response = await cartService.addCustomProduct(customData);

      console.log('🎨 addCustomProduct - Response:', response);

      const cartData = extractCartData(response);
      console.log('🎨 addCustomProduct - cartData:', cartData);

      dispatch(setCart(cartData));
      return response;
    } catch (err) {
      dispatch(setError(err.message || 'Error al agregar al carrito'));
      console.error('❌ Error al agregar producto personalizado:', err);
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Actualizar cantidad de un item (OPTIMISTA)
   */
  const updateQuantity = async (itemId, quantity) => {
    // 1. Actualización Optimista inmediata
    dispatch(updateQuantityOptimistic({ cartItemId: itemId, quantity }));

    try {
      // 2. Llamada al API en segundo plano
      const response = await cartService.updateQuantity(itemId, quantity);
      console.log('🔄 updateQuantity - Response:', response);

      // 3. Sincronizar con respuesta real
      const cartData = extractCartData(response);
      dispatch(setCart(cartData));
    } catch (err) {
      // 4. Rollback en caso de error
      console.error('❌ Error al actualizar cantidad:', err);
      dispatch(setError(err.message));
      fetchCart(); // Revertir cambios
    }
  };

  /**
   * Eliminar item del carrito (OPTIMISTA)
   */
  const removeItem = async (itemId) => {
    // 1. Actualización Optimista inmediata
    dispatch(removeItemOptimistic(itemId));

    try {
      // 2. Llamada al API en segundo plano
      const response = await cartService.removeItem(itemId);
      console.log('🗑️ removeItem - Response:', response);

      // 3. Sincronizar con respuesta real
      const cartData = extractCartData(response);
      dispatch(setCart(cartData));
    } catch (err) {
      // 4. Rollback en caso de error
      console.error('❌ Error al eliminar item:', err);
      dispatch(setError(err.message));
      fetchCart(); // Revertir cambios
    }
  };

  /**
   * Vaciar carrito
   */
  const clearCart = async () => {
    dispatch(setLoading(true));
    try {
      await cartService.clearCart();
      dispatch(clearCartAction());
    } catch (err) {
      dispatch(setError(err.message));
      console.error('❌ Error al vaciar carrito:', err);
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Procesar checkout
   */
  const checkout = async (checkoutData) => {
    dispatch(setLoading(true));
    try {
      const response = await cartService.checkout(checkoutData);
      dispatch(clearCartAction());
      return response;
    } catch (err) {
      dispatch(setError(err.message));
      console.error('❌ Error en checkout:', err);
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // 🔍 DEBUG: Mostrar estado actual del carrito
  console.log('🛒 Estado actual del carrito (useCart):', { items, total, loading });

  // ✅ Calcular itemCount de forma segura
  const itemCount = Array.isArray(items)
    ? items.reduce((count, item) => count + (item.quantity || 0), 0)
    : 0;

  return {
    items: items || [],  // ✅ Asegurar que siempre sea array
    itemCount,
    total: total || 0,   // ✅ Asegurar que siempre sea número
    loading,
    error,
    fetchCart,
    addBaseProduct,
    addCustomProductToCart,
    updateQuantity,
    removeItem,
    clearCart,
    checkout,
  };
};