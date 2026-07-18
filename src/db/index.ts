// src/db/index.ts
// Cliente LibSQL → Turso (prod) o SQLite local (dev)

import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';

type DrizzleDb = LibSQLDatabase<typeof schema>;

// Inicialización perezosa: el cliente solo se crea en runtime (no durante
// `next build`, donde `process.env.TURSO_DATABASE_URL` puede no estar
// disponible y haría fallar la recolección de datos de páginas como /api/areas).
let _db: DrizzleDb | null = null;

function getDb(): DrizzleDb {
  if (_db) return _db;

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      'TURSO_DATABASE_URL no está definida. Configúrala en .env.local y en Vercel (Settings → Environment Variables).',
    );
  }

  const client: Client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  _db = drizzle(client, { schema });
  return _db;
}

// Proxy para preservar la ergonomía de `db.select()...` sin inicializar
// el cliente hasta el primer uso real (en runtime, no en build).
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export { schema };
