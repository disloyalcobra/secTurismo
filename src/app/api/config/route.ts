/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { decrypt } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

const DATA_FILE_PATH = path.join(process.cwd(), 'src/data/config.json');

async function getAdminUser(request: NextRequest): Promise<string> {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (sessionToken) {
    const session = await decrypt(sessionToken);
    return session?.username || 'admin';
  }
  return 'admin';
}

export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const config = JSON.parse(data);
    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    return NextResponse.json({}, { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);

  try {
    const body = await request.json();
    
    // Leer config anterior
    let config = {};
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      config = JSON.parse(data);
    } catch (e) {}

    // Combinar configuraciones
    const newConfig = {
      ...config,
      ...body
    };

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, 'Actualizó la Configuración General', 'Configuración');

    return NextResponse.json(newConfig, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
