// src/app/api/documents/route.ts
// CRUD de documentos — usa Turso via Drizzle ORM
import { NextRequest, NextResponse } from 'next/server';
import { eq, asc, and } from 'drizzle-orm';
import { db, schema } from '@/db';
import { logAdminAction } from '@/lib/audit';
import { decrypt } from '@/lib/auth';

const { documentos, modulos, categorias } = schema;

async function getAdmin(req: NextRequest) {
  const tok = req.cookies.get('admin_session')?.value;
  if (tok) { const s = await decrypt(tok); return s?.username || 'admin'; }
  return 'admin';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const seccion = searchParams.get('seccion');
  const idDoc   = searchParams.get('idDocumento');
  try {
    // Join documentos ← modulos ← categorias
    const rows = await db
      .select({
        id:               documentos.id,
        moduloId:         documentos.moduloId,
        categoriaId:      documentos.categoriaId,
        titulo:           documentos.titulo,
        url:              documentos.url,
        tipo:             documentos.tipo,
        orden:            documentos.orden,
        fechaPublicacion: documentos.fechaPublicacion,
        activo:           documentos.activo,
        fechaCreacion:    documentos.fechaCreacion,
        moduloClave:      modulos.clave,
        moduloNombre:     modulos.nombre,
        catNombre:        categorias.nombre,
        catActivo:        categorias.activo,
      })
      .from(documentos)
      .innerJoin(modulos, eq(documentos.moduloId, modulos.id))
      .leftJoin(categorias, eq(documentos.categoriaId, categorias.id))
      .orderBy(asc(documentos.orden));

    // Mapear al formato esperado por el frontend (compatible con páginas
    // públicas: siguen recibiendo `nombreCategoria` y `area` como strings).
    const mapped = rows.map(r => ({
      idDocumento:     r.id,
      nombre:          r.titulo,
      idCategoria:     r.categoriaId,            // compat: ahora viene del FK
      nombreCategoria: r.catNombre ?? null,      // null si la categoría no existe
      seccion:         r.moduloClave,
      tipo:            (r.tipo ?? 'pdf') as 'pdf' | 'enlace',
      rutaArchivo:     r.tipo === 'pdf'    ? r.url : '',
      urlExterna:      r.tipo === 'enlace' ? r.url : '',
      fechaSubida:     r.fechaPublicacion ?? r.fechaCreacion ?? '',
      activo:          r.activo ?? true,
    }));

    if (idDoc) {
      const doc = mapped.find(d => d.idDocumento === Number(idDoc));
      if (!doc) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });
      return NextResponse.json(doc);
    }
    if (seccion) {
      return NextResponse.json(mapped.filter(d => d.seccion === seccion));
    }
    return NextResponse.json(mapped);
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}

async function resolveModuloFromCategoria(categoriaId: number) {
  const cat = await db
    .select({ moduloId: categorias.moduloId })
    .from(categorias)
    .where(eq(categorias.id, categoriaId));
  return cat[0]?.moduloId ?? null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  try {
    const body = await req.json();
    const { nombre, idCategoria, tipo, rutaArchivo, urlExterna, url, activo } = body;
    const docTipo = (tipo ?? 'enlace') as 'pdf' | 'enlace';
    const docUrl = url || (docTipo === 'pdf' ? rutaArchivo : urlExterna);
    if (!nombre || !docUrl) {
      return NextResponse.json({ error: 'nombre y URL requeridos.' }, { status: 400 });
    }
    if (!idCategoria) {
      return NextResponse.json({ error: 'idCategoria requerido.' }, { status: 400 });
    }
    const categoriaId = Number(idCategoria);
    const moduloId = await resolveModuloFromCategoria(categoriaId);
    if (!moduloId) {
      return NextResponse.json({ error: 'Categoría no encontrada.' }, { status: 400 });
    }
    const ins = await db.insert(documentos).values({
      moduloId,
      categoriaId,
      titulo:      nombre,
      url:         docUrl,
      tipo:        docTipo,
      activo:      activo !== false,
      fechaPublicacion: new Date().toISOString(),
    }).returning();
    await logAdminAction(admin, ip, `Subió documento: ${nombre}`, 'Documentos');
    const r = ins[0];
    return NextResponse.json({
      idDocumento: r.id, nombre: r.titulo, tipo: r.tipo,
      rutaArchivo: r.tipo === 'pdf' ? r.url : '',
      urlExterna: r.tipo === 'enlace' ? r.url : '',
      activo: r.activo,
    }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  try {
    const body = await req.json();
    const { idDocumento, nombre, idCategoria, tipo, rutaArchivo, urlExterna, url, activo } = body;
    const docTipo = (tipo ?? 'enlace') as 'pdf' | 'enlace';
    const docUrl = url || (docTipo === 'pdf' ? rutaArchivo : urlExterna);
    if (!idDocumento || !nombre || !docUrl) {
      return NextResponse.json({ error: 'ID, nombre y URL requeridos.' }, { status: 400 });
    }
    const updateData: Partial<typeof documentos.$inferInsert> = {
      titulo:             nombre,
      url:                docUrl,
      tipo:               docTipo,
      activo:             activo !== false,
      fechaActualizacion: new Date().toISOString(),
    };
    if (idCategoria) {
      const categoriaId = Number(idCategoria);
      const moduloId = await resolveModuloFromCategoria(categoriaId);
      if (!moduloId) {
        return NextResponse.json({ error: 'Categoría no encontrada.' }, { status: 400 });
      }
      updateData.categoriaId = categoriaId;
      updateData.moduloId = moduloId;
    }
    await db.update(documentos).set(updateData).where(eq(documentos.id, Number(idDocumento)));
    await logAdminAction(admin, ip, `Editó documento ID: ${idDocumento} (${nombre})`, 'Documentos');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('idDocumento'));
  if (!id) return NextResponse.json({ error: 'idDocumento requerido.' }, { status: 400 });
  try {
    await db.delete(documentos).where(eq(documentos.id, id));
    await logAdminAction(admin, ip, `Eliminó documento ID: ${id}`, 'Documentos');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
