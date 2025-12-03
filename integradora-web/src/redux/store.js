import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import productsReducer from './slices/productsSlice';
import pointsReducer from './slices/pointsSlice';
import fillingsReducer from './slices/fillingsSlice';
import toppingsReducer from './slices/toppingsSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    orders: orderReducer,
    products: productsReducer,
        fillings: fillingsReducer, // ✅ AGREGAR ESTA LÍNEA
            toppings: toppingsReducer, // ✅ AGREGAR ESTA LÍNEA
    points: pointsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});