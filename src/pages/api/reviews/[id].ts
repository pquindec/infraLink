import type { APIRoute } from 'astro';
import { kv } from '@vercel/kv';

const KV_KEY = 'infralink:reviews';

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

function isAuthorized(request: Request): boolean {
  const secret = import.meta.env.ADMIN_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('x-admin-secret');
  return auth === secret;
}

export const DELETE: APIRoute = async ({ params, request }) => {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'No autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = params;

  try {
    const stored = await kv.get<Review[]>(KV_KEY) ?? [];

    if (id === 'all') {
      await kv.set(KV_KEY, []);
      return new Response(JSON.stringify({ success: true, deleted: stored.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updated = stored.filter((r) => r.id !== id);
    if (updated.length === stored.length) {
      return new Response(JSON.stringify({ error: 'Reseña no encontrada.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await kv.set(KV_KEY, updated);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('DELETE /api/reviews/[id] error:', err);
    return new Response(JSON.stringify({ error: 'Error al eliminar la reseña.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'No autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const stored = await kv.get<Review[]>(KV_KEY) ?? [];
    const updated = stored.map((r) =>
      r.id === id ? { ...r, ...body, id: r.id } : r
    );
    await kv.set(KV_KEY, updated);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('PATCH /api/reviews/[id] error:', err);
    return new Response(JSON.stringify({ error: 'Error al actualizar la reseña.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
