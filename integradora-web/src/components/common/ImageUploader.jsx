import React, { useRef, useState } from 'react';
import Alert from './Alert';

const ImageUploader = ({ currentImage, onImageChange, onImageRemove }) => {
  const fileInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validar tipo de archivo con MIME types específicos
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      if (!validTypes.includes(file.type)) {
        setErrorMessage('Por favor selecciona una imagen válida (JPEG, JPG, PNG o WEBP)');
        setTimeout(() => setErrorMessage(''), 3000);
        e.target.value = ''; // Limpiar el input
        return;
      }

      // Validar tamaño (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('La imagen no puede pesar más de 2MB');
        setTimeout(() => setErrorMessage(''), 3000);
        e.target.value = ''; // Limpiar el input
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        // Pasar el archivo original (File object) y el preview
        onImageChange(file, reader.result);

        // Debug: verificar que el archivo es correcto
        console.log('✅ Imagen seleccionada:', {
          name: file.name,
          type: file.type,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          isFile: file instanceof File
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Imagen del producto
      </label>

      {errorMessage && (
        <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      {currentImage ? (
        <div className="relative inline-block">
          <img
            src={currentImage}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="image-upload"
            className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-slate-400 transition-colors"
          >
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="mt-2 text-sm text-gray-500">Haz clic para subir imagen</span>
            <span className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP hasta 2MB</span>
            <input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;