/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { decrypt } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

const DOCUMENTS_FILE_PATH = path.join(process.cwd(), 'src/data/documents.json');
const CATEGORIES_FILE_PATH = path.join(process.cwd(), 'src/data/categories.json');

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
  const seccion = searchParams.get('seccion');
  const idDocumento = searchParams.get('idDocumento');

  try {
    const docsData = await fs.readFile(DOCUMENTS_FILE_PATH, 'utf-8');
    const catsData = await fs.readFile(CATEGORIES_FILE_PATH, 'utf-8');
    
    const documents = JSON.parse(docsData);
    const categories = JSON.parse(catsData);

    // Cruzar documentos con sus categorías
    const joinedDocs = documents.map((doc: any) => {
      const cat = categories.find((c: any) => c.idCategoria === doc.idCategoria);
      return {
        ...doc,
        nombreCategoria: cat ? cat.nombreCategoria : 'Sin Categoría',
        seccion: cat ? cat.seccion : 'general',
      };
    });

    // Ordenar por fecha de subida de más reciente a más antiguo
    joinedDocs.sort((a: any, b: any) => new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime());

    if (idDocumento) {
      const doc = joinedDocs.find((d: any) => d.idDocumento === Number(idDocumento));
      if (!doc) {
        return NextResponse.json({ error: 'Documento no encontrado.' }, { status: 404 });
      }
      return NextResponse.json(doc, { status: 200 });
    }

    if (seccion) {
      const filtered = joinedDocs.filter((d: any) => d.seccion === seccion);
      return NextResponse.json(filtered, { status: 200 });
    }

    return NextResponse.json(joinedDocs, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);

  try {
    const body = await request.json();
    const { nombre, idCategoria, tipo, rutaArchivo, urlExterna, activo } = body;

    if (!nombre || !idCategoria || !tipo) {
      return NextResponse.json({ error: 'Nombre, categoría y tipo son requeridos.' }, { status: 400 });
    }

    if (tipo === 'pdf' && !rutaArchivo) {
      return NextResponse.json({ error: 'Ruta de archivo PDF es requerida.' }, { status: 400 });
    }

    if (tipo === 'enlace' && !urlExterna) {
      return NextResponse.json({ error: 'URL externa es requerida.' }, { status: 400 });
    }

    let documents = [];
    try {
      const data = await fs.readFile(DOCUMENTS_FILE_PATH, 'utf-8');
      documents = JSON.parse(data);
    } catch (e) {}

    const newDoc = {
      idDocumento: Date.now(),
      nombre,
      idCategoria: Number(idCategoria),
      tipo,
      rutaArchivo: tipo === 'pdf' ? rutaArchivo : '',
      urlExterna: tipo === 'enlace' ? urlExterna : '',
      fechaSubida: new Date().toISOString(),
      activo: activo !== false,
    };

    documents.push(newDoc);
    await fs.writeFile(DOCUMENTS_FILE_PATH, JSON.stringify(documents, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Subió documento/enlace: ${nombre}`, 'Documentos');

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);

  try {
    const body = await request.json();
    const { idDocumento, nombre, idCategoria, tipo, rutaArchivo, urlExterna, activo } = body;

    if (!idDocumento || !nombre || !idCategoria || !tipo) {
      return NextResponse.json({ error: 'ID, nombre, categoría y tipo son requeridos.' }, { status: 400 });
    }

    let documents = [];
    try {
      const data = await fs.readFile(DOCUMENTS_FILE_PATH, 'utf-8');
      documents = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ error: 'Base de datos vacía.' }, { status: 404 });
    }

    const index = documents.findIndex((d: any) => d.idDocumento === Number(idDocumento));
    if (index === -1) {
      return NextResponse.json({ error: 'Documento no encontrado.' }, { status: 404 });
    }

    documents[index] = {
      ...documents[index],
      nombre,
      idCategoria: Number(idCategoria),
      tipo,
      rutaArchivo: tipo === 'pdf' ? rutaArchivo : '',
      urlExterna: tipo === 'enlace' ? urlExterna : '',
      activo: activo !== false,
    };

    await fs.writeFile(DOCUMENTS_FILE_PATH, JSON.stringify(documents, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Editó documento ID: ${idDocumento} (${nombre})`, 'Documentos');

    return NextResponse.json(documents[index], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);
  const { searchParams } = new URL(request.url);
  const idDocumento = searchParams.get('idDocumento');

  if (!idDocumento) {
    return NextResponse.json({ error: 'idDocumento es requerido.' }, { status: 400 });
  }

  try {
    let documents = [];
    try {
      const data = await fs.readFile(DOCUMENTS_FILE_PATH, 'utf-8');
      documents = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ error: 'Base de datos vacía.' }, { status: 404 });
    }

    const targetDoc = documents.find((d: any) => d.idDocumento === Number(idDocumento));
    if (!targetDoc) {
      return NextResponse.json({ error: 'Documento no encontrado.' }, { status: 404 });
    }

    const filteredDocs = documents.filter((d: any) => d.idDocumento !== Number(idDocumento));
    await fs.writeFile(DOCUMENTS_FILE_PATH, JSON.stringify(filteredDocs, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Eliminó documento: ${targetDoc.nombre}`, 'Documentos');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
