// src/app/api/auth/login/route.ts
// Autenticación contra tabla usuarios_admin en Turso via Drizzle ORM
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { encrypt } from '@/lib/auth';

const { usuariosAdmin, auditLogs } = schema;

const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

// Registra una entrada en la bitácora de auditoría (Turso). En Vercel el
// filesystem es efímero, por eso usamos la tabla audit_logs en vez de un
// archivo JSON como en la versión anterior.
async function addAccessLog(
  username: string,
  ip: string,
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED',
  action?: string,
  entity?: string
) {
  try {
    await db.insert(auditLogs).values({
      username: username || 'desconocido',
      ip,
      status,
      action: action ?? null,
      entity: entity ?? null,
    });
  } catch (e) {
    console.error('Error guardando log:', e);
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const lockKey = ip;

  const attemptsInfo = loginAttempts.get(lockKey);
  if (attemptsInfo && attemptsInfo.lockUntil > Date.now()) {
    const minutesLeft = Math.ceil((attemptsInfo.lockUntil - Date.now()) / 60000);
    await addAccessLog('', ip, 'BLOCKED');
    return NextResponse.json(
      { error: `Demasiados intentos fallidos. Intente de nuevo en ${minutesLeft} minutos.` },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();

    // Buscar usuario en la DB de Turso
    let isUserValid = false;
    let isPasswordValid = false;

    const dbUsers = await db.select().from(usuariosAdmin)
      .where(eq(usuariosAdmin.usuario, username)).limit(1);

    if (dbUsers.length > 0 && dbUsers[0].activo) {
      isUserValid = true;
      isPasswordValid = await bcrypt.compare(password, dbUsers[0].passwordHash);
    } else {
      // Fallback a variables de entorno (compatibilidad mientras se migra)
      const envUser = process.env.ADMIN_USERNAME || 'admin';
      const envHash = process.env.ADMIN_PASSWORD_HASH;
      if (username === envUser && envHash) {
        isUserValid = true;
        isPasswordValid = await bcrypt.compare(password, envHash);
      }
    }

    if (!isUserValid || !isPasswordValid) {
      const currentCount = attemptsInfo ? attemptsInfo.count + 1 : 1;
      const lockUntil = currentCount >= 5 ? Date.now() + 15 * 60 * 1000 : 0;
      loginAttempts.set(lockKey, { count: currentCount, lockUntil });
      await addAccessLog(username, ip, 'FAILED', 'Intento de login', 'Auth');
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
    }

    loginAttempts.delete(lockKey);
    await addAccessLog(username, ip, 'SUCCESS', 'Inicio de sesión', 'Auth');

    // Actualizar último acceso en DB
    if (dbUsers.length > 0) {
      await db.update(usuariosAdmin)
        .set({ ultimoAcceso: new Date().toISOString() })
        .where(eq(usuariosAdmin.usuario, username));
    }

    const token = await encrypt({ username });
    const response = NextResponse.json({ success: true, message: 'Autenticación exitosa.' });
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600,
    });
    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Ocurrió un error en el servidor.' }, { status: 500 });
  }
}
