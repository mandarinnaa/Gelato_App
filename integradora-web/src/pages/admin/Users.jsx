import React, { useState, useEffect } from 'react';
import { userService } from '../../api/userService';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]); // Todos los usuarios
  const [roles, setRoles] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role_id: '',
    membership_id: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadUsers();
    loadRoles();
    loadMemberships();
  }, [currentPage]); // Solo recargar cuando cambia la página

  // Filtrado en tiempo real del lado del cliente
  const filteredUsers = allUsers.filter(user => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.role?.name?.toLowerCase().includes(searchLower) ||
      user.membership?.name?.toLowerCase().includes(searchLower)
    );
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(currentPage, ''); // Sin filtro en el servidor
      setAllUsers(response.data.data);
      setPagination(response.data);
    } catch (error) {
      setFormError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await userService.getRoles();
      setRoles(response.data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const loadMemberships = async () => {
    try {
      const response = await userService.getMemberships();
      setMemberships(response.data);
    } catch (error) {
      console.error('Error al cargar membresías:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!editingUser && !formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (formData.password && formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.role_id) {
      errors.role_id = 'El rol es obligatorio';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const dataToSend = { ...formData };
      if (editingUser && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, dataToSend);
        setSuccessMessage('Usuario actualizado exitosamente');
      } else {
        await userService.createUser(dataToSend);
        setSuccessMessage('Usuario creado exitosamente');
      }

      setShowModal(false);
      resetForm();
      loadUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const message = error.response?.data?.message || 'Error al guardar usuario';
      const errors = error.response?.data?.errors;

      if (errors) {
        setFormErrors(errors);
      }

      setFormError(message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role_id: user.role_id,
      membership_id: user.membership_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await userService.deleteUser(userToDelete.id);
      setSuccessMessage('Usuario eliminado exitosamente');
      loadUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setFormError('Error al eliminar usuario');
      setTimeout(() => setFormError(''), 3000);
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role_id: '',
      membership_id: '',
    });
    setFormErrors({});
    setEditingUser(null);
  };

  const openCreateModal = () => {
    resetForm();
    setFormError('');
    setShowModal(true);
  };

  const getRoleBadgeColor = (roleName) => {
    const colors = {
      superadmin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      repartidor: 'bg-green-100 text-green-800',
      cliente: 'bg-gray-100 text-gray-800',
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">Administra todos los usuarios del sistema</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Usuario
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="mb-6">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
      )}

      {formError && !showModal && (
        <div className="mb-6">
          <Alert type="error" message={formError} onClose={() => setFormError('')} />
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, email, teléfono, rol o membresía..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rol
                </th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Membresía
                </th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center mr-3">
                        <span className="text-xs font-semibold text-indigo-700">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-700">{user.email}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">{user.phone || 'N/A'}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role?.name)}`}>
                      {user.role?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-700">
                      {user.membership?.name || <span className="text-gray-400 italic">Sin membresía</span>}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search ? 'No se encontraron usuarios con ese criterio.' : 'Comienza creando un nuevo usuario.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {pagination.current_page} de {pagination.last_page}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
                disabled={currentPage === pagination.last_page}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de Creación/Edición */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              {editingUser ? 'Actualizar' : 'Crear'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error general del formulario */}
          {formError && showModal && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Juan Pérez"
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="correo@ejemplo.com"
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña {!editingUser && <span className="text-red-500">*</span>}
            </label>
            {editingUser && (
              <p className="text-xs text-gray-500 mb-1.5">Dejar vacío para mantener la contraseña actual</p>
            )}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${formErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="••••••••"
            />
            {formErrors.password && (
              <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
            )}
          </div>

          {/* Teléfono - SOLO NÚMEROS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              onInput={(e) => {
                // Solo permite números
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
              placeholder="5551234567"
              maxLength="10"
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${formErrors.role_id ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">Seleccionar rol...</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {formErrors.role_id && (
              <p className="text-red-500 text-xs mt-1">{formErrors.role_id}</p>
            )}
          </div>

          {/* Membresía */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Membresía
            </label>
            <select
              name="membership_id"
              value={formData.membership_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
            >
              <option value="">Sin membresía</option>
              {memberships.map((membership) => (
                <option key={membership.id} value={membership.id}>
                  {membership.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        title="Eliminar Usuario"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(false);
                setUserToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </>
        }
      >
        <div className="text-center sm:text-left">
          <p className="text-gray-600">
            ¿Seguro de eliminar este usuario?
          </p>
          {userToDelete && (
            <p className="mt-2 text-sm text-gray-500 font-medium">
              {userToDelete.name}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AdminUsers;
