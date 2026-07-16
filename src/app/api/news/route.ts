/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { decrypt } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

const DATA_FILE_PATH = path.join(process.cwd(), 'src/data/news.json');

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
  const idNoticia = searchParams.get('idNoticia');
  const limit = searchParams.get('limit');

  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    let news = JSON.parse(data);

    // Devolver las noticias más recientes primero
    news.sort((a: any, b: any) => new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime());

    if (idNoticia) {
      const article = news.find((n: any) => n.idNoticia === Number(idNoticia));
      if (!article) {
        return NextResponse.json({ error: 'Noticia no encontrada.' }, { status: 404 });
      }
      return NextResponse.json(article, { status: 200 });
    }

    if (limit) {
      const activeNews = news.filter((n: any) => n.activo !== false);
      return NextResponse.json(activeNews.slice(0, Number(limit)), { status: 200 });
    }

    return NextResponse.json(news, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);

  try {
    const body = await request.json();
    const { titulo, resumen, contenido, urlImagenPortada, fechaPublicacion, activo } = body;

    if (!titulo || !resumen || !contenido || !urlImagenPortada) {
      return NextResponse.json({ error: 'Título, resumen, contenido e imagen son requeridos.' }, { status: 400 });
    }

    let news = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      news = JSON.parse(data);
    } catch (e) {}

    const newArticle = {
      idNoticia: Date.now(),
      titulo,
      resumen,
      contenido,
      urlImagenPortada,
      fechaPublicacion: fechaPublicacion || new Date().toISOString().split('T')[0],
      activo: activo !== false,
    };

    news.push(newArticle);
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(news, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Publicó noticia: ${titulo}`, 'Noticias');

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);

  try {
    const body = await request.json();
    const { idNoticia, titulo, resumen, contenido, urlImagenPortada, fechaPublicacion, activo } = body;

    if (!idNoticia || !titulo || !resumen || !contenido || !urlImagenPortada) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 });
    }

    let news = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      news = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ error: 'Base de datos vacía.' }, { status: 404 });
    }

    const index = news.findIndex((n: any) => n.idNoticia === Number(idNoticia));
    if (index === -1) {
      return NextResponse.json({ error: 'Noticia no encontrada.' }, { status: 404 });
    }

    news[index] = {
      ...news[index],
      titulo,
      resumen,
      contenido,
      urlImagenPortada,
      fechaPublicacion: fechaPublicacion || news[index].fechaPublicacion,
      activo: activo !== false,
    };

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(news, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Editó noticia ID: ${idNoticia} (${titulo})`, 'Noticias');

    return NextResponse.json(news[index], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);
  const { searchParams } = new URL(request.url);
  const idNoticia = searchParams.get('idNoticia');

  if (!idNoticia) {
    return NextResponse.json({ error: 'idNoticia es requerido.' }, { status: 400 });
  }

  try {
    let news = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      news = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ error: 'Base de datos vacía.' }, { status: 404 });
    }

    const targetArticle = news.find((n: any) => n.idNoticia === Number(idNoticia));
    if (!targetArticle) {
      return NextResponse.json({ error: 'Noticia no encontrada.' }, { status: 404 });
    }

    const filteredNews = news.filter((n: any) => n.idNoticia !== Number(idNoticia));
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(filteredNews, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Eliminó noticia: ${targetArticle.titulo}`, 'Noticias');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
