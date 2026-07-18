// src/app/api/galeria/route.ts
// Feed público agrupado por carrusel (un post = un carrusel con N imágenes).
// Excluye carruseles tipo 'hero' (carrusel principal de la home).
//
// GET /api/galeria              → todos los posts, más recientes primero
// GET /api/galeria?limit=N      → primeros N posts
// GET /api/galeria?carruselId=N → un solo post
import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, and, asc, ne } from 'drizzle-orm';
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
      ne(carruseles.tipo, 'hero'),
      ne(carruseles.clave, 'principal'),
      carruselIdFiltro ? eq(carruselImagenes.carruselId, carruselIdFiltro) : undefined,
    );

    const rows = await db
      .select({
        idSlide:             carruselImagenes.id,
        idCarrusel:          carruselImagenes.carruselId,
        claveCarrusel:       carruseles.clave,
        nombreCarrusel:      carruseles.nombre,
        descripcionCarrusel: carruseles.descripcion,
        carruselOrden:       carruseles.orden,
        titulo:              carruselImagenes.titulo,
        descripcion:         carruselImagenes.descripcion,
        imagenUrl:           carruselImagenes.imagenUrl,
        album:               carruselImagenes.album,
        orden:               carruselImagenes.orden,
        fechaEvento:         carruselImagenes.fechaEvento,
        fechaCreacion:       carruselImagenes.fechaCreacion,
        linkDestino:         carruselImagenes.linkDestino,
        textoBoton:          carruselImagenes.textoBoton,
      })
      .from(carruselImagenes)
      .innerJoin(carruseles, eq(carruselImagenes.carruselId, carruseles.id))
      .where(where)
      .orderBy(desc(carruseles.orden), asc(carruselImagenes.orden), desc(carruselImagenes.id));

    type SlideRow = (typeof rows)[number];
    type PostAcc = {
      idCarrusel: number;
      claveCarrusel: string;
      nombreCarrusel: string;
      descripcionCarrusel: string;
      carruselOrden: number | null;
      imagenes: {
        idSlide: number;
        titulo: string;
        descripcion: string;
        imagenUrl: string;
        album: string;
        orden: number;
        fechaEvento: string | null;
        fechaCreacion: string | null;
        linkDestino: string;
        textoBoton: string;
      }[];
    };

    const postsMap = new Map<number, PostAcc>();

    for (const r of rows) {
      if (!postsMap.has(r.idCarrusel)) {
        postsMap.set(r.idCarrusel, {
          idCarrusel:          r.idCarrusel,
          claveCarrusel:       r.claveCarrusel,
          nombreCarrusel:      r.nombreCarrusel,
          descripcionCarrusel: r.descripcionCarrusel ?? '',
          carruselOrden:       r.carruselOrden,
          imagenes:            [],
        });
      }
      postsMap.get(r.idCarrusel)!.imagenes.push({
        idSlide:       r.idSlide,
        titulo:        r.titulo ?? '',
        descripcion:   r.descripcion ?? '',
        imagenUrl:     r.imagenUrl,
        album:         r.album ?? r.nombreCarrusel,
        orden:         r.orden ?? 0,
        fechaEvento:   r.fechaEvento ?? null,
        fechaCreacion: r.fechaCreacion ?? null,
        linkDestino:   r.linkDestino ?? '',
        textoBoton:    r.textoBoton ?? '',
      });
    }

    const posts = Array.from(postsMap.values())
      .map((p) => {
        const sorted = [...p.imagenes].sort((a, b) => a.orden - b.orden || a.idSlide - b.idSlide);
        const portada = sorted[0];
        const fechas = sorted
          .map((img) => img.fechaCreacion)
          .filter(Boolean)
          .sort()
          .reverse();

        return {
          idCarrusel:          p.idCarrusel,
          claveCarrusel:       p.claveCarrusel,
          nombreCarrusel:      p.nombreCarrusel,
          descripcionCarrusel: p.descripcionCarrusel,
          portadaUrl:          portada?.imagenUrl ?? '',
          totalImagenes:       sorted.length,
          fechaCreacion:       fechas[0] ?? null,
          imagenes:            sorted,
        };
      })
      .filter((p) => p.totalImagenes > 0)
      .sort((a, b) => {
        const da = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
        const db = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
        if (db !== da) return db - da;
        return (b.idCarrusel ?? 0) - (a.idCarrusel ?? 0);
      });

    const result = limit ? posts.slice(0, limit) : posts;
    return NextResponse.json(result);
  } catch (e) {
    console.error('Error en /api/galeria:', e);
    return NextResponse.json({ error: 'Error al obtener galería.' }, { status: 500 });
  }
}
