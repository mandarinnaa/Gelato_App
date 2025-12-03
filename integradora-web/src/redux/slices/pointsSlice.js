import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  points: 0,
  history: [],
  loading: false,
  error: null,
};

const pointsSlice = createSlice({
  name: 'points',
  initialState,
  reducers: {
    setPoints: (state, action) => {
      state.points = action.payload;
    },
    addPoints: (state, action) => {
      state.points += action.payload;
    },
    subtractPoints: (state, action) => {
      state.points -= action.payload;
    },
    setPointsHistory: (state, action) => {
      state.history = action.payload;
    },
    addToHistory: (state, action) => {
      state.history.unshift(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearPoints: (state) => {
      state.points = 0;
      state.history = [];
    },
  },
});

export const { 
  setPoints, 
  addPoints, 
  subtractPoints, 
  setPointsHistory, 
  addToHistory,
  setLoading, 
  setError,
  clearPoints 
} = pointsSlice.actions;

export default pointsSlice.reducer;