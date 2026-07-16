/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { decrypt } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

const DATA_FILE_PATH = path.join(process.cwd(), 'src/data/pages.json');

async function getAdminUser(request: NextRequest): Promise<string> {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (sessionToken) {
    const session = await decrypt(sessionToken);
    return session?.username || 'admin';
  }
  return 'admin';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const pages = JSON.parse(data);

    if (slug) {
      const page = pages.find((p: any) => p.slug === slug);
      if (!page) {
        return NextResponse.json({ error: 'Página no encontrada.' }, { status: 404 });
      }
      return NextResponse.json(page, { status: 200 });
    }

    return NextResponse.json(pages, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);

  try {
    const body = await request.json();
    const { slug, titulo, contenido } = body;

    if (!slug || !titulo || !contenido) {
      return NextResponse.json({ error: 'Slug, título y contenido son requeridos.' }, { status: 400 });
    }

    let pages = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      pages = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ error: 'Base de datos no encontrada.' }, { status: 404 });
    }

    const index = pages.findIndex((p: any) => p.slug === slug);
    if (index === -1) {
      return NextResponse.json({ error: 'Página no encontrada.' }, { status: 404 });
    }

    pages[index] = {
      ...pages[index],
      titulo,
      contenido,
      ultimaActualizacion: new Date().toISOString(),
    };

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(pages, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Actualizó contenido de la página: ${slug}`, 'Páginas');

    return NextResponse.json(pages[index], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
