// src/app/api/areas/route.ts
// CRUD de áreas institucionales — usa Turso via Drizzle ORM
import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db, schema } from '@/db';
import { logAdminAction } from '@/lib/audit';
import { decrypt } from '@/lib/auth';

const { areas } = schema;

async function getAdmin(req: NextRequest) {
  const tok = req.cookies.get('admin_session')?.value;
  if (tok) {
    const s = await decrypt(tok);
    return s?.username || 'admin';
  }
  return 'admin';
}

function toArea(r: typeof areas.$inferSelect) {
  return {
    idArea:      r.id,
    nombre:      r.nombre,
    descripcion: r.descripcion ?? '',
    orden:       r.orden ?? 0,
    activo:      r.activo ?? true,
  };
}

export async function GET() {
  try {
    const rows = await db.select().from(areas).orderBy(asc(areas.orden), asc(areas.nombre));
    return NextResponse.json(rows.map(toArea));
  } catch (e) {
    console.error(e);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  try {
    const b = await req.json();
    if (!b.nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre del área es requerido.' }, { status: 400 });
    }
    const ins = await db
      .insert(areas)
      .values({
        nombre:      b.nombre.trim(),
        descripcion: b.descripcion?.trim() || null,
        orden:       b.orden != null ? Number(b.orden) : 0,
        activo:      b.activo !== false,
      })
      .returning();
    await logAdminAction(admin, ip, `Creó área: ${b.nombre}`, 'Áreas');
    return NextResponse.json(toArea(ins[0]), { status: 201 });
  } catch (e: unknown) {
    console.error(e);
    const msg = e instanceof Error && e.message.includes('UNIQUE')
      ? 'Ya existe un área con ese nombre.'
      : 'Error al crear el área.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  try {
    const b = await req.json();
    const id = Number(b.idArea);
    if (!id) return NextResponse.json({ error: 'idArea requerido.' }, { status: 400 });
    if (!b.nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre del área es requerido.' }, { status: 400 });
    }
    await db
      .update(areas)
      .set({
        nombre:      b.nombre.trim(),
        descripcion: b.descripcion?.trim() || null,
        orden:       b.orden != null ? Number(b.orden) : 0,
        activo:      b.activo !== false,
      })
      .where(eq(areas.id, id));
    await logAdminAction(admin, ip, `Editó área ID: ${id} (${b.nombre})`, 'Áreas');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al actualizar el área.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  const id = Number(new URL(req.url).searchParams.get('idArea'));
  if (!id) return NextResponse.json({ error: 'idArea requerido.' }, { status: 400 });
  try {
    await db.delete(areas).where(eq(areas.id, id));
    await logAdminAction(admin, ip, `Eliminó área ID: ${id}`, 'Áreas');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al eliminar el área.' }, { status: 500 });
  }
}
