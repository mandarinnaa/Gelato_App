// src/components/product/RatingStats.jsx
import React from 'react';

const RatingStats = ({ stats }) => {
  if (!stats) return null;

  const { average_rating, total_reviews, rating_distribution } = stats;

  return (
    <div className="bg-white/50 rounded-2xl p-8 border border-black/10" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Left Side - Large Rating Number and Stars */}
        <div className="text-center md:text-left">
          <div className="text-7xl md:text-8xl font-black text-black mb-3">
            {average_rating.toFixed(1)}
          </div>
          <div className="flex justify-center md:justify-start gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = average_rating >= star;
              const halfFilled = average_rating >= star - 0.5 && average_rating < star;

              return (
                <div key={star} className="relative w-6 h-6">
                  {halfFilled ? (
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id={`rating-half-${star}`}>
                          <stop offset="50%" stopColor="currentColor" className="text-black" />
                          <stop offset="50%" stopColor="currentColor" className="text-gray-300" />
                        </linearGradient>
                      </defs>
                      <path
                        fill={`url(#rating-half-${star})`}
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className={`w-6 h-6 ${filled ? 'text-black' : 'text-gray-300'}`}
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
          <p className="text-sm text-black/70">
            {total_reviews} {total_reviews === 1 ? 'reseña' : 'reseñas'}
          </p>
        </div>

        {/* Right Side - Yellow Rating Bars */}
        <div className="md:col-span-2 space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = rating_distribution[star] || 0;
            const percentage = total_reviews > 0 ? (count / total_reviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-bold text-black w-8">
                  {star} ★
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#E8F442] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-black/70 w-12 text-right font-medium">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RatingStats;