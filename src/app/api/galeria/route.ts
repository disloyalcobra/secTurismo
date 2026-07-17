// src/app/api/galeria/route.ts
// Feed público de TODAS las imágenes de TODOS los carruseles activos.
// Usado por la home (sección Noticias) y por /galeria (vista completa).
//
// GET /api/galeria                       → todas las imágenes, fecha_creacion DESC
// GET /api/galeria?limit=N               → primeras N (ordenadas por fecha desc)
// GET /api/galeria?carruselId=N          → filtra por carrusel
//
// Respuesta: array de {
//   idSlide, idCarrusel, claveCarrusel, nombreCarrusel,
//   titulo, descripcion, imagenUrl, album,
//   fechaEvento, fechaCreacion
// }
import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, and, sql } from 'drizzle-orm';
import { db, schema } from '@/db';

const { carruseles, carruselImagenes } = schema;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const carruselIdParam = searchParams.get('carruselId');

    const limit = limitParam ? Math.max(1, Math.min(200, Number(limitParam))) : null;
    const carruselIdFiltro = carruselIdParam ? Number(carruselIdParam) : null;

    const where = and(
      eq(carruselImagenes.activo, true),
      eq(carruseles.activo, true),
      carruselIdFiltro ? eq(carruselImagenes.carruselId, carruselIdFiltro) : undefined,
    );

    const baseQuery = db
      .select({
        idSlide:        carruselImagenes.id,
        idCarrusel:     carruselImagenes.carruselId,
        claveCarrusel:  carruseles.clave,
        nombreCarrusel: carruseles.nombre,
        titulo:         carruselImagenes.titulo,
        descripcion:    carruselImagenes.descripcion,
        imagenUrl:      carruselImagenes.imagenUrl,
        album:          carruselImagenes.album,
        fechaEvento:    carruselImagenes.fechaEvento,
        fechaCreacion:  carruselImagenes.fechaCreacion,
      })
      .from(carruselImagenes)
      .innerJoin(carruseles, eq(carruselImagenes.carruselId, carruseles.id))
      .where(where)
      .orderBy(desc(carruselImagenes.fechaCreacion), desc(carruselImagenes.id));

    const rows = limit
      ? await baseQuery.limit(limit)
      : await baseQuery;

    const items = rows.map((r) => ({
      idSlide:        r.idSlide,
      idCarrusel:     r.idCarrusel,
      claveCarrusel:  r.claveCarrusel,
      nombreCarrusel: r.nombreCarrusel,
      titulo:         r.titulo ?? '',
      descripcion:    r.descripcion ?? '',
      imagenUrl:      r.imagenUrl,
      album:          r.album ?? r.nombreCarrusel,
      fechaEvento:    r.fechaEvento ?? null,
      fechaCreacion:  r.fechaCreacion ?? null,
    }));

    return NextResponse.json(items);
  } catch (e) {
    console.error('Error en /api/galeria:', e);
    return NextResponse.json({ error: 'Error al obtener galería.' }, { status: 500 });
  }
}
