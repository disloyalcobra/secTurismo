// src/app/api/categorias/route.ts
// CRUD de categorías por módulo — usa Turso via Drizzle ORM
import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db, schema } from '@/db';
import { logAdminAction } from '@/lib/audit';
import { decrypt } from '@/lib/auth';

const { categorias, modulos } = schema;

async function getAdmin(req: NextRequest) {
  const tok = req.cookies.get('admin_session')?.value;
  if (tok) {
    const s = await decrypt(tok);
    return s?.username || 'admin';
  }
  return 'admin';
}

export async function GET(req: NextRequest) {
  const seccion = new URL(req.url).searchParams.get('seccion');
  try {
    const rows = await db
      .select({
        id:           categorias.id,
        moduloId:     categorias.moduloId,
        nombre:       categorias.nombre,
        descripcion:  categorias.descripcion,
        orden:        categorias.orden,
        activo:       categorias.activo,
        moduloClave:  modulos.clave,
        moduloNombre: modulos.nombre,
      })
      .from(categorias)
      .innerJoin(modulos, eq(categorias.moduloId, modulos.id))
      .orderBy(asc(modulos.orden), asc(categorias.orden), asc(categorias.nombre));

    const mapped = rows.map((r) => ({
      idCategoria:     r.id,
      nombreCategoria: r.nombre,
      descripcion:     r.descripcion ?? '',
      seccion:         r.moduloClave,
      moduloId:        r.moduloId,
      moduloNombre:    r.moduloNombre,
      orden:           r.orden ?? 0,
      activo:          r.activo ?? true,
    }));

    if (seccion) {
      return NextResponse.json(mapped.filter((c) => c.seccion === seccion));
    }
    return NextResponse.json(mapped);
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
      return NextResponse.json({ error: 'El nombre de la categoría es requerido.' }, { status: 400 });
    }

    let moduloId = b.moduloId != null ? Number(b.moduloId) : null;
    if (!moduloId && b.seccion) {
      const mod = await db.select({ id: modulos.id }).from(modulos).where(eq(modulos.clave, b.seccion));
      moduloId = mod[0]?.id ?? null;
    }
    if (!moduloId) {
      return NextResponse.json({ error: 'Sección o módulo requerido.' }, { status: 400 });
    }

    const ins = await db
      .insert(categorias)
      .values({
        moduloId,
        nombre:      b.nombre.trim(),
        descripcion: b.descripcion?.trim() || null,
        orden:       b.orden != null ? Number(b.orden) : 0,
        activo:      b.activo !== false,
      })
      .returning();

    const mod = await db.select({ clave: modulos.clave }).from(modulos).where(eq(modulos.id, moduloId));
    await logAdminAction(admin, ip, `Creó categoría: ${b.nombre}`, 'Categorías');

    return NextResponse.json(
      {
        idCategoria:     ins[0].id,
        nombreCategoria: ins[0].nombre,
        descripcion:     ins[0].descripcion ?? '',
        seccion:         mod[0]?.clave ?? '',
        moduloId,
        orden:           ins[0].orden ?? 0,
        activo:          ins[0].activo ?? true,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al crear la categoría.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  try {
    const b = await req.json();
    const id = Number(b.idCategoria);
    if (!id) return NextResponse.json({ error: 'idCategoria requerido.' }, { status: 400 });
    if (!b.nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre de la categoría es requerido.' }, { status: 400 });
    }

    const updateData: Partial<typeof categorias.$inferInsert> = {
      nombre:      b.nombre.trim(),
      descripcion: b.descripcion?.trim() || null,
      orden:       b.orden != null ? Number(b.orden) : 0,
      activo:      b.activo !== false,
    };

    if (b.seccion) {
      const mod = await db.select({ id: modulos.id }).from(modulos).where(eq(modulos.clave, b.seccion));
      if (mod[0]) updateData.moduloId = mod[0].id;
    } else if (b.moduloId != null) {
      updateData.moduloId = Number(b.moduloId);
    }

    await db.update(categorias).set(updateData).where(eq(categorias.id, id));
    await logAdminAction(admin, ip, `Editó categoría ID: ${id} (${b.nombre})`, 'Categorías');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al actualizar la categoría.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  const id = Number(new URL(req.url).searchParams.get('idCategoria'));
  if (!id) return NextResponse.json({ error: 'idCategoria requerido.' }, { status: 400 });
  try {
    await db.delete(categorias).where(eq(categorias.id, id));
    await logAdminAction(admin, ip, `Eliminó categoría ID: ${id}`, 'Categorías');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al eliminar la categoría.' }, { status: 500 });
  }
}
