import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { put } from '@vercel/blob';

// Límite de tamaño: 20 MB (20 * 1024 * 1024 bytes)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Mime types permitidos
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo.' },
        { status: 400 }
      );
    }

    // 1. Validar tamaño del archivo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo supera el límite permitido de 20 MB.' },
        { status: 400 }
      );
    }

    // 2. Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se aceptan PDFs e imágenes (JPG, PNG, WEBP).' },
        { status: 400 }
      );
    }

    // 3. Obtener y sanitizar el nombre del archivo
    const originalName = file.name;
    const fileExtension = path.extname(originalName).toLowerCase();

    // Validar extensión
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Extensión de archivo no permitida.' },
        { status: 400 }
      );
    }

    // Sanitizar nombre (quitar caracteres especiales, evitar path traversal)
    const baseName = path.basename(originalName, fileExtension)
      .replace(/[^a-zA-Z0-9-_]/g, '') // Dejar solo alfanuméricos, guiones y guiones bajos
      .substring(0, 100); // Limitar longitud

    const uniqueFilename = `${Date.now()}-${baseName}${fileExtension}`;

    // 4. Subir a Vercel Blob (storage persistente, compatible con serverless).
    //    En desarrollo local sin BLOB_READ_WRITE_TOKEN, @vercel/blob requiere
    //    configurar el token. Si no está, devolvemos 503 para evitar fallos
    //    silenciosos al intentar escribir en el FS efímero.
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'El almacenamiento no está configurado (falta BLOB_READ_WRITE_TOKEN).' },
        { status: 503 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const blob = await put(uniqueFilename, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type,
    });

    return NextResponse.json(
      { success: true, url: blob.url, name: originalName },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al subir el archivo en el servidor.' },
      { status: 500 }
    );
  }
}
