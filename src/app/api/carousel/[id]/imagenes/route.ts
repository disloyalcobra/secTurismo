// src/app/api/carousel/[id]/imagenes/route.ts
// CRUD de imágenes de un carrusel específico.
// GET    /api/carousel/[id]/imagenes
// POST   /api/carousel/[id]/imagenes   {urlImagen, titulo, descripcion, ...}
// PUT    /api/carousel/[id]/imagenes   {idSlide, ...}
// DELETE /api/carousel/[id]/imagenes?idSlide=N
import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db, schema } from '@/db';
import { logAdminAction } from '@/lib/audit';
import { decrypt } from '@/lib/auth';

const { carruseles, carruselImagenes } = schema;

async function getAdmin(req: NextRequest) {
  const tok = req.cookies.get('admin_session')?.value;
  if (tok) { const s = await decrypt(tok); return s?.username || 'admin'; }
  return 'admin';
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cid = Number(id);
    if (!cid) return NextResponse.json({ error: 'id inválido.' }, { status: 400 });

    const carrusel = await db.select({ id: carruseles.id }).from(carruseles).where(eq(carruseles.id, cid)).limit(1);
    if (!carrusel.length) return NextResponse.json({ error: 'Carrusel no encontrado.' }, { status: 404 });

    const rows = await db
      .select()
      .from(carruselImagenes)
      .where(eq(carruselImagenes.carruselId, cid))
      .orderBy(asc(carruselImagenes.orden));
    return NextResponse.json(rows.map(mapImagen));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al obtener imágenes.' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  try {
    const { id } = await params;
    const cid = Number(id);
    if (!cid) return NextResponse.json({ error: 'id inválido.' }, { status: 400 });

    const carrusel = await db.select({ id: carruseles.id }).from(carruseles).where(eq(carruseles.id, cid)).limit(1);
    if (!carrusel.length) return NextResponse.json({ error: 'Carrusel no encontrado.' }, { status: 404 });

    const body = await req.json();
    if (!body.urlImagen) return NextResponse.json({ error: 'urlImagen requerida.' }, { status: 400 });

    const ins = await db.insert(carruselImagenes).values({
      carruselId:   cid,
      imagenUrl:    body.urlImagen,
      titulo:       body.titulo ?? null,
      descripcion:  body.descripcion ?? null,
      linkDestino:  body.urlEnlace ?? null,
      textoBoton:   body.textoBoton ?? null,
      orden:        body.orden ?? 0,
      activo:       body.activo !== false,
    }).returning();
    await logAdminAction(admin, ip, `Creó imagen en carrusel ${cid}: ${body.titulo ?? '(sin título)'}`, 'Carrusel');
    return NextResponse.json(mapImagen(ins[0]), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al crear imagen.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  try {
    const { id } = await params;
    const cid = Number(id);
    if (!cid) return NextResponse.json({ error: 'id inválido.' }, { status: 400 });

    const body = await req.json();
    if (!body.idSlide) return NextResponse.json({ error: 'idSlide requerido.' }, { status: 400 });

    // Validar que la imagen pertenezca a este carrusel
    const found = await db
      .select({ id: carruselImagenes.id })
      .from(carruselImagenes)
      .where(eq(carruselImagenes.id, Number(body.idSlide)))
      .limit(1);
    if (!found.length) return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404 });

    await db.update(carruselImagenes).set({
      imagenUrl:   body.urlImagen,
      titulo:      body.titulo,
      descripcion: body.descripcion,
      linkDestino: body.urlEnlace,
      textoBoton:  body.textoBoton,
      orden:       body.orden,
      activo:      body.activo,
    }).where(eq(carruselImagenes.id, Number(body.idSlide)));
    await logAdminAction(admin, ip, `Editó imagen ID: ${body.idSlide} (carrusel ${cid})`, 'Carrusel');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al actualizar.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  try {
    const { id } = await params;
    const cid = Number(id);
    if (!cid) return NextResponse.json({ error: 'id inválido.' }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const idSlide = Number(searchParams.get('idSlide'));
    if (!idSlide) return NextResponse.json({ error: 'idSlide requerido.' }, { status: 400 });

    await db.delete(carruselImagenes).where(eq(carruselImagenes.id, idSlide));
    await logAdminAction(admin, ip, `Eliminó imagen ID: ${idSlide} (carrusel ${cid})`, 'Carrusel');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al eliminar.' }, { status: 500 });
  }
}
