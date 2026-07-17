// src/app/api/directory/route.ts
// CRUD de directorio de contactos — usa Turso via Drizzle ORM
import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db, schema } from '@/db';
import { logAdminAction } from '@/lib/audit';
import { decrypt } from '@/lib/auth';

const { contactos } = schema;

async function getAdmin(req: NextRequest) {
  const tok = req.cookies.get('admin_session')?.value;
  if (tok) { const s = await decrypt(tok); return s?.username || 'admin'; }
  return 'admin';
}

// Mapea fila DB → formato frontend (con apellidos separados para compat.)
function toStaff(r: typeof contactos.$inferSelect) {
  const partes = (r.nombre ?? '').split(' ');
  const nombre = partes.slice(0, -2).join(' ') || r.nombre || '';
  const apellidoPaterno = partes.at(-2) ?? '';
  const apellidoMaterno = partes.at(-1) ?? '';
  return {
    idPersonal:     r.id,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    nombreCompleto: r.nombre,
    cargo:          r.cargo,
    area:           r.area ?? '',
    correo:         r.correo ?? '',
    telefono:       r.telefono ?? '',
    extension:      r.extension ?? '',
    fotoUrl:        r.fotoUrl ?? '',
    orden:          r.orden ?? 0,
    activo:         r.activo ?? true,
  };
}

export async function GET() {
  try {
    const rows = await db.select().from(contactos).orderBy(asc(contactos.orden));
    return NextResponse.json(rows.map(toStaff));
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
    const nombre = [b.nombre, b.apellidoPaterno, b.apellidoMaterno].filter(Boolean).join(' ');
    const ins = await db.insert(contactos).values({
      nombre, cargo: b.cargo, area: b.area,
      correo: b.correo, telefono: b.telefono ?? '222-246-2044',
      extension: b.extension, fotoUrl: b.fotoUrl ?? '',
      activo: b.activo !== false,
    }).returning();
    await logAdminAction(admin, ip, `Creó contacto: ${nombre}`, 'Directorio');
    return NextResponse.json(toStaff(ins[0]), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al crear contacto.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  try {
    const b = await req.json();
    const { idPersonal } = b;
    if (!idPersonal) return NextResponse.json({ error: 'idPersonal requerido.' }, { status: 400 });
    const nombre = [b.nombre, b.apellidoPaterno, b.apellidoMaterno].filter(Boolean).join(' ');
    await db.update(contactos).set({
      nombre, cargo: b.cargo, area: b.area,
      correo: b.correo, telefono: b.telefono,
      extension: b.extension, fotoUrl: b.fotoUrl,
      activo: b.activo !== false,
    }).where(eq(contactos.id, Number(idPersonal)));
    await logAdminAction(admin, ip, `Editó contacto ID: ${idPersonal} (${nombre})`, 'Directorio');
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
  const id = Number(searchParams.get('idPersonal'));
  if (!id) return NextResponse.json({ error: 'idPersonal requerido.' }, { status: 400 });
  try {
    await db.delete(contactos).where(eq(contactos.id, id));
    await logAdminAction(admin, ip, `Eliminó contacto ID: ${id}`, 'Directorio');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al eliminar.' }, { status: 500 });
  }
}
