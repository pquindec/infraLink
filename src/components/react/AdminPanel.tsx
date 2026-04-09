import { useState, useEffect, useCallback } from 'react';

interface Review {
  id: string;
  name: string;
  company: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// ── Login screen ───────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (secret: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) { setError('Ingresa la contraseña.'); return; }
    onLogin(value.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2044 100%)' }}>
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Panel Admin</h1>
            <p className="text-gray-500 text-xs">InfraLink Networks</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">Contraseña de administrador</label>
            <input
              type="password"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-all"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main admin panel ───────────────────────────────────────────────────────
function Panel({ secret }: { secret: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const headers = { 'Content-Type': 'application/json', 'x-admin-secret': secret };

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews?admin=1', { headers });
      if (res.status === 401) { setAuthError(true); return; }
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      showToast('Error al cargar reseñas.', 'err');
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const deleteOne = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error();
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast('Reseña eliminada.');
    } catch {
      showToast('Error al eliminar.', 'err');
    } finally {
      setActionId(null);
    }
  };

  const toggleApproval = async (review: Review) => {
    setActionId(review.id);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ approved: !review.approved }),
      });
      if (!res.ok) throw new Error();
      setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, approved: !r.approved } : r));
      showToast(review.approved ? 'Reseña ocultada.' : 'Reseña publicada.');
    } catch {
      showToast('Error al actualizar.', 'err');
    } finally {
      setActionId(null);
    }
  };

  const clearAll = async () => {
    setConfirmClear(false);
    setLoading(true);
    try {
      const res = await fetch('/api/reviews/all', { method: 'DELETE', headers });
      if (!res.ok) throw new Error();
      setReviews([]);
      showToast('Todas las reseñas eliminadas. El sistema está limpio.');
    } catch {
      showToast('Error al limpiar.', 'err');
    } finally {
      setLoading(false);
    }
  };

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a1628' }}>
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2">Contraseña incorrecta.</p>
          <button onClick={() => window.location.reload()} className="text-blue-400 text-sm underline">Volver a intentar</button>
        </div>
      </div>
    );
  }

  const filtered = reviews.filter((r) => {
    if (filter === 'approved') return r.approved;
    if (filter === 'pending') return !r.approved;
    return true;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter((r) => r.approved).length,
    pending: reviews.filter((r) => !r.approved).length,
    avg: reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '—',
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a1628' }}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${toast.type === 'ok' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
          {toast.type === 'ok'
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Gestión de Reseñas</h1>
            <p className="text-gray-500 text-xs">InfraLink Networks · Admin</p>
          </div>
        </div>
        <a href="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Ver sitio
        </a>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Publicadas', value: stats.approved, color: 'text-green-400' },
            { label: 'Ocultas', value: stats.pending, color: 'text-yellow-400' },
            { label: 'Promedio', value: stats.avg + ' ★', color: 'text-yellow-300' },
          ].map((s) => (
            <div key={s.label} className="bg-white/3 border border-white/8 rounded-xl px-4 py-4 text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-gray-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-xl p-1">
            {(['all', 'approved', 'pending'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {f === 'all' ? 'Todas' : f === 'approved' ? 'Publicadas' : 'Ocultas'}
              </button>
            ))}
          </div>

          {/* Danger: clear all */}
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar todas
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
              <span className="text-red-300 text-xs font-medium">¿Eliminar las {reviews.length} reseñas?</span>
              <button onClick={clearAll} className="bg-red-500 hover:bg-red-400 text-white text-xs font-bold px-3 py-1 rounded-lg transition-colors">Sí, eliminar</button>
              <button onClick={() => setConfirmClear(false)} className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded-lg transition-colors">Cancelar</button>
            </div>
          )}
        </div>

        {/* Reviews table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <svg className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando reseñas...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white/2 border border-white/5 rounded-2xl">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No hay reseñas en esta categoría.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((review) => {
              const date = new Date(review.date).toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
              const isActing = actionId === review.id;
              return (
                <div key={review.id} className={`bg-white/3 border rounded-2xl p-5 transition-all duration-200 ${review.approved ? 'border-white/8' : 'border-yellow-500/20 bg-yellow-500/3'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-white font-semibold text-sm">{review.name}</span>
                        {review.company && <span className="text-gray-500 text-xs">· {review.company}</span>}
                        <StarDisplay rating={review.rating} />
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${review.approved ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'}`}>
                          {review.approved ? 'Publicada' : 'Oculta'}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">"{review.comment}"</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <span className="bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/15">{review.service}</span>
                        <span>{date}</span>
                        <span className="font-mono opacity-40">{review.id.slice(0, 8)}…</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Toggle approval */}
                      <button
                        onClick={() => toggleApproval(review)}
                        disabled={isActing}
                        title={review.approved ? 'Ocultar reseña' : 'Publicar reseña'}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 disabled:opacity-40 ${review.approved ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20' : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'}`}
                      >
                        {isActing ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : review.approved ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteOne(review.id)}
                        disabled={isActing}
                        title="Eliminar reseña"
                        className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root: maneja login ─────────────────────────────────────────────────────
export default function AdminPanel() {
  const [secret, setSecret] = useState<string | null>(null);

  if (!secret) return <LoginScreen onLogin={setSecret} />;
  return <Panel secret={secret} />;
}
