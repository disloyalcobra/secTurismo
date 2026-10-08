import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import bcrypt from 'bcryptjs';
import { decrypt } from '@/lib/auth';

const { usuariosAdmin } = schema;

async function getSession(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) return null;
  return await decrypt(token);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const users = await db.select({
      id: usuariosAdmin.id,
      usuario: usuariosAdmin.usuario,
      nombre: usuariosAdmin.nombre,
      rol: usuariosAdmin.rol,
      ultimoAcceso: usuariosAdmin.ultimoAcceso,
      activo: usuariosAdmin.activo,
    }).from(usuariosAdmin)
    .where(session.rol !== 'admin' ? eq(usuariosAdmin.usuario, session.username) : undefined);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener usuarios.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const { _action, id, usuario, nombre, rol, password } = body;

    if (_action === 'create') {
      if (session.rol !== 'admin') return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
      if (!usuario || !password) return NextResponse.json({ error: 'Usuario y contraseña requeridos.' }, { status: 400 });

      const existing = await db.select().from(usuariosAdmin).where(eq(usuariosAdmin.usuario, usuario)).limit(1);
      if (existing.length > 0) return NextResponse.json({ error: 'El usuario ya existe.' }, { status: 400 });

      const hash = await bcrypt.hash(password, 10);
      await db.insert(usuariosAdmin).values({
        usuario: usuario.trim(),
        nombre: nombre || null,
        passwordHash: hash,
        rol: rol || 'editor',
      });
      return NextResponse.json({ success: true });
    }

    if (_action === 'update') {
      // Un admin puede editar cualquier usuario (por ID), un editor solo su propio usuario (por ID y verificar)
      const targetUser = await db.select().from(usuariosAdmin).where(eq(usuariosAdmin.id, id)).limit(1);
      if (targetUser.length === 0) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      
      if (session.rol !== 'admin' && targetUser[0].usuario !== session.username) {
        return NextResponse.json({ error: 'Prohibido. Solo puedes editar tu propia cuenta.' }, { status: 403 });
      }

      const updates: any = {};
      if (usuario) updates.usuario = usuario.trim();
      if (nombre !== undefined) updates.nombre = nombre;
      if (password) updates.passwordHash = await bcrypt.hash(password, 10);
      
      // Solo admin puede cambiar roles
      if (rol && session.rol === 'admin') updates.rol = rol;

      const existing = await db.select().from(usuariosAdmin).where(eq(usuariosAdmin.usuario, updates.usuario || targetUser[0].usuario)).limit(1);
      if (existing.length > 0 && existing[0].id !== id) return NextResponse.json({ error: 'El nuevo usuario ya está en uso.' }, { status: 400 });

      await db.update(usuariosAdmin).set(updates).where(eq(usuariosAdmin.id, id));
      
      return NextResponse.json({ success: true, requireLogout: (updates.usuario && updates.usuario !== session.username) || password });
    }

    if (_action === 'delete') {
      if (session.rol !== 'admin') return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
      if (!id) return NextResponse.json({ error: 'ID requerido.' }, { status: 400 });
      await db.delete(usuariosAdmin).where(eq(usuariosAdmin.id, id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Error en la base de datos.' }, { status: 500 });
  }
}
