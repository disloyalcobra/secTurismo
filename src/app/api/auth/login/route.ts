import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { encrypt } from '@/lib/auth';

const LOG_FILE_PATH = path.join(process.cwd(), 'src/data/access_logs.json');

// Mapa en memoria para control de intentos fallidos (Fuerza Bruta)
// Nota: En producción serverless esto puede resetearse al reciclar la función,
// pero es excelente y robusto para desarrollo y servidores tradicionales.
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

async function addAccessLog(username: string, ip: string, status: 'SUCCESS' | 'FAILED' | 'BLOCKED') {
  try {
    let logs = [];
    try {
      const data = await fs.readFile(LOG_FILE_PATH, 'utf-8');
      logs = JSON.parse(data);
    } catch (e) {
      // Si el archivo no existe o está dañado, iniciamos con array vacío
    }

    logs.push({
      timestamp: new Date().toISOString(),
      username: username || 'desconocido',
      ip,
      status,
    });

    // Guardar solo los últimos 500 registros para evitar que el archivo crezca indefinidamente
    if (logs.length > 500) {
      logs = logs.slice(logs.length - 500);
    }

    await fs.writeFile(LOG_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error guardando bitácora de acceso:', error);
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const lockKey = ip;

  // Verificar si la IP está bloqueada
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

    const envUser = process.env.ADMIN_USERNAME || 'admin';
    const envPassword = process.env.ADMIN_PASSWORD;

    if (!envPassword) {
      console.error('ADMIN_PASSWORD no está configurado en las variables de entorno.');
      return NextResponse.json(
        { error: 'Error interno de configuración del servidor.' },
        { status: 500 }
      );
    }

    // Validación de credenciales
    const isUserValid = username === envUser;
    const isPasswordValid = isUserValid && password === envPassword;



    if (!isUserValid || !isPasswordValid) {
      // Registrar intento fallido
      const currentCount = attemptsInfo ? attemptsInfo.count + 1 : 1;
      let lockUntil = 0;

      loginAttempts.set(lockKey, { count: currentCount, lockUntil });
      await addAccessLog(username, ip, 'FAILED');

      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos.' },
        { status: 401 }
      );
    }

    // Login Exitoso: Resetear intentos fallidos de esta IP
    loginAttempts.delete(lockKey);
    await addAccessLog(username, ip, 'SUCCESS');

    // Generar JWT de sesión
    const token = await encrypt({ username });

    const response = NextResponse.json(
      { success: true, message: 'Autenticación exitosa.' },
      { status: 200 }
    );

    // Guardar JWT en cookie httpOnly y secure
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600, // 1 hora
    });

    return response;
  } catch (error) {
    console.error('Error en login handler:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error en el servidor.' },
      { status: 500 }
    );
  }
}
