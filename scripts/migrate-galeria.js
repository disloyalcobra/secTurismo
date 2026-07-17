// scripts/migrate-galeria.js
// One-shot: recrea carrusel_imagenes con las columnas que Drizzle espera
// y elimina el carrusel duplicado 'principal' (id=3).
//
// La tabla carrusel_imagenes está VACÍA, por lo que el DROP es seguro.
// Si en producción ya tienes datos, NO corras este script — usa ALTER TABLE
// en su lugar para añadir las columnas faltantes (texto_boton, album, fecha_evento).
//
// Uso:  node scripts/migrate-galeria.js

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', '.env.local');
const env = fs.readFileSync(envFile, 'utf8');
const get = (k) => env.match(new RegExp(k + '=(.*)'))[1].trim();

const client = createClient({
  url: get('TURSO_DATABASE_URL'),
  authToken: get('TURSO_AUTH_TOKEN'),
});

async function run() {
  console.log('🔧 Migrando carrusel_imagenes en Turso...\n');

  // 1. DROP y CREATE con todas las columnas que el schema Drizzle espera.
  const ddl = [
    `DROP TABLE IF EXISTS carrusel_imagenes`,
    `CREATE TABLE carrusel_imagenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carrusel_id INTEGER NOT NULL,
      imagen_url TEXT NOT NULL,
      titulo TEXT,
      descripcion TEXT,
      link_destino TEXT,
      texto_boton TEXT,
      album TEXT,
      orden INTEGER DEFAULT 0,
      fecha_inicio TEXT,
      fecha_fin TEXT,
      fecha_evento TEXT,
      activo INTEGER DEFAULT 1,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (carrusel_id) REFERENCES carruseles(id) ON DELETE CASCADE
    )`,
  ];
  for (const stmt of ddl) {
    await client.execute(stmt);
    console.log('  ✓', stmt.substring(0, 70));
  }

  // 2. Borrar el carrusel duplicado 'principal' (id=3). El bueno es 'home-principal' (id=1).
  const dup = await client.execute({
    sql: "SELECT id, clave, nombre FROM carruseles WHERE clave = 'principal'",
  });
  for (const row of dup.rows) {
    if (row.id !== 1) {
      // El de clave 'principal' que no sea id=1 es el duplicado.
      await client.execute({ sql: 'DELETE FROM carruseles WHERE id = ?', args: [row.id] });
      console.log(`  ✓ Carrusel duplicado eliminado (id=${row.id}, clave=${row.clave})`);
    }
  }

  // 3. Verificación.
  const cols = await client.execute("PRAGMA table_info('carrusel_imagenes')");
  console.log('\n📋 Columnas finales de carrusel_imagenes:');
  cols.rows.forEach((c) => console.log(`   - ${c.name} (${c.type})`));

  const cs = await client.execute('SELECT id, clave, nombre, tipo FROM carruseles ORDER BY id');
  console.log('\n📋 Carruseles vigentes:');
  cs.rows.forEach((r) => console.log(`   - id=${r.id} | ${r.clave} | ${r.nombre} | tipo=${r.tipo}`));

  console.log('\n✅ Migración completada.');
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
