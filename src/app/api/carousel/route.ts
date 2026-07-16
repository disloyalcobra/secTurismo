/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { decrypt } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

const DATA_FILE_PATH = path.join(process.cwd(), 'src/data/carousel.json');

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
    const slides = JSON.parse(data);
    // Ordenar slides por su propiedad "orden"
    slides.sort((a: any, b: any) => a.orden - b.orden);
    return NextResponse.json(slides, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);

  try {
    const body = await request.json();
    const { titulo, descripcion, urlImagen, urlEnlace, textoBoton, orden, activo } = body;

    if (!titulo || !urlImagen) {
      return NextResponse.json({ error: 'Título e imagen son requeridos.' }, { status: 400 });
    }

    let slides = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      slides = JSON.parse(data);
    } catch (e) {}

    const newSlide = {
      idSlide: Date.now(),
      titulo,
      descripcion: descripcion || '',
      urlImagen,
      urlEnlace: urlEnlace || '',
      textoBoton: textoBoton || '',
      orden: Number(orden) || 1,
      activo: activo !== false,
    };

    slides.push(newSlide);
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(slides, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Creó diapositiva: ${titulo}`, 'Carrusel');

    return NextResponse.json(newSlide, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);

  try {
    const body = await request.json();
    const { idSlide, titulo, descripcion, urlImagen, urlEnlace, textoBoton, orden, activo } = body;

    if (!idSlide || !titulo || !urlImagen) {
      return NextResponse.json({ error: 'ID, título e imagen son requeridos.' }, { status: 400 });
    }

    let slides = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      slides = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ error: 'Base de datos no encontrada.' }, { status: 404 });
    }

    const index = slides.findIndex((s: any) => s.idSlide === Number(idSlide));
    if (index === -1) {
      return NextResponse.json({ error: 'Diapositiva no encontrada.' }, { status: 404 });
    }

    slides[index] = {
      ...slides[index],
      titulo,
      descripcion: descripcion || '',
      urlImagen,
      urlEnlace: urlEnlace || '',
      textoBoton: textoBoton || '',
      orden: Number(orden) || slides[index].orden,
      activo: activo !== false,
    };

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(slides, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Editó diapositiva ID: ${idSlide} (${titulo})`, 'Carrusel');

    return NextResponse.json(slides[index], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);
  const { searchParams } = new URL(request.url);
  const idSlide = searchParams.get('idSlide');

  if (!idSlide) {
    return NextResponse.json({ error: 'idSlide es requerido.' }, { status: 400 });
  }

  try {
    let slides = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      slides = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ error: 'Base de datos vacía.' }, { status: 404 });
    }

    const targetSlide = slides.find((s: any) => s.idSlide === Number(idSlide));
    if (!targetSlide) {
      return NextResponse.json({ error: 'Diapositiva no encontrada.' }, { status: 404 });
    }

    const filteredSlides = slides.filter((s: any) => s.idSlide !== Number(idSlide));
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(filteredSlides, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Eliminó diapositiva: ${targetSlide.titulo}`, 'Carrusel');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
