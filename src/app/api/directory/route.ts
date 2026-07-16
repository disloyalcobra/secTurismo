/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { decrypt } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

const DATA_FILE_PATH = path.join(process.cwd(), 'src/data/directory.json');

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
    const directory = JSON.parse(data);
    return NextResponse.json(directory, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);

  try {
    const body = await request.json();
    const { nombre, apellidoPaterno, apellidoMaterno, cargo, area, correo, telefono, extension, activo } = body;

    if (!nombre || !apellidoPaterno || !cargo || !area || !correo) {
      return NextResponse.json({ error: 'Faltan campos requeridos en el directorio.' }, { status: 400 });
    }

    let directory = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      directory = JSON.parse(data);
    } catch (e) {}

    const newStaff = {
      idPersonal: Date.now(),
      nombre,
      apellidoPaterno,
      apellidoMaterno: apellidoMaterno || '',
      cargo,
      area,
      correo,
      telefono: telefono || '',
      extension: extension || '',
      activo: activo !== false,
    };

    directory.push(newStaff);
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(directory, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Agregó al directorio: ${nombre} ${apellidoPaterno}`, 'Directorio');

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);

  try {
    const body = await request.json();
    const { idPersonal, nombre, apellidoPaterno, apellidoMaterno, cargo, area, correo, telefono, extension, activo } = body;

    if (!idPersonal || !nombre || !apellidoPaterno || !cargo || !area || !correo) {
      return NextResponse.json({ error: 'Faltan campos requeridos para editar el directorio.' }, { status: 400 });
    }

    let directory = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      directory = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ error: 'Base de datos vacía.' }, { status: 404 });
    }

    const index = directory.findIndex((d: any) => d.idPersonal === Number(idPersonal));
    if (index === -1) {
      return NextResponse.json({ error: 'Servidor público no encontrado.' }, { status: 404 });
    }

    directory[index] = {
      ...directory[index],
      nombre,
      apellidoPaterno,
      apellidoMaterno: apellidoMaterno || '',
      cargo,
      area,
      correo,
      telefono: telefono || '',
      extension: extension || '',
      activo: activo !== false,
    };

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(directory, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Editó directorio ID: ${idPersonal} (${nombre} ${apellidoPaterno})`, 'Directorio');

    return NextResponse.json(directory[index], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const adminUser = await getAdminUser(request);
  const { searchParams } = new URL(request.url);
  const idPersonal = searchParams.get('idPersonal');

  if (!idPersonal) {
    return NextResponse.json({ error: 'idPersonal es requerido.' }, { status: 400 });
  }

  try {
    let directory = [];
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      directory = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ error: 'Base de datos vacía.' }, { status: 404 });
    }

    const targetStaff = directory.find((d: any) => d.idPersonal === Number(idPersonal));
    if (!targetStaff) {
      return NextResponse.json({ error: 'Servidor público no encontrado.' }, { status: 404 });
    }

    const filteredDirectory = directory.filter((d: any) => d.idPersonal !== Number(idPersonal));
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(filteredDirectory, null, 2), 'utf-8');
    await logAdminAction(adminUser, ip, `Eliminó del directorio a: ${targetStaff.nombre} ${targetStaff.apellidoPaterno}`, 'Directorio');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
