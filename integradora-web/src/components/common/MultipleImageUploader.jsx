import React, { useState, useEffect } from 'react';
import Alert from './Alert';

const MultipleImageUploader = ({
  existingImages = [],
  onImagesChange,
  maxImages = 5
}) => {
  const [images, setImages] = useState([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Inicializar con imágenes existentes
    if (existingImages && existingImages.length > 0) {
      const formattedImages = existingImages.map((img, index) => ({
        id: img.id || null,
        url: img.url,
        file: null,
        isExisting: true,
        isPrimary: img.is_primary || index === 0,
      }));
      setImages(formattedImages);

      const primaryIdx = formattedImages.findIndex(img => img.isPrimary);
      setPrimaryIndex(primaryIdx >= 0 ? primaryIdx : 0);
    }
  }, [existingImages]);

  useEffect(() => {
    // Notificar cambios al componente padre
    const newFiles = images
      .filter(img => !img.isExisting && img.file)
      .map(img => img.file);

    onImagesChange({
      newFiles,
      primaryIndex: images.findIndex((_, idx) => idx === primaryIndex),
      deleteIds: imagesToDelete,
    });
  }, [images, primaryIndex, imagesToDelete]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > maxImages) {
      setErrorMessage(`Solo puedes subir un máximo de ${maxImages} imágenes`);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const newImages = files.map(file => ({
      id: null,
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
      isPrimary: false,
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];

    // Si es una imagen existente, agregarla a la lista de eliminación
    if (imageToRemove.isExisting && imageToRemove.id) {
      setImagesToDelete(prev => [...prev, imageToRemove.id]);
    }

    // Remover del estado local
    setImages(prev => prev.filter((_, i) => i !== index));

    // Ajustar el índice primario si es necesario
    if (primaryIndex === index) {
      setPrimaryIndex(0);
    } else if (primaryIndex > index) {
      setPrimaryIndex(prev => prev - 1);
    }
  };

  const handleSetPrimary = (index) => {
    setPrimaryIndex(index);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));

    if (dragIndex === dropIndex) return;

    const newImages = [...images];
    const draggedImage = newImages[dragIndex];

    newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    setImages(newImages);

    // Ajustar índice primario
    if (primaryIndex === dragIndex) {
      setPrimaryIndex(dropIndex);
    } else if (dragIndex < primaryIndex && dropIndex >= primaryIndex) {
      setPrimaryIndex(primaryIndex - 1);
    } else if (dragIndex > primaryIndex && dropIndex <= primaryIndex) {
      setPrimaryIndex(primaryIndex + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes del producto ({images.length}/{maxImages})
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Arrastra para reordenar. Haz clic en la estrella para marcar como imagen principal.
        </p>
      </div>

      {errorMessage && (
        <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {images.map((image, index) => (
          <div
            key={`${image.id || 'new'}-${index}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-move transition-all ${primaryIndex === index
                ? 'border-yellow-400 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <img
              src={image.url}
              alt={`Imagen ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity flex gap-2">
                {/* Botón estrella */}
                <button
                  type="button"
                  onClick={() => handleSetPrimary(index)}
                  className={`p-2 rounded-full transition-colors ${primaryIndex === index
                      ? 'bg-yellow-400 text-white'
                      : 'bg-white text-gray-700 hover:bg-yellow-50'
                    }`}
                  title="Marcar como principal"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>

                {/* Botón eliminar */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Badge de imagen principal */}
            {primaryIndex === index && (
              <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Principal
              </div>
            )}

            {/* Badge de orden */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs font-bold px-2 py-1 rounded">
              #{index + 1}
            </div>
          </div>
        ))}

        {/* Botón agregar imagen */}
        {images.length < maxImages && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex flex-col items-center justify-center transition-colors bg-gray-50 hover:bg-gray-100">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-gray-500 mt-2">Agregar</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No hay imágenes. Haz clic en "Agregar" para subir.</p>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUploader;