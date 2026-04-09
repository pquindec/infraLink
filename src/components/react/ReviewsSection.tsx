import { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';

interface Review {
  id: string;
  name: string;
  company: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-4 h-4 ${s <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.date).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const initials = review.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const colors = [
    'from-blue-500 to-blue-700',
    'from-indigo-500 to-indigo-700',
    'from-cyan-500 to-cyan-700',
    'from-purple-500 to-purple-700',
    'from-green-500 to-green-700',
    'from-pink-500 to-rose-600',
  ];
  const color = colors[review.name.charCodeAt(0) % colors.length];

  return (
    <div className="group bg-white/3 border border-white/8 hover:border-blue-500/30 hover:bg-white/5 rounded-2xl p-6 transition-all duration-300 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold shadow-md`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">{review.name}</p>
            {review.company && (
              <p className="text-gray-500 text-xs leading-tight truncate">{review.company}</p>
            )}
          </div>
        </div>
        <StarDisplay rating={review.rating} />
      </div>

      {/* Comment */}
      <p className="text-gray-300 text-sm leading-relaxed flex-1">"{review.comment}"</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/15 text-blue-300 text-xs px-2.5 py-1 rounded-full font-medium">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {review.service}
        </span>
        <span className="text-gray-600 text-xs">{date}</span>
      </div>
    </div>
  );
}

function AverageRating({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const rounded = Math.round(avg * 10) / 10;

  return (
    <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-5 py-4">
      <div className="text-4xl font-black text-white">{rounded.toFixed(1)}</div>
      <div>
        <div className="flex items-center gap-0.5 mb-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg
              key={s}
              className={`w-5 h-5 ${s <= Math.round(avg) ? 'text-yellow-400' : 'text-gray-600'}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <p className="text-gray-400 text-xs">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

export default function ReviewsSection({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [visible, setVisible] = useState(6);

  const handleNewReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
    setShowForm(false);
    // Scroll to reviews list
    setTimeout(() => {
      document.getElementById('reviews-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  return (
    <div className="space-y-10">
      {/* Stats + CTA bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <AverageRating reviews={reviews} />
        <button
          onClick={() => setShowForm((v) => !v)}
          className={`inline-flex items-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl border transition-all duration-300 hover:scale-105 ${
            showForm
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/15'
              : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
          }`}
        >
          {showForm ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Dejar mi reseña
            </>
          )}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/3 border border-blue-500/20 rounded-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-white font-bold text-lg">Comparte tu experiencia</h3>
            <p className="text-gray-400 text-sm mt-1">
              Tu opinión ayuda a otros clientes y nos motiva a seguir mejorando.
            </p>
          </div>
          <ReviewForm onNewReview={handleNewReview} />
        </div>
      )}

      {/* Reviews grid */}
      <div id="reviews-list" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
          </div>
        ) : (
          reviews.slice(0, visible).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>

      {/* Load more */}
      {visible < reviews.length && (
        <div className="text-center">
          <button
            onClick={() => setVisible((v) => v + 6)}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium border border-white/10 hover:border-white/25 px-6 py-2.5 rounded-full transition-all duration-200"
          >
            Ver más reseñas ({reviews.length - visible} restantes)
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
