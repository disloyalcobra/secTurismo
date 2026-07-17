// src/app/api/carousel/[id]/route.ts
// CRUD de un carrusel individual (no de sus imágenes).
// GET    /api/carousel/[id]   → metadatos del carrusel
// PUT    /api/carousel/[id]   → actualiza nombre/descripcion/orden/activo
// DELETE /api/carousel/[id]   → elimina el carrusel (cascade a sus imágenes)
import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { logAdminAction } from '@/lib/audit';
import { decrypt } from '@/lib/auth';

const { carruseles, carruselImagenes } = schema;

async function getAdmin(req: NextRequest) {
  const tok = req.cookies.get('admin_session')?.value;
  if (tok) { const s = await decrypt(tok); return s?.username || 'admin'; }
  return 'admin';
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cid = Number(id);
    if (!cid) return NextResponse.json({ error: 'id inválido.' }, { status: 400 });

    const rows = await db
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
      .where(eq(carruseles.id, cid))
      .limit(1);

    if (!rows.length) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al obtener carrusel.' }, { status: 500 });
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
    const update: Record<string, unknown> = {};
    if (body.nombre !== undefined)      update.nombre = body.nombre;
    if (body.descripcion !== undefined) update.descripcion = body.descripcion;
    if (body.orden !== undefined)       update.orden = body.orden;
    if (body.activo !== undefined)      update.activo = body.activo;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nada que actualizar.' }, { status: 400 });
    }
    await db.update(carruseles).set(update).where(eq(carruseles.id, cid));
    await logAdminAction(admin, ip, `Editó carrusel ID: ${cid}`, 'Carrusel');
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

    const target = await db.select().from(carruseles).where(eq(carruseles.id, cid)).limit(1);
    if (!target.length) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });
    if (target[0].clave === 'principal') {
      return NextResponse.json({ error: 'No se puede eliminar el Carrusel Principal.' }, { status: 400 });
    }
    await db.delete(carruseles).where(eq(carruseles.id, cid));
    await logAdminAction(admin, ip, `Eliminó carrusel ID: ${cid}`, 'Carrusel');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al eliminar.' }, { status: 500 });
  }
}
