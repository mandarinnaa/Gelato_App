import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DeliverySidebar from './DeliverySidebar';

const DeliveryLayout = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Verificar si el usuario tiene rol de repartidor
    const userRole = user?.role?.name;
    const isDelivery = userRole === 'repartidor' || userRole === 'Repartidor';
    const hasAccess = isAuthenticated && isDelivery;

    useEffect(() => {
        // Si no tiene acceso, redirigir a home
        if (!hasAccess) {
            window.location.href = '/';
        }
    }, [hasAccess]);

    // Si no tiene permisos, no renderizar nada
    if (!hasAccess) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <DeliverySidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'
                    }`}
            >
                <div className="p-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DeliveryLayout;
