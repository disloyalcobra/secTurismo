// src/app/api/auth/login/route.ts
// Autenticación contra tabla usuarios_admin en Turso via Drizzle ORM
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { encrypt } from '@/lib/auth';

const { usuariosAdmin } = schema;
const LOG_FILE_PATH = path.join(process.cwd(), 'src/data/access_logs.json');

const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

async function addAccessLog(username: string, ip: string, status: 'SUCCESS' | 'FAILED' | 'BLOCKED') {
  try {
    let logs: unknown[] = [];
    try { const d = await fs.readFile(LOG_FILE_PATH, 'utf-8'); logs = JSON.parse(d); } catch {}
    logs.push({ timestamp: new Date().toISOString(), username: username || 'desconocido', ip, status });
    if (logs.length > 500) logs = logs.slice(logs.length - 500);
    await fs.writeFile(LOG_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (e) { console.error('Error guardando log:', e); }
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
      await addAccessLog(username, ip, 'FAILED');
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
    }

    loginAttempts.delete(lockKey);
    await addAccessLog(username, ip, 'SUCCESS');

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
