// src/app/api/carousel/route.ts
// CRUD multi-carrusel — usa Turso via Drizzle ORM
//
// Compatibilidad con el sitio público:
//   GET  /api/carousel  → imágenes del carrusel 'principal' (formato {idSlide, ...})
//                          igual que la versión anterior.
//
// Administración (dashboard):
//   GET  /api/carousel?list=1            → lista de carruseles (con conteo de imágenes)
//   GET  /api/carousel?carruselId=N      → imágenes de un carrusel específico
//   POST /api/carousel  {_action: 'create', nombre, clave, descripcion}  → crea carrusel
//   POST /api/carousel  {carruselId, ...} → crea imagen en un carrusel
//   PUT  /api/carousel                    → actualiza imagen
//   DELETE ?idSlide=N                     → elimina imagen
//   DELETE ?carruselId=N                  → elimina carrusel
import { NextRequest, NextResponse } from 'next/server';
import { eq, asc, sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { logAdminAction } from '@/lib/audit';
import { decrypt } from '@/lib/auth';

const { carruseles, carruselImagenes } = schema;

async function getAdmin(req: NextRequest) {
  const tok = req.cookies.get('admin_session')?.value;
  if (tok) { const s = await decrypt(tok); return s?.username || 'admin'; }
  return 'admin';
}

async function getPrincipalId(): Promise<number> {
  const rows = await db.select().from(carruseles).where(eq(carruseles.clave, 'principal')).limit(1);
  if (rows.length) return rows[0].id;
  const ins = await db.insert(carruseles).values({
    clave: 'principal', nombre: 'Carrusel Principal', tipo: 'principal', activo: true, orden: 0,
  }).returning({ id: carruseles.id });
  return ins[0].id;
}

function mapImagen(r: typeof carruselImagenes.$inferSelect) {
  return {
    idSlide:     r.id,
    titulo:      r.titulo ?? '',
    descripcion: r.descripcion ?? '',
    urlImagen:   r.imagenUrl,
    urlEnlace:   r.linkDestino ?? '',
    textoBoton:  r.textoBoton ?? '',
    orden:       r.orden ?? 0,
    activo:      r.activo ?? true,
  };
}

async function listarCarruseles() {
  return db
    .select({
      id:            carruseles.id,
      clave:         carruseles.clave,
      nombre:        carruseles.nombre,
      descripcion:   carruseles.descripcion,
      orden:         carruseles.orden,
      activo:        carruseles.activo,
      totalImagenes: sql<number>`(SELECT COUNT(*) FROM ${carruselImagenes} WHERE ${carruselImagenes.carruselId} = ${carruseles.id})`,
    })
    .from(carruseles)
    .orderBy(asc(carruseles.orden));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listar = searchParams.get('list');
  const carruselIdParam = searchParams.get('carruselId');

  try {
    if (listar === '1') {
      // Asegurar que el principal exista antes de listar
      const existentes = await db.select({ id: carruseles.id }).from(carruseles).where(eq(carruseles.clave, 'principal')).limit(1);
      if (!existentes.length) await getPrincipalId();
      return NextResponse.json(await listarCarruseles());
    }

    const carruselId = carruselIdParam
      ? Number(carruselIdParam)
      : await getPrincipalId();

    if (!carruselId) {
      return NextResponse.json({ error: 'carruselId inválido.' }, { status: 400 });
    }
    const rows = await db
      .select()
      .from(carruselImagenes)
      .where(eq(carruselImagenes.carruselId, carruselId))
      .orderBy(asc(carruselImagenes.orden));
    return NextResponse.json(rows.map(mapImagen));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al obtener carrusel.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  try {
    const body = await req.json();

    // Crear un carrusel nuevo
    if (body._action === 'create') {
      const { nombre, clave, descripcion } = body;
      if (!nombre || !clave) {
        return NextResponse.json({ error: 'nombre y clave requeridos.' }, { status: 400 });
      }
      const slug = String(clave).toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const ins = await db.insert(carruseles).values({
        clave: slug,
        nombre,
        descripcion: descripcion ?? null,
        tipo: 'galeria',
        orden: body.orden ?? 0,
        activo: true,
      }).returning();
      await logAdminAction(admin, ip, `Creó carrusel: ${nombre}`, 'Carrusel');
      return NextResponse.json({
        id: ins[0].id, clave: ins[0].clave, nombre: ins[0].nombre,
        descripcion: ins[0].descripcion, orden: ins[0].orden, activo: ins[0].activo,
        totalImagenes: 0,
      }, { status: 201 });
    }

    // Crear imagen en un carrusel
    const carruselId = body.carruselId ? Number(body.carruselId) : await getPrincipalId();
    if (!body.urlImagen) {
      return NextResponse.json({ error: 'urlImagen requerida.' }, { status: 400 });
    }
    const ins = await db.insert(carruselImagenes).values({
      carruselId,
      imagenUrl:   body.urlImagen,
      titulo:      body.titulo ?? null,
      descripcion: body.descripcion ?? null,
      linkDestino: body.urlEnlace ?? null,
      textoBoton:  body.textoBoton ?? null,
      orden:       body.orden ?? 0,
      activo:      body.activo !== false,
    }).returning();
    await logAdminAction(admin, ip, `Creó diapositiva: ${body.titulo ?? '(sin título)'}`, 'Carrusel');
    return NextResponse.json(mapImagen(ins[0]), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al crear.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  try {
    const body = await req.json();
    const { idSlide } = body;
    if (!idSlide) return NextResponse.json({ error: 'idSlide requerido.' }, { status: 400 });
    await db.update(carruselImagenes).set({
      imagenUrl:   body.urlImagen,
      titulo:      body.titulo,
      descripcion: body.descripcion,
      linkDestino: body.urlEnlace,
      textoBoton:  body.textoBoton,
      orden:       body.orden,
      activo:      body.activo,
    }).where(eq(carruselImagenes.id, idSlide));
    await logAdminAction(admin, ip, `Editó diapositiva ID: ${idSlide}`, 'Carrusel');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al actualizar.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  const { searchParams } = new URL(req.url);
  const idSlide = Number(searchParams.get('idSlide'));
  const carruselId = Number(searchParams.get('carruselId'));

  try {
    if (idSlide) {
      await db.delete(carruselImagenes).where(eq(carruselImagenes.id, idSlide));
      await logAdminAction(admin, ip, `Eliminó diapositiva ID: ${idSlide}`, 'Carrusel');
      return NextResponse.json({ success: true });
    }
    if (carruselId) {
      const target = await db.select().from(carruseles).where(eq(carruseles.id, carruselId)).limit(1);
      if (target[0]?.clave === 'principal') {
        return NextResponse.json({ error: 'No se puede eliminar el Carrusel Principal.' }, { status: 400 });
      }
      await db.delete(carruseles).where(eq(carruseles.id, carruselId));
      await logAdminAction(admin, ip, `Eliminó carrusel ID: ${carruselId}`, 'Carrusel');
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'idSlide o carruselId requerido.' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al eliminar.' }, { status: 500 });
  }
}
