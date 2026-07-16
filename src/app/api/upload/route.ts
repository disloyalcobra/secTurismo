import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

    // 4. Crear directorio de destino si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // 5. Guardar el archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const destinationPath = path.join(uploadDir, uniqueFilename);

    await fs.writeFile(destinationPath, buffer);

    // Devolver la ruta accesible en web
    const fileUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json(
      { success: true, url: fileUrl, name: originalName },
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
