// src/components/product/ReviewForm.jsx
import React, { useState } from 'react';
import RatingDisplay from '../common/RatingDisplay';
import { reviewService } from '../../api/reviewService';

const ReviewForm = ({ productId, existingReview, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (existingReview) {
        await reviewService.updateReview(productId, existingReview.id, { rating, comment });
      } else {
        await reviewService.createReview(productId, { rating, comment });
      }
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la reseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-bold text-black uppercase" style={{ fontFamily: "'Lexend Giga', sans-serif" }}>
        {existingReview ? 'Editar Reseña' : 'Escribe una Reseña'}
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Calificación *
        </label>
        <RatingDisplay
          value={rating}
          readOnly={false}
          size="large"
          showText={true}
          onChange={setRating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comentario (opcional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          placeholder="Comparte tu experiencia con este producto..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/1000 caracteres
        </p>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold uppercase hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "'Lexend Giga', sans-serif" }}
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-bold uppercase hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          style={{ fontFamily: "'Lexend Giga', sans-serif" }}
        >
          {loading ? 'Guardando...' : existingReview ? 'Actualizar' : 'Publicar'}
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;