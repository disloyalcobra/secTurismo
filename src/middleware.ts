import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Lista de rutas API a proteger
  const isApiRoute =
    pathname.startsWith('/api/carousel') ||
    pathname.startsWith('/api/directory') ||
    pathname.startsWith('/api/documents') ||
    pathname.startsWith('/api/areas') ||
    pathname.startsWith('/api/categorias') ||
    pathname.startsWith('/api/config') ||
    pathname.startsWith('/api/logs') ||
    pathname.startsWith('/api/upload');

  if (isApiRoute) {
    // Rutas públicas que se pueden consultar con GET
    const isPublicGet =
      method === 'GET' &&
      (pathname.startsWith('/api/carousel') ||
       pathname.startsWith('/api/directory') ||
       pathname.startsWith('/api/documents') ||
       pathname.startsWith('/api/areas') ||
       pathname.startsWith('/api/categorias') ||
       pathname.startsWith('/api/config'));

    if (isPublicGet) {
      return NextResponse.next();
    }

    // Para todas las demás acciones (POST, PUT, DELETE, y endpoints de logs/upload): verificar JWT
    const sessionCookie = request.cookies.get('admin_session')?.value;

    if (!sessionCookie) {
      return new NextResponse(
        JSON.stringify({ error: 'No autorizado. Se requiere inicio de sesión.' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    const session = await decrypt(sessionCookie);
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Sesión inválida o expirada.' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/carousel/:path*',
    '/api/directory/:path*',
    '/api/documents/:path*',
    '/api/areas/:path*',
    '/api/categorias/:path*',
    '/api/config/:path*',
    '/api/logs/:path*',
    '/api/upload/:path*',
  ],
};
