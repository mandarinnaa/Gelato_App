import { useSelector, useDispatch } from 'react-redux';
import { 
  setProducts, 
  setCurrentProduct, 
  setCategories,
  setFilters,
  filterProducts as filterProductsAction,
  clearFilters as clearFiltersAction,
  addProduct as addProductAction,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
  setLoading, 
  setError 
} from '../redux/slices/productsSlice';
import { productService } from '../api/productService';

export const useProducts = () => {
  const dispatch = useDispatch();
  const { 
    products, 
    filteredProducts, 
    currentProduct, 
    categories,
    filters,
    loading, 
    error 
  } = useSelector((state) => state.products);

  const fetchProducts = async (filterParams = {}) => {
    dispatch(setLoading(true));
    try {
      const data = await productService.getAll(filterParams);
      dispatch(setProducts(data.data.data || data.data));
    } catch (err) {
      dispatch(setError(err.message));
      console.error('Error al cargar productos:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchProductById = async (id) => {
    dispatch(setLoading(true));
    try {
      const data = await productService.getById(id);
      dispatch(setCurrentProduct(data.data));
      return data.data;
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createProduct = async (productData) => {
    dispatch(setLoading(true));
    try {
      const data = await productService.create(productData);
      dispatch(addProductAction(data.data));
      return data;
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateProduct = async (id, productData) => {
    dispatch(setLoading(true));
    try {
      const data = await productService.update(id, productData);
      dispatch(updateProductAction(data.data));
      return data;
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteProduct = async (id) => {
    dispatch(setLoading(true));
    try {
      await productService.delete(id);
      dispatch(deleteProductAction(id));
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const applyFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(filterProductsAction());
  };

  const clearFilters = () => {
    dispatch(clearFiltersAction());
  };

  return {
    products,
    filteredProducts,
    currentProduct,
    categories,
    filters,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    applyFilters,
    clearFilters,
  };
};