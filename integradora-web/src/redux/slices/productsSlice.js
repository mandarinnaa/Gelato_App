import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [], // Productos base del catálogo
  filteredProducts: [],
  currentProduct: null,
  categories: [],
  filters: {
    category: '',
    search: '',
    minPrice: 0,
    maxPrice: 10000,
    available: true,
    featured: false,
  },
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.filteredProducts = action.payload;
    },

    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },

    setCategories: (state, action) => {
      state.categories = action.payload;
    },

    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    filterProducts: (state) => {
      let filtered = [...state.products];

      // Filtrar por categoría
      if (state.filters.category) {
        filtered = filtered.filter(p => 
          p.category?.id === state.filters.category || 
          p.category_id === state.filters.category
        );
      }

      // Filtrar por búsqueda
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.flavor?.name?.toLowerCase().includes(search)
        );
      }

      // Filtrar por precio (usando el rango de precios disponibles)
      filtered = filtered.filter(p => {
        if (!p.available_sizes || p.available_sizes.length === 0) return true;
        
        // Verificar si algún tamaño está en el rango de precio
        return p.available_sizes.some(size => 
          size.price >= state.filters.minPrice && 
          size.price <= state.filters.maxPrice
        );
      });

      // Filtrar por disponibilidad
      if (state.filters.available) {
        filtered = filtered.filter(p => p.available === true);
      }

      // Filtrar por destacados
      if (state.filters.featured) {
        filtered = filtered.filter(p => p.featured === true);
      }

      state.filteredProducts = filtered;
    },

    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredProducts = state.products;
    },

    addProduct: (state, action) => {
      state.products.unshift(action.payload);
      state.filteredProducts = state.products;
    },

    updateProduct: (state, action) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
        state.filteredProducts = state.products;
      }
    },

    deleteProduct: (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload);
      state.filteredProducts = state.products;
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
  setProducts, 
  setCurrentProduct, 
  setCategories,
  setFilters,
  filterProducts,
  clearFilters,
  addProduct,
  updateProduct,
  deleteProduct,
  setLoading, 
  setError 
} = productsSlice.actions;

export default productsSlice.reducer;