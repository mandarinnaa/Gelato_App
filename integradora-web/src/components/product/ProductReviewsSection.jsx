// src/components/product/ProductReviewsSection.jsx
import React, { useState, useEffect } from 'react';
import { reviewService } from '../../api/reviewService';
import RatingStats from './RatingStats';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const ProductReviewsSection = ({ productId, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadReviewsData();
  }, [productId]);

  const loadReviewsData = async () => {
    setLoading(true);
    try {
      // Cargar reviews y stats (siempre)
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getReviews(productId),
        reviewService.getStats(productId)
      ]);

      setReviews(reviewsData.data || []);
      setStats(statsData.data || null);

      // Solo cargar datos de usuario si está autenticado
      if (userId) {
        try {
          const [canReviewData, myReviewData] = await Promise.all([
            reviewService.canReview(productId),
            reviewService.getMyReview(productId)
          ]);

          setCanReview(canReviewData.can_review || false);
          setMyReview(myReviewData.data || null);
        } catch (err) {
          // Si hay error, probablemente no tiene review
          setCanReview(false);
          setMyReview(null);
        }
      }

    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    loadReviewsData();
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewService.deleteReview(productId, reviewId);
      loadReviewsData();
    } catch (error) {
      console.error('Error deleting review:', error);
      setErrorMessage('Error al eliminar la reseña');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  if (loading) {
    return <Loader text="Cargando reseñas..." />;
  }

  return (
    <div className="space-y-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Estadísticas */}
      {stats && stats.total_reviews > 0 && <RatingStats stats={stats} />}

      {/* Mensaje de error */}
      {errorMessage && (
        <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      {/* Botón para escribir reseña */}
      {userId && canReview && !myReview && !showForm && (
        <div className="text-center">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full font-bold uppercase hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Escribir una Reseña
          </button>
        </div>
      )}

      {/* Mensaje si ya tiene reseña */}
      {userId && myReview && !showForm && (
        <div className="bg-white/50 border border-black/20 rounded-2xl p-4 text-center">
          <p className="text-black font-medium">
            Ya has dejado una reseña para este producto. Puedes editarla o eliminarla más abajo.
          </p>
        </div>
      )}

      {/* Mensaje login */}
      {!userId && (
        <div className="bg-white/50 border border-black/20 rounded-2xl p-4 text-center">
          <p className="text-black font-medium">
            <a href="/login" className="font-bold hover:underline">Inicia sesión</a> para dejar una reseña
          </p>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <ReviewForm
          productId={productId}
          existingReview={editingReview}
          onSuccess={handleReviewSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {/* Lista de reseñas */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              isOwnReview={userId === review.user.id}
              onEdit={() => {
                setEditingReview(review);
                setShowForm(true);
              }}
              onDelete={() => handleDeleteReview(review.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/30 rounded-2xl">
          <svg className="w-16 h-16 text-black/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-black text-lg font-medium">Aún no hay reseñas para este producto</p>
          <p className="text-black/70 text-sm mt-2">¡Sé el primero en compartir tu opinión!</p>
        </div>
      )}
    </div>
  );
};

export default ProductReviewsSection;