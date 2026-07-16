import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Sesión cerrada correctamente.' },
    { status: 200 }
  );

  // Borrar cookie de sesión expirándola de inmediato
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expirar de inmediato
  });

  return response;
}
