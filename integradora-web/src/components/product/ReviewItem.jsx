import React, { useState } from 'react';
import { getProfilePhotoUrl } from '../../utils/imageUtils';

const ReviewItem = ({ review, isOwnReview, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-black/10 transition-all hover:shadow-md" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar Circle */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-black/10">
          {review.user?.profile_photo_url ? (
            <img
              src={getProfilePhotoUrl(review.user.profile_photo_url)}
              alt={review.user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-black font-bold text-xl bg-gray-100">
              {review.user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>

        <div className="flex-1">
          {/* User Name */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-black text-lg">
              {review.user?.name || 'Nombre del cliente'}
            </h4>
            {isOwnReview && (
              <div className="flex gap-2">
                <button
                  onClick={onEdit}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>

          {/* Star Rating - Supports half stars */}
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = review.rating >= star;
              const halfFilled = review.rating >= star - 0.5 && review.rating < star;

              return (
                <div key={star} className="relative w-5 h-5">
                  {halfFilled ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id={`half-${star}-${review.id}`}>
                          <stop offset="50%" stopColor="currentColor" className="text-black" />
                          <stop offset="50%" stopColor="currentColor" className="text-gray-300" />
                        </linearGradient>
                      </defs>
                      <path
                        fill={`url(#half-${star}-${review.id})`}
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className={`w-5 h-5 ${filled ? 'text-black' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          {/* Review Comment */}
          {review.comment && (
            <p className="text-gray-700 leading-relaxed">
              {review.comment}
            </p>
          )}

          {/* Verified Purchase Badge */}
          {review.verified_purchase && (
            <div className="mt-3">
              <span className="text-green-600 text-xs font-medium flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full inline-flex">
                ✓ Compra verificada
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fade-in">
            <h3 className="text-lg font-bold mb-3 text-gray-900">¿Eliminar reseña?</h3>
            <p className="text-gray-600 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium shadow-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewItem;