import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toppings: [],
  currentTopping: null,
  loading: false,
  error: null,
};

const toppingsSlice = createSlice({
  name: 'toppings',
  initialState,
  reducers: {
    setToppings: (state, action) => {
      state.toppings = action.payload;
    },
    setCurrentTopping: (state, action) => {
      state.currentTopping = action.payload;
    },
    addTopping: (state, action) => {
      state.toppings.unshift(action.payload);
    },
    updateTopping: (state, action) => {
      const index = state.toppings.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.toppings[index] = action.payload;
      }
    },
    deleteTopping: (state, action) => {
      state.toppings = state.toppings.filter(t => t.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setToppings, 
  setCurrentTopping, 
  addTopping,
  updateTopping,
  deleteTopping,
  setLoading, 
  setError 
} = toppingsSlice.actions;

export default toppingsSlice.reducer;