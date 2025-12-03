import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fillings: [],
  currentFilling: null,
  loading: false,
  error: null,
};

const fillingsSlice = createSlice({
  name: 'fillings',
  initialState,
  reducers: {
    setFillings: (state, action) => {
      state.fillings = action.payload;
    },
    setCurrentFilling: (state, action) => {
      state.currentFilling = action.payload;
    },
    addFilling: (state, action) => {
      state.fillings.unshift(action.payload);
    },
    updateFilling: (state, action) => {
      const index = state.fillings.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.fillings[index] = action.payload;
      }
    },
    deleteFilling: (state, action) => {
      state.fillings = state.fillings.filter(f => f.id !== action.payload);
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
  setFillings, 
  setCurrentFilling, 
  addFilling,
  updateFilling,
  deleteFilling,
  setLoading, 
  setError 
} = fillingsSlice.actions;

export default fillingsSlice.reducer;