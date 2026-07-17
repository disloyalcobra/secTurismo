// Script para añadir columnas faltantes al turismo.db existente
const { createClient } = require('@libsql/client');

const client = createClient({ url: 'file:turismo.db' });

async function migrate() {
  console.log('🔧 Migrando turismo.db para añadir columnas faltantes...\n');

  const statements = [
    // Añadir columna tipo a documentos (si no existe)
    `ALTER TABLE documentos ADD COLUMN tipo TEXT DEFAULT 'pdf'`,
    // Añadir texto_boton a carrusel_imagenes
    `ALTER TABLE carrusel_imagenes ADD COLUMN texto_boton TEXT`,
    // Añadir album a carrusel_imagenes
    `ALTER TABLE carrusel_imagenes ADD COLUMN album TEXT`,
    // Añadir fecha_evento a carrusel_imagenes
    `ALTER TABLE carrusel_imagenes ADD COLUMN fecha_evento TEXT`,
  ];

  for (const sql of statements) {
    try {
      await client.execute(sql);
      console.log('  ✓', sql.substring(0, 60));
    } catch (e) {
      if (e.message && e.message.includes('duplicate column')) {
        console.log('  ℹ️  Columna ya existe, skipping:', sql.substring(0, 60));
      } else {
        console.log('  ⚠️  Error (ignorado):', e.message);
      }
    }
  }

  console.log('\n✅ Migración completada.');
  process.exit(0);
}

migrate().catch(e => { console.error('Error:', e.message); process.exit(1); });
