/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { decrypt } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

const DATA_FILE_PATH = path.join(process.cwd(), 'src/data/gallery.json');

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
    const images = JSON.parse(data);
    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);

  try {
    const body = await request.json();
    const { titulo, urlImagen, album, fechaEvento, activo } = body;

    if (!titulo || !urlImagen) {
      return NextResponse.json({ error: 'Título e imagen son requeridos.' }, { status: 400 });
    }

    let gallery = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      gallery = JSON.parse(data);
    } catch (e) {}

    const newImage = {
      idImagen: Date.now(),
      titulo,
      urlImagen,
      album: album || 'General',
      fechaEvento: fechaEvento || new Date().toISOString().split('T')[0],
      activo: activo !== false,
    };

    gallery.push(newImage);
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(gallery, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Agregó imagen a galería: ${titulo}`, 'Galería');

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);

  try {
    const body = await request.json();
    const { idImagen, titulo, urlImagen, album, fechaEvento, activo } = body;

    if (!idImagen || !titulo || !urlImagen) {
      return NextResponse.json({ error: 'ID, título e imagen son requeridos.' }, { status: 400 });
    }

    let gallery = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      gallery = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ error: 'Base de datos vacía.' }, { status: 404 });
    }

    const index = gallery.findIndex((g: any) => g.idImagen === Number(idImagen));
    if (index === -1) {
      return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404 });
    }

    gallery[index] = {
      ...gallery[index],
      titulo,
      urlImagen,
      album: album || 'General',
      fechaEvento: fechaEvento || gallery[index].fechaEvento,
      activo: activo !== false,
    };

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(gallery, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Editó imagen ID: ${idImagen} (${titulo})`, 'Galería');

    return NextResponse.json(gallery[index], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);
  const { searchParams } = new URL(request.url);
  const idImagen = searchParams.get('idImagen');

  if (!idImagen) {
    return NextResponse.json({ error: 'idImagen es requerido.' }, { status: 400 });
  }

  try {
    let gallery = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      gallery = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ error: 'Base de datos vacía.' }, { status: 404 });
    }

    const targetImage = gallery.find((g: any) => g.idImagen === Number(idImagen));
    if (!targetImage) {
      return NextResponse.json({ error: 'Imagen no encontrada.' }, { status: 404 });
    }

    const filteredGallery = gallery.filter((g: any) => g.idImagen !== Number(idImagen));
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(filteredGallery, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Eliminó imagen de galería: ${targetImage.titulo}`, 'Galería');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
