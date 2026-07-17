// scripts/migrate-carousel-padre-hijo.js
// Ajusta el schema del módulo Carrusel a la estructura padre→hijo:
//
//   carruseles (padre)
//     └── carrusel_imagenes (hijas, con es_portada = 1 en la primera)
//
// Cambios:
//   1. carruseles     → agrega columna `mostrar_en_home` (BOOL default 1).
//   2. carrusel_imagenes → agrega columna `es_portada` (BOOL default 0).
//   3. Backfill: marca es_portada = 1 en la primera imagen (orden = 0) de
//      cada carrusel.
//   4. Normaliza el `tipo` de los carruseles a 'hero' o 'galeria'.
//
// Idempotente: usar `ADD COLUMN` solo si la columna no existe, para que
// correr el script varias veces no rompa.
//
// Uso:  node scripts/migrate-carousel-padre-hijo.js

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', '.env.local');
const env = fs.readFileSync(envFile, 'utf8');
const get = (k) => {
  const m = env.match(new RegExp(k + '=(.*)'));
  if (!m) throw new Error(`Falta la variable ${k} en .env.local`);
  return m[1].trim();
};

const client = createClient({
  url: get('TURSO_DATABASE_URL'),
  authToken: get('TURSO_AUTH_TOKEN'),
});

function hasColumn(rows, name) {
  return rows.some((r) => r.name === name);
}

async function run() {
  console.log('🔧 Migrando carruseles → estructura padre→hijo...\n');

  // ── 1. carruseles: agregar mostrar_en_home ───────────────────────────
  const colsCarruseles = await client.execute("PRAGMA table_info('carruseles')");
  if (!hasColumn(colsCarruseles.rows, 'mostrar_en_home')) {
    await client.execute('ALTER TABLE carruseles ADD COLUMN mostrar_en_home INTEGER DEFAULT 1');
    console.log('  ✓ carruseles.mostrar_en_home agregada');
  } else {
    console.log('  · carruseles.mostrar_en_home ya existe, skip');
  }

  // ── 2. carrusel_imagenes: agregar es_portada ─────────────────────────
  const colsImagenes = await client.execute("PRAGMA table_info('carrusel_imagenes')");
  if (!hasColumn(colsImagenes.rows, 'es_portada')) {
    await client.execute('ALTER TABLE carrusel_imagenes ADD COLUMN es_portada INTEGER DEFAULT 0');
    console.log('  ✓ carrusel_imagenes.es_portada agregada');
  } else {
    console.log('  · carrusel_imagenes.es_portada ya existe, skip');
  }

  // ── 3. Backfill: marcar la primera imagen de cada carrusel como portada
  const firstImgs = await client.execute({
    sql: `
      SELECT id, carrusel_id FROM carrusel_imagenes
      WHERE id IN (
        SELECT MIN(id) FROM carrusel_imagenes GROUP BY carrusel_id
      )
    `,
  });
  for (const row of firstImgs.rows) {
    await client.execute({
      sql: 'UPDATE carrusel_imagenes SET es_portada = 1 WHERE id = ?',
      args: [row.id],
    });
    console.log(`  ✓ Imagen ${row.id} marcada como portada (carrusel ${row.carrusel_id})`);
  }
  if (firstImgs.rows.length === 0) {
    console.log('  · No hay imágenes todavía, skip backfill');
  }

  // ── 4. Normalizar `tipo` de carruseles a 'hero' | 'galeria' ──────────
  const c1 = await client.execute("UPDATE carruseles SET tipo = 'hero'    WHERE tipo = 'principal'");
  const c2 = await client.execute("UPDATE carruseles SET tipo = 'galeria' WHERE tipo = 'galeria'");
  console.log(`  ✓ Tipos normalizados (${c1.rowsAffected ?? 0} a hero, ${c2.rowsAffected ?? 0} ya en galeria)`);

  // ── 5. Verificación ──────────────────────────────────────────────────
  console.log('\n📋 Columnas finales de carruseles:');
  const finalCarruseles = await client.execute("PRAGMA table_info('carruseles')");
  finalCarruseles.rows.forEach((c) => console.log(`   - ${c.name} (${c.type})`));

  console.log('\n📋 Columnas finales de carrusel_imagenes:');
  const finalImgs = await client.execute("PRAGMA table_info('carrusel_imagenes')");
  finalImgs.rows.forEach((c) => console.log(`   - ${c.name} (${c.type})`));

  const cs = await client.execute('SELECT id, clave, nombre, tipo, mostrar_en_home FROM carruseles ORDER BY orden');
  console.log('\n📋 Carruseles vigentes:');
  cs.rows.forEach((r) =>
    console.log(`   - id=${r.id} | ${r.clave} | ${r.nombre} | tipo=${r.tipo} | home=${r.mostrar_en_home}`)
  );

  const ps = await client.execute(`
    SELECT ci.carrusel_id, ci.id, ci.titulo, ci.orden, ci.es_portada
    FROM carrusel_imagenes ci
    WHERE ci.es_portada = 1
    ORDER BY ci.carrusel_id
  `);
  console.log('\n📋 Portadas marcadas:');
  if (ps.rows.length === 0) {
    console.log('   (ninguna)');
  } else {
    ps.rows.forEach((r) =>
      console.log(`   - carrusel=${r.carrusel_id} | imagen=${r.id} | orden=${r.orden} | "${r.titulo ?? ''}"`)
    );
  }

  console.log('\n✅ Migración completada.');
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
