import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from '../client/CartSidebar';

const Layout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <main style={{ flex: 1, backgroundColor: '#f8f9fa', paddingTop: '80px' }}>
        <Outlet />
      </main>
      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Layout;