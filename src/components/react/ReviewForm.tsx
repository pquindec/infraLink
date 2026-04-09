import { useState } from 'react';

const SERVICES = [
  'Infraestructura tecnológica',
  'Soporte técnico especializado',
  'Redes y telecomunicaciones',
  'Seguridad electrónica',
  'Soluciones WiFi (Mesh / Repetidores)',
  'Otro',
];

interface Review {
  id: string;
  name: string;
  company: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewFormProps {
  onNewReview?: (review: Review) => void;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none transition-transform duration-150 hover:scale-110"
            aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          >
            <svg
              className={`w-9 h-9 transition-colors duration-150 ${
                star <= (hovered || value)
                  ? 'text-yellow-400'
                  : 'text-gray-600'
              }`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
        {(hovered || value) > 0 && (
          <span className="ml-2 text-yellow-400 text-sm font-semibold">
            {labels[hovered || value]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ReviewForm({ onNewReview }: ReviewFormProps) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    service: '',
    rating: 0,
    comment: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.rating === 0) {
      setErrorMsg('Por favor selecciona una calificación.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Error al enviar la reseña.');
        setStatus('error');
        return;
      }
      setStatus('success');
      onNewReview?.(data.review);
      setForm({ name: '', company: '', service: '', rating: 0, comment: '' });
    } catch {
      setErrorMsg('No se pudo conectar con el servidor.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-bold text-xl mb-1">¡Gracias por tu reseña!</h3>
          <p className="text-gray-400 text-sm">Tu opinión ha sido publicada y ayuda a otros clientes a conocernos mejor.</p>
        </div>
        <button
          onClick={() => setStatus('idle')}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          Escribir otra reseña
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Tu nombre completo"
            required
            maxLength={80}
            className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 focus:bg-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none transition-all duration-200"
          />
        </div>
        {/* Company */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">
            Empresa <span className="text-gray-500 text-xs">(opcional)</span>
          </label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => set('company', e.target.value)}
            placeholder="Nombre de tu empresa"
            maxLength={80}
            className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 focus:bg-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Service */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-1.5">
          Servicio recibido <span className="text-red-400">*</span>
        </label>
        <select
          value={form.service}
          onChange={(e) => set('service', e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 appearance-none cursor-pointer"
          style={{ color: form.service ? 'white' : '#6b7280' }}
        >
          <option value="" disabled style={{ backgroundColor: '#0f2044', color: '#9ca3af' }}>
            Selecciona el servicio...
          </option>
          {SERVICES.map((s) => (
            <option key={s} value={s} style={{ backgroundColor: '#0f2044', color: 'white' }}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Star rating */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Calificación <span className="text-red-400">*</span>
        </label>
        <StarRating value={form.rating} onChange={(v) => set('rating', v)} />
      </div>

      {/* Comment */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-1.5">
          Tu reseña <span className="text-red-400">*</span>
        </label>
        <textarea
          value={form.comment}
          onChange={(e) => set('comment', e.target.value)}
          placeholder="Cuéntanos tu experiencia con nuestro servicio..."
          required
          minLength={10}
          maxLength={500}
          rows={4}
          className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 focus:bg-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none transition-all duration-200 resize-none"
        />
        <p className="text-right text-xs text-gray-600 mt-1">{form.comment.length}/500</p>
      </div>

      {/* Error message */}
      {status === 'error' && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-base py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-blue-500/20"
      >
        {status === 'loading' ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Publicar reseña
          </>
        )}
      </button>
    </form>
  );
}
