import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { setCredentials } from './redux/slices/authSlice';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/common/Layout';
import GlobalToast from './components/common/GlobalToast';
import Home from './pages/public/home';
import ContactUs from './pages/public/ContactUs';
import Memberships from './pages/client/Memberships';
import MembershipSuccess from './pages/client/MembershipSuccess';

import AboutUs from './pages/public/AboutUs';

import AdminUsers from './pages/admin/Users';
import AdminFillings from './pages/admin/Fillings';
import AdminFlavors from './pages/admin/flavors';
import AdminToppings from './pages/admin/Toppings';
import AdminLayout from './components/admin/AdminLayout';

// Auth Pages (Login/Register/Forgot/Reset are now Modals)
// import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';
// import ForgotPassword from './pages/auth/ForgotPassword';
// import ResetPassword from './pages/auth/ResetPassword';

// Client Pages
import Shop from './pages/client/Shop';
import Cart from './pages/client/Cart';
import ProductDetail from './pages/client/ProductDetail';
import Checkout from './pages/client/Checkout';
import PaymentSuccess from './pages/client/PaymentSuccess'; // ✅ NUEVO
import ClientOrders from './pages/client/Orders';
import Profile from './pages/client/Profile';
import CustomCake from './pages/client/CustomCake';
import MyMembership from './pages/client/MyMembership';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import POSales from './pages/admin/POSales';
import AdminOrders from './pages/admin/Orders';
import AdminSales from './pages/admin/Sales';

// Delivery Pages
import DeliveryDashboard from './pages/delivery/Dashboard';
import DeliveryOrders from './pages/delivery/Orders';
import DeliveryHistory from './pages/delivery/History';
import DeliveryLayout from './components/delivery/DeliveryLayout';

import { ModalProvider, useModal } from './context/ModalContext';

function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        dispatch(setCredentials({
          token,
          user: JSON.parse(user),
        }));
      } catch (error) {
        console.error('Error al cargar usuario del localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  return children;
}

// Componente para manejar la redirección y apertura del modal de reset password
function ResetPasswordTrigger() {
  const [searchParams] = useSearchParams();
  const { openResetPassword } = useModal();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const hasOpened = React.useRef(false);

  useEffect(() => {
    if (token && email && !hasOpened.current) {
      openResetPassword({ token, email });
      hasOpened.current = true;
    }
  }, [token, email, openResetPassword]);

  return <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
          {/* Rutas CON Layout (tienen navbar y footer) */}
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/memberships" element={<Memberships />} />

            {/* Reset Password Trigger Route */}
            <Route path="/reset-password" element={<ResetPasswordTrigger />} />

            {/* Client Routes */}
            <Route path="/shop" element={<Shop />} />
            <Route path="/custom-cake" element={<CustomCake />} />

            {/* ✅ RUTA DE ÉXITO DE PAGO (Protegida) */}
            <Route path="/payment/success" element={
              <PrivateRoute>
                <PaymentSuccess />
              </PrivateRoute>
            } />

            <Route path="/cart" element={
              <PrivateRoute>
                <Cart />
              </PrivateRoute>
            } />

            <Route path="/product/:id" element={<ProductDetail />} />

            <Route path="/checkout" element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            } />

            <Route path="/orders" element={
              <PrivateRoute>
                <ClientOrders />
              </PrivateRoute>
            } />

            <Route path="/membership/success" element={
              <PrivateRoute>
                <MembershipSuccess />
              </PrivateRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            <Route path="/my-membership" element={
              <PrivateRoute>
                <MyMembership />
              </PrivateRoute>
            } />



          </Route>

          {/* Delivery Routes - Wrapped in DeliveryLayout */}
          <Route element={<DeliveryLayout />}>
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
            <Route path="/delivery/orders" element={<DeliveryOrders />} />
            <Route path="/delivery/history" element={<DeliveryHistory />} />
          </Route>

          {/* Admin Routes - WRAPPED IN ADMIN LAYOUT (Moved outside main Layout) */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={
              <PrivateRoute allowedRoles={['superadmin']}>
                <AdminDashboard />
              </PrivateRoute>
            } />

            <Route path="/admin/users" element={
              <PrivateRoute allowedRoles={['superadmin']}>
                <AdminUsers />
              </PrivateRoute>
            } />

            <Route path="/admin/flavors" element={
              <PrivateRoute allowedRoles={['superadmin']}>
                <AdminFlavors />
              </PrivateRoute>
            } />

            <Route path="/admin/fillings" element={
              <PrivateRoute allowedRoles={['superadmin']}>
                <AdminFillings />
              </PrivateRoute>
            } />

            <Route path="/admin/toppings" element={
              <PrivateRoute allowedRoles={['superadmin']}>
                <AdminToppings />
              </PrivateRoute>
            } />

            <Route path="/admin/products" element={
              <PrivateRoute allowedRoles={['superadmin']}>
                <AdminProducts />
              </PrivateRoute>
            } />

            <Route path="/admin/orders" element={
              <PrivateRoute allowedRoles={['superadmin']}>
                <AdminOrders />
              </PrivateRoute>
            } />

            <Route path="/admin/sales" element={
              <PrivateRoute allowedRoles={['superadmin']}>
                <AdminSales />
              </PrivateRoute>
            } />

            <Route path="/admin/pos-sales" element={
              <PrivateRoute allowedRoles={['superadmin', 'admin']}>
                <POSales />
              </PrivateRoute>
            } />
          </Route>

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ModalProvider>
        <GlobalToast />
        <AppRoutes />
      </ModalProvider>
    </Provider>
  );
}

export default App;