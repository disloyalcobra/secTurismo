// src/app/api/config/route.ts
// Config del portal — usa contenido_estatico con clave 'config_*' en Turso
import { NextRequest, NextResponse } from 'next/server';
import { like } from 'drizzle-orm';
import { db, schema } from '@/db';
import { logAdminAction } from '@/lib/audit';
import { decrypt } from '@/lib/auth';

const { contenidoEstatico } = schema;

async function getAdmin(req: NextRequest) {
  const tok = req.cookies.get('admin_session')?.value;
  if (tok) { const s = await decrypt(tok); return s?.username || 'admin'; }
  return 'admin';
}

const CONFIG_KEYS = [
  'config_direccion','config_telefono','config_correo',
  'config_facebookUrl','config_twitterUrl','config_instagramUrl',
  'config_seoTitle','config_seoDescription',
  'config_titularNombre','config_titularPuesto',
  'config_titularMensaje','config_titularImagen',
];

export async function GET() {
  try {
    const rows = await db.select().from(contenidoEstatico)
      .where(like(contenidoEstatico.clave, 'config_%'));

    const map: Record<string, string> = {};
    for (const r of rows) map[r.clave] = r.contenido ?? '';

    // Devolver en el formato que espera el frontend
    return NextResponse.json({
      direccion:      map['config_direccion']      ?? '',
      telefono:       map['config_telefono']       ?? '',
      correo:         map['config_correo']         ?? '',
      facebookUrl:    map['config_facebookUrl']    ?? '',
      twitterUrl:     map['config_twitterUrl']     ?? '',
      instagramUrl:   map['config_instagramUrl']   ?? '',
      seoTitle:       map['config_seoTitle']       ?? '',
      seoDescription: map['config_seoDescription'] ?? '',
      titularNombre:  map['config_titularNombre']  ?? '',
      titularPuesto:  map['config_titularPuesto']  ?? '',
      titularMensaje: map['config_titularMensaje'] ?? '',
      titularImagen:  map['config_titularImagen']  ?? '',
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({});
  }
}

export async function PUT(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const admin = await getAdmin(req);
  try {
    const body = await req.json();
    const updates: Promise<unknown>[] = [];

    const fieldMap: Record<string, string> = {
      direccion: 'config_direccion', telefono: 'config_telefono',
      correo: 'config_correo', facebookUrl: 'config_facebookUrl',
      twitterUrl: 'config_twitterUrl', instagramUrl: 'config_instagramUrl',
      seoTitle: 'config_seoTitle', seoDescription: 'config_seoDescription',
      titularNombre: 'config_titularNombre', titularPuesto: 'config_titularPuesto',
      titularMensaje: 'config_titularMensaje', titularImagen: 'config_titularImagen',
    };

    for (const [field, clave] of Object.entries(fieldMap)) {
      if (field in body) {
        updates.push(
          db.insert(contenidoEstatico)
            .values({ clave, titulo: clave.replace('config_', ''), contenido: String(body[field]), activo: true })
            .onConflictDoUpdate({ target: contenidoEstatico.clave, set: { contenido: String(body[field]) } })
        );
      }
    }
    await Promise.all(updates);
    await logAdminAction(admin, ip, 'Actualizó configuración del portal', 'Config');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al actualizar configuración.' }, { status: 500 });
  }
}
