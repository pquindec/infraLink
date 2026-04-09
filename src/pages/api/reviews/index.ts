import type { APIRoute } from 'astro';
import { kv } from '@vercel/kv';
import { randomUUID } from 'crypto';

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

// Reseñas de ejemplo para cuando el store esté vacío (primer despliegue)
const SEED_REVIEWS: Review[] = [
  {
    id: 'demo-001',
    name: 'Carlos Mendoza',
    company: 'Distribuidora Andina S.A.',
    service: 'Infraestructura tecnológica',
    rating: 5,
    comment: 'Excelente servicio. Renovaron completamente el equipamiento de nuestra oficina. El proceso fue rápido y sin interrupciones en nuestra operación.',
    date: '2026-03-15T10:00:00Z',
    approved: true,
  },
  {
    id: 'demo-002',
    name: 'María Elena Torres',
    company: 'Clínica Santa Rosa',
    service: 'Redes y telecomunicaciones',
    rating: 5,
    comment: 'Implementaron nuestra red WiFi empresarial con tecnología Mesh. Cobertura total en todas las áreas. Muy profesionales y puntuales.',
    date: '2026-03-22T14:30:00Z',
    approved: true,
  },
  {
    id: 'demo-003',
    name: 'Jorge Andrade',
    company: 'Constructora Pacífico',
    service: 'Seguridad electrónica',
    rating: 5,
    comment: 'Instalaron el sistema CCTV en nuestras instalaciones. El monitoreo funciona perfecto y el soporte post-instalación ha sido muy oportuno.',
    date: '2026-04-01T09:00:00Z',
    approved: true,
  },
];

async function getReviews(): Promise<Review[]> {
  const stored = await kv.get<Review[]>(KV_KEY);
  if (!stored || stored.length === 0) {
    // Primer uso: sembrar reseñas de demo
    await kv.set(KV_KEY, SEED_REVIEWS);
    return SEED_REVIEWS;
  }
  return stored;
}

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const isAdmin = url.searchParams.get('admin') === '1';
    if (isAdmin) {
      const secret = import.meta.env.ADMIN_SECRET;
      const auth = request.headers.get('x-admin-secret');
      if (!secret || auth !== secret) {
        return new Response(JSON.stringify({ error: 'No autorizado.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // Admin ve todas, incluidas las ocultas
      const all = await getReviews();
      return new Response(JSON.stringify({ reviews: all }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const all = await getReviews();
    const approved = all.filter((r) => r.approved);
    return new Response(JSON.stringify({ reviews: approved }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('GET /api/reviews error:', err);
    return new Response(JSON.stringify({ error: 'Error al cargar reseñas.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, company, service, rating, comment } = body;

    if (!name?.trim() || !service?.trim() || !comment?.trim() || !rating) {
      return new Response(
        JSON.stringify({ error: 'Completa todos los campos obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return new Response(
        JSON.stringify({ error: 'La calificación debe ser entre 1 y 5.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (comment.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'La reseña debe tener al menos 10 caracteres.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const newReview: Review = {
      id: randomUUID(),
      name: name.trim().slice(0, 80),
      company: (company ?? '').trim().slice(0, 80),
      service: service.trim(),
      rating: Number(rating),
      comment: comment.trim().slice(0, 500),
      date: new Date().toISOString(),
      approved: true,
    };

    const current = await getReviews();
    const updated = [newReview, ...current];
    await kv.set(KV_KEY, updated);

    return new Response(JSON.stringify({ success: true, review: newReview }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/reviews error:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno al guardar la reseña.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
