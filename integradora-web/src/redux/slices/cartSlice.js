import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  items: [],
  total: 0,
  cartId: null,
  loading: false,
  error: null,
  synced: false,
};
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // ✅ CORRECCIÓN CRÍTICA: Establecer carrito desde el backend
    setCart: (state, action) => {
      const cart = action.payload;

      // 🔍 DEBUG
      console.log('🔵 Redux setCart - payload recibido:', cart);

      // ✅ Manejar cart_id o id
      state.cartId = cart.cart_id || cart.id || null;

      // ✅ Asegurar que items siempre sea un array
      state.items = Array.isArray(cart.items) ? cart.items : [];

      // ✅ CRÍTICO: Convertir total a número de forma segura
      const totalValue = parseFloat(cart.total);
      state.total = isNaN(totalValue) ? 0 : totalValue;

      console.log('🔵 Redux setCart - Estado actualizado:', {
        cartId: state.cartId,
        itemsCount: state.items.length,
        total: state.total,
        items: state.items
      });

      state.synced = true;
      state.error = null;  // ✅ Limpiar errores al cargar correctamente
    },
    // Agregar o actualizar item localmente (optimista)
    addToCartOptimistic: (state, action) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.product_id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.subtotal = existingItem.unit_price * existingItem.quantity;
      } else {
        state.items.push({
          product_id: product.id,
          quantity,
          unit_price: product.final_price,
          subtotal: product.final_price * quantity,
          product
        });
      }

      // Recalcular total
      state.total = state.items.reduce((sum, item) => {
        const subtotal = parseFloat(item.subtotal || 0);
        return sum + (isNaN(subtotal) ? 0 : subtotal);
      }, 0);

      state.synced = false;
    },
    // Actualizar cantidad localmente
    updateQuantityOptimistic: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      const item = state.items.find(i => i.id === cartItemId);

      if (item) {
        item.quantity = quantity;
        item.subtotal = item.unit_price * quantity;

        // Recalcular total
        state.total = state.items.reduce((sum, item) => {
          const subtotal = parseFloat(item.subtotal || 0);
          return sum + (isNaN(subtotal) ? 0 : subtotal);
        }, 0);

        state.synced = false;
      }
    },
    // Eliminar item localmente
    removeItemOptimistic: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);

      // Recalcular total
      state.total = state.items.reduce((sum, item) => {
        const subtotal = parseFloat(item.subtotal || 0);
        return sum + (isNaN(subtotal) ? 0 : subtotal);
      }, 0);

      state.synced = false;
    },
    // Limpiar carrito
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.cartId = null;
      state.synced = true;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;  // ✅ Detener loading cuando hay error
    },
    setSynced: (state, action) => {
      state.synced = action.payload;
    },
  },
});
export const {
  setCart,
  addToCartOptimistic,
  updateQuantityOptimistic,
  removeItemOptimistic,
  clearCart,
  setLoading,
  setError,
  setSynced,
} = cartSlice.actions;
export default cartSlice.reducer;