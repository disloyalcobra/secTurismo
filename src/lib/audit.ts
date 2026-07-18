// src/lib/audit.ts
// Bitácora de auditoría. Persistencia en Turso (antes access_logs.json en
// disco, lo cual es incompatible con el sistema de archivos efímero de Vercel).
import { db, schema } from '@/db';

const { auditLogs } = schema;

export async function logAdminAction(
  username: string,
  ip: string,
  action: string,
  entity: string
) {
  try {
    await db.insert(auditLogs).values({
      username: username || 'admin',
      ip: ip || '127.0.0.1',
      status: 'SUCCESS',
      action,
      entity,
    });
  } catch (error) {
    console.error('Error guardando bitácora de auditoría:', error);
  }
}
