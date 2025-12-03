import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import ConfirmModal from '../../components/common/ConfirmModal';
import api from '../../api/axiosConfig';
import { userService } from '../../api/userService';
import { getProfilePhotoUrl } from '../../utils/imageUtils';

const Profile = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [addresses, setAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isDestructive: false
  });

  const [formData, setFormData] = useState({
    title: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    reference: ''
  });

  // Cargar fuentes de Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    loadAddresses();
  }, []);

  useEffect(() => {
    setPhoneNumber(user?.phone || '');
  }, [user?.phone]);

  const loadAddresses = async () => {
    try {
      const response = await api.get('/my-addresses');
      setAddresses(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar direcciones:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor selecciona una imagen válida');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('La imagen no puede pesar más de 2MB');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      handleUploadPhoto(file);
    }
  };

  const handleUploadPhoto = async (file) => {
    setIsUploadingPhoto(true);
    try {
      const response = await userService.updateProfilePhoto(user.id, file);

      let photoUrl = response.data.profile_photo_url;

      const updatedUser = { ...user, profile_photo_url: photoUrl };
      dispatch(setCredentials({ token: localStorage.getItem('token'), user: updatedUser }));
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setTimeout(() => {
        setPhotoPreview(null);
      }, 500);

      setSuccessMessage('Foto de perfil actualizada exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error al subir foto:', error);
      setErrorMessage('Error al actualizar la foto de perfil');
      setPhotoPreview(null);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar foto de perfil',
      message: '¿Estás seguro de que deseas eliminar tu foto de perfil?',
      onConfirm: async () => {
        setIsUploadingPhoto(true);
        try {
          await userService.deleteProfilePhoto(user.id);

          const updatedUser = { ...user, profile_photo_url: null };
          dispatch(setCredentials({ token: localStorage.getItem('token'), user: updatedUser }));
          localStorage.setItem('user', JSON.stringify(updatedUser));

          setPhotoPreview(null);
          setSuccessMessage('Foto de perfil eliminada exitosamente');
          setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
          console.error('Error al eliminar foto:', error);
          setErrorMessage('Error al eliminar la foto de perfil');
          setTimeout(() => setErrorMessage(''), 3000);
        } finally {
          setIsUploadingPhoto(false);
        }
      },
      isDestructive: true
    });
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      setErrorMessage('Por favor ingresa un número de teléfono válido de 10 dígitos');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setIsUpdatingPhone(true);
    try {
      const response = await userService.updatePhone(user.id, phoneNumber);

      const updatedUser = { ...user, phone: response.data.phone };
      dispatch(setCredentials({ token: localStorage.getItem('token'), user: updatedUser }));
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setIsPhoneModalOpen(false);
      setSuccessMessage('Número de teléfono actualizado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error al actualizar teléfono:', error);
      setErrorMessage(error.response?.data?.message || 'Error al actualizar el número de teléfono');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const handleOpenModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        title: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        postal_code: '',
        reference: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, user_id: user.id };

      if (editingAddress) {
        await api.put(`/addresses/${editingAddress.id}`, data);
        setSuccessMessage('Dirección actualizada exitosamente');
      } else {
        await api.post('/addresses', data);
        setSuccessMessage('Dirección creada exitosamente');
      }

      setIsModalOpen(false);
      loadAddresses();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar dirección',
      message: '¿Estás seguro de que deseas eliminar esta dirección?',
      onConfirm: async () => {
        try {
          await api.delete(`/addresses/${id}`);
          setSuccessMessage('Dirección eliminada exitosamente');
          loadAddresses();
          setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
          console.error('Error:', error);
        }
      },
      isDestructive: true
    });
  };

  const getProfileImage = () => {
    if (photoPreview) return photoPreview;
    return getProfilePhotoUrl(user?.profile_photo_url);
  };

  const profileImage = getProfileImage();

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success/Error Alerts */}
        {successMessage && (
          <div className="mb-8">
            <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
          </div>
        )}
        {errorMessage && (
          <div className="mb-8">
            <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
          </div>
        )}

        {/* Profile Info Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-black/5 p-8 md:p-12 mb-16">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">

            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-black/10 shadow-2xl">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={user?.name || 'Perfil'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <span className="text-6xl font-black text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Overlay */}
                <div
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                  onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
                >
                  {isUploadingPhoto ? (
                    <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-white transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="px-6 py-2 bg-black text-white text-sm font-bold uppercase rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
                >
                  {profileImage ? 'Cambiar' : 'Subir'}
                </button>
                {profileImage && (
                  <button
                    onClick={handleDeletePhoto}
                    disabled={isUploadingPhoto}
                    className="px-6 py-2 bg-white text-red-600 border-2 border-red-100 text-sm font-bold uppercase rounded-full hover:bg-red-50 hover:border-red-200 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            {/* User Details Grid */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre Completo</label>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-lg font-bold text-black">{user?.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</label>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-lg font-bold text-black">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Teléfono</label>
                  <button
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="text-xs font-bold text-black hover:underline uppercase"
                  >
                    {user?.phone ? 'Editar' : 'Agregar'}
                  </button>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-lg font-bold text-black">{user?.phone || 'No registrado'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Puntos Acumulados</label>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-bold text-black">
                    {user?.points || 0} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="space-y-8">
          {/* Title with Purple Background */}
          <div className="bg-[#E6D5FF] rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight mb-2">
                MIS DIRECCIONES.
              </h2>
              <p className="text-black text-lg">
                Gestiona tus direcciones de entrega.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-8 py-4 bg-black text-white font-bold text-sm uppercase rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Dirección
            </button>
          </div>

          {/* Addresses Grid */}
          {addresses.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No hay direcciones registradas</h3>
              <p className="text-gray-500 mb-8">Comienza agregando tu primera dirección de entrega.</p>
              <button
                onClick={() => handleOpenModal()}
                className="px-8 py-3 bg-black text-white font-bold text-sm uppercase rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
              >
                Agregar Dirección
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {addresses.map(address => (
                <div key={address.id} className="group bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center justify-center text-black">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleOpenModal(address)}
                        className="p-2 text-black hover:bg-gray-100 rounded-full transition-colors"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-black uppercase mb-4">{address.title}</h3>

                  <div className="space-y-2 text-gray-600 mb-6">
                    <p className="font-medium">{address.street} {address.number}</p>
                    <p>{address.neighborhood}</p>
                    <p>{address.city}, {address.state}</p>
                    <p className="text-sm bg-gray-100 inline-block px-2 py-1 rounded-lg">C.P. {address.postal_code}</p>
                  </div>

                  {address.reference && (
                    <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 italic border border-gray-100">
                      "{address.reference}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phone Modal */}
        <Modal
          isOpen={isPhoneModalOpen}
          onClose={() => {
            setIsPhoneModalOpen(false);
            setPhoneNumber(user?.phone || '');
          }}
          title="ACTUALIZAR TELÉFONO"
          size="sm"
        >
          <form onSubmit={handleUpdatePhone} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-black uppercase mb-2">
                Número de teléfono
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setPhoneNumber(value);
                }}
                placeholder="1234567890"
                maxLength="10"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                required
              />
              <p className="mt-2 text-xs text-gray-500 font-medium">
                Ingresa un número de 10 dígitos sin espacios ni guiones
              </p>
            </div>
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsPhoneModalOpen(false);
                  setPhoneNumber(user?.phone || '');
                }}
                className="flex-1 px-6 py-3 text-sm font-bold uppercase text-gray-500 hover:text-black transition-colors"
                disabled={isUpdatingPhone}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUpdatingPhone}
                className="flex-1 px-6 py-3 bg-black text-white text-sm font-bold uppercase rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isUpdatingPhone ? 'Actualizando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Address Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAddress ? 'EDITAR DIRECCIÓN' : 'NUEVA DIRECCIÓN'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-black uppercase mb-2">
                Título de la dirección
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Casa, Oficina, etc."
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-black uppercase mb-2">
                  Calle
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black uppercase mb-2">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-black uppercase mb-2">
                Colonia
              </label>
              <input
                type="text"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black uppercase mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black uppercase mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-black uppercase mb-2">
                Código Postal
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-medium"
                maxLength="5"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black uppercase mb-2">
                Referencias (opcional)
              </label>
              <textarea
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                rows="3"
                placeholder="Referencias para encontrar tu domicilio..."
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-medium resize-none"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-3 text-sm font-bold uppercase text-gray-500 hover:text-black transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-black text-white text-sm font-bold uppercase rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
              >
                {editingAddress ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          isDestructive={confirmModal.isDestructive}
        />
      </div>
    </div>
  );
};

export default Profile;