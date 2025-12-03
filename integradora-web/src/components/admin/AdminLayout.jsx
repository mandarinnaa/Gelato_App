import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Verificar si el usuario tiene rol de admin o superadmin
    const userRole = user?.role?.name;
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    const hasAccess = isAuthenticated && isAdmin;

    useEffect(() => {
        // Si no tiene acceso, redirigir a home con recarga completa
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
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'
                    }`}
            >
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
