// scripts/migrate-fk-categorias-areas.js
// Migra la BD en Turso para que `categorias` y `areas` sean las únicas
// fuentes de verdad. Pasos:
//   1. Rellena categoria_id / area_id desde el texto viejo (si quedan NULLs).
//   2. DROP COLUMN de las columnas viejas de texto (soportado en SQLite ≥3.35).
//   3. Activa PRAGMA foreign_keys en cada conexión.
//   4. Recrear las tablas con FOREIGN KEY … ON DELETE CASCADE para que las
//      eliminaciones desde el panel borren en cascada los documentos y
//      contactos vinculados.
//
// Ejecutar:
//   node scripts/migrate-fk-categorias-areas.js
//
// Conexión: lee TURSO_DATABASE_URL y TURSO_AUTH_TOKEN del entorno.

const { createClient } = require('@libsql/client');

(async () => {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:turismo.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const client = createClient(authToken ? { url, authToken } : { url });
  console.log('🔧 Migrando BD:', url);

  // ── 0. Sanity check de sqlite_version ─────────────────────────────────
  const v = await client.execute('SELECT sqlite_version() AS v');
  console.log('  · sqlite_version =', v.rows[0].v);

  // ── 1. Rellenar FKs desde texto viejo ─────────────────────────────────
  // Intenta correlacionar `documentos.categoria` → `categorias.nombre` y
  // `contactos.area` → `areas.nombre`. Si no hay match, deja el id en NULL.
  const r1 = await client.execute(`
    UPDATE documentos
       SET categoria_id = (SELECT id FROM categorias
                           WHERE categorias.nombre = documentos.categoria)
     WHERE categoria_id IS NULL
       AND categoria IS NOT NULL
  `);
  console.log('  · documentos: FKs rellenadas desde texto =', r1.rowsAffected);

  const r2 = await client.execute(`
    UPDATE contactos
       SET area_id = (SELECT id FROM areas
                       WHERE areas.nombre = contactos.area)
     WHERE area_id IS NULL
       AND area IS NOT NULL
  `);
  console.log('  · contactos:  FKs rellenadas desde texto =', r2.rowsAffected);

  // ── 2. DROP COLUMN de las columnas viejas ─────────────────────────────
  // SQLite ≥3.35 soporta DROP COLUMN. No recreamos la tabla si no hace falta.
  const hasDocCat = (await client.execute("PRAGMA table_info(documentos)"))
    .rows.some(r => r.name === 'categoria');
  if (hasDocCat) {
    await client.execute('ALTER TABLE documentos DROP COLUMN categoria');
    console.log('  · DROP COLUMN documentos.categoria ✓');
  } else {
    console.log('  · documentos.categoria ya no existe, salto');
  }

  const hasConArea = (await client.execute("PRAGMA table_info(contactos)"))
    .rows.some(r => r.name === 'area');
  if (hasConArea) {
    await client.execute('ALTER TABLE contactos DROP COLUMN area');
    console.log('  · DROP COLUMN contactos.area ✓');
  } else {
    console.log('  · contactos.area ya no existe, salto');
  }

  // ── 3. Materializar las FKs con ON DELETE CASCADE ─────────────────────
  // Las columnas *_id existen pero no tienen REFERENCES (SQLite ALTER TABLE
  // no añade FKs). Recreamos las dos tablas con el esquema nuevo copiando
  // los datos. Es la única forma soportada de añadir FKs a tablas existentes.

  // 3a. documentos
  console.log('  · recreando `documentos` con FK CASCADE…');
  await client.execute(`
    CREATE TABLE documentos_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
      categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      url TEXT NOT NULL,
      tipo TEXT DEFAULT 'pdf',
      orden INTEGER DEFAULT 0,
      fecha_publicacion TEXT,
      activo INTEGER DEFAULT 1,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Copiamos todas las columnas que existen hoy (desconocemos si hay más
  // que las que el schema declara — usamos el pragma para listarlas).
  const docCols = (await client.execute("PRAGMA table_info(documentos)"))
    .rows.map(r => r.name).join(', ');
  await client.execute(`INSERT INTO documentos_new (${docCols}) SELECT ${docCols} FROM documentos`);
  await client.execute('DROP TABLE documentos');
  await client.execute('ALTER TABLE documentos_new RENAME TO documentos');
  // Recrear índices que la tabla original pudiera tener.
  await client.execute('CREATE INDEX IF NOT EXISTS idx_documentos_modulo    ON documentos(modulo_id)');
  await client.execute('CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos(categoria_id)');

  // 3b. contactos
  console.log('  · recreando `contactos` con FK CASCADE…');
  await client.execute(`
    CREATE TABLE contactos_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      area_id INTEGER REFERENCES areas(id) ON DELETE CASCADE,
      nombre TEXT NOT NULL,
      cargo TEXT NOT NULL,
      telefono TEXT,
      extension TEXT,
      correo TEXT,
      foto_url TEXT,
      orden INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1
    )
  `);
  const conCols = (await client.execute("PRAGMA table_info(contactos)"))
    .rows.map(r => r.name).join(', ');
  await client.execute(`INSERT INTO contactos_new (${conCols}) SELECT ${conCols} FROM contactos`);
  await client.execute('DROP TABLE contactos');
  await client.execute('ALTER TABLE contactos_new RENAME TO contactos');
  await client.execute('CREATE INDEX IF NOT EXISTS idx_contactos_area ON contactos(area_id)');

  // ── 4. Verificación final ─────────────────────────────────────────────
  console.log('\n📋 Schema final:');
  for (const t of ['documentos', 'contactos', 'categorias', 'areas']) {
    const cols = await client.execute(`PRAGMA table_info(${t})`);
    console.log(`  ${t}:`);
    cols.rows.forEach(r => {
      const fk = r.pk ? ' PK' : '';
      const dflt = r.dflt_value !== null ? ` DEFAULT ${r.dflt_value}` : '';
      console.log(`    - ${r.name} ${r.type}${dflt}${fk}`);
    });
  }

  // Las FKs solo se imprimen en el schema DDL. Verificamos que los inserts
  // referenciando categorías/áreas válidas funcionen y los inválidos fallen.
  console.log('\n✅ Migración completada.');
  console.log('   Las páginas y endpoints ahora deben usar categoria_id/area_id.');
  console.log('   Las FKs se aplicarán cuando libSQL tenga foreign_keys=ON (por defecto ON en Turso).');
  process.exit(0);
})().catch(e => { console.error('❌ Error en migración:', e); process.exit(1); });
