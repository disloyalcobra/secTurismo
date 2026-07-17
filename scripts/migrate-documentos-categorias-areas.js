// scripts/migrate-documentos-categorias-areas.js
// Añade columnas faltantes a `documentos` y crea las tablas `categorias` y `areas`.
// Ejecutar: node scripts/migrate-documentos-categorias-areas.js
//
// Lee TURSO_DATABASE_URL / TURSO_AUTH_TOKEN del entorno (igual que src/db).

const { createClient } = require('@libsql/client');

(async () => {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:turismo.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const client = createClient(authToken ? { url, authToken } : { url });

  console.log('🔧 Aplicando migración a:', url);

  // ── 1. columnas faltantes en `documentos` ─────────────────────────────
  // SQLite (libsql) no soporta IF NOT EXISTS en ALTER TABLE ADD COLUMN,
  // así que consultamos primero el schema y añadimos solo lo que falte.
  const cols = await client.execute("PRAGMA table_info(documentos)");
  const have = new Set(cols.rows.map(r => r.name));

  const need = [
    { name: 'tipo',              ddl: "ALTER TABLE documentos ADD COLUMN tipo TEXT DEFAULT 'pdf'" },
    { name: 'categoria',         ddl: "ALTER TABLE documentos ADD COLUMN categoria TEXT" },
    { name: 'orden',             ddl: "ALTER TABLE documentos ADD COLUMN orden INTEGER DEFAULT 0" },
    { name: 'fecha_publicacion', ddl: "ALTER TABLE documentos ADD COLUMN fecha_publicacion TEXT" },
  ];

  for (const c of need) {
    if (have.has(c.name)) {
      console.log(`  · documentos.${c.name} ya existe, salto.`);
    } else {
      console.log(`  + añadiendo documentos.${c.name}…`);
      await client.execute(c.ddl);
    }
  }

  // ── 2. tabla `categorias` ────────────────────────────────────────────
  console.log('  + creando tabla categorias…');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modulo_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      orden INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
    );
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_categorias_modulo
      ON categorias(modulo_id);
  `);

  // ── 3. tabla `areas` ─────────────────────────────────────────────────
  console.log('  + creando tabla areas…');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      orden INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1
    );
  `);

  console.log('✅ Migración completada.');
  process.exit(0);
})().catch(e => { console.error('❌ Error:', e); process.exit(1); });
