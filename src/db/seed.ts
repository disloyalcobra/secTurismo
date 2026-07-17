// src/db/seed.ts
// Migra los datos de los archivos JSON a Turso/SQLite via Drizzle ORM
// Ejecutar: npx tsx src/db/seed.ts

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import {
  modulos, documentos, contactos, carruseles,
  carruselImagenes, contenidoEstatico, usuariosAdmin
} from './schema';
import bcrypt from 'bcryptjs';

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:turismo.db';
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Iniciando seed a Turso/SQLite...\n');

  // ── 1. MÓDULOS ──────────────────────────────────────────────────────────
  console.log('Insertando módulos...');
  const modulosList = [
    { clave: 'control-interno',  nombre: 'Control Interno',                       descripcion: 'OIC – Órgano Interno de Control', orden: 1 },
    { clave: 'normatividad',     nombre: 'Normatividad',                           descripcion: 'Marco Legal y Normatividad',      orden: 2 },
    { clave: 'planes',           nombre: 'Planes',                                 descripcion: 'Planes y Programas Institucionales', orden: 3 },
    { clave: 'comite-etica',     nombre: 'Comité de Ética',                        descripcion: 'Comité de Ética e Integridad',    orden: 4 },
    { clave: 'igualdad-laboral', nombre: 'Igualdad Laboral y No Discriminación',   descripcion: 'Comité de Igualdad Laboral',      orden: 5 },
  ];
  for (const m of modulosList) {
    await db.insert(modulos).values({ ...m, activo: true }).onConflictDoNothing();
  }
  console.log('  ✓ Módulos insertados\n');

  // ── 2. DOCUMENTOS ───────────────────────────────────────────────────────
  console.log('Insertando documentos...');
  // Mapa de idCategoria (JSON antiguo) → {clave_modulo, nombreCategoria}
  const catMap: Record<number, { modulo: string; cat: string }> = {
    1:  { modulo: 'control-interno',  cat: 'Informes de Auditoría Interna' },
    2:  { modulo: 'control-interno',  cat: 'Plan Anual de Trabajo OIC' },
    3:  { modulo: 'control-interno',  cat: 'Actas de Reuniones' },
    4:  { modulo: 'control-interno',  cat: 'Procedimientos y Manuales' },
    5:  { modulo: 'control-interno',  cat: 'Seguimiento de Observaciones' },
    6:  { modulo: 'control-interno',  cat: 'Normatividad Interna' },
    7:  { modulo: 'normatividad',     cat: 'Leyes Estatales' },
    8:  { modulo: 'normatividad',     cat: 'Reglamentos de la Dependencia' },
    9:  { modulo: 'normatividad',     cat: 'Decretos y Acuerdos' },
    10: { modulo: 'planes',           cat: 'Plan Estatal de Desarrollo' },
    11: { modulo: 'planes',           cat: 'Programa Sectorial' },
    12: { modulo: 'planes',           cat: 'Planes de Trabajo' },
    13: { modulo: 'planes',           cat: 'Indicadores de Desempeño' },
    14: { modulo: 'comite-etica',     cat: 'Integrantes' },
    15: { modulo: 'comite-etica',     cat: 'Convocatorias de Elecciones' },
    16: { modulo: 'comite-etica',     cat: 'Actas de Sesiones' },
    17: { modulo: 'comite-etica',     cat: 'Código de Conducta' },
    22: { modulo: 'igualdad-laboral', cat: 'Normativa de Igualdad' },
    23: { modulo: 'igualdad-laboral', cat: 'Actas y Minutas de Igualdad' },
    24: { modulo: 'igualdad-laboral', cat: 'Convocatorias y Difusión' },
    25: { modulo: 'igualdad-laboral', cat: 'Guías y Manuales' },
  };

  // Obtener IDs reales de módulos
  const modulosDB = await db.select().from(modulos);
  const moduloIdMap: Record<string, number> = {};
  for (const m of modulosDB) moduloIdMap[m.clave] = m.id;

  const docsJson = [
    { idDocumento: 1, nombre: 'Informe de Auditoría Interna del Primer Trimestre 2026', idCategoria: 1,  tipo: 'pdf',    rutaArchivo: '/docs/auditoria-1t-2026.pdf',              urlExterna: '', fechaSubida: '2026-04-10T10:00:00.000Z' },
    { idDocumento: 2, nombre: 'Plan Anual de Trabajo OIC 2026',                          idCategoria: 2,  tipo: 'pdf',    rutaArchivo: '/docs/pat-oic-2026.pdf',                   urlExterna: '', fechaSubida: '2026-01-15T09:00:00.000Z' },
    { idDocumento: 3, nombre: 'Código de Ética y Reglas de Integridad del Estado de Puebla', idCategoria: 17, tipo: 'enlace', rutaArchivo: '', urlExterna: 'https://ojp.puebla.gob.mx/codigo-etica', fechaSubida: '2026-02-20T11:30:00.000Z' },
    { idDocumento: 4, nombre: 'Plan Estatal de Desarrollo — Sector Turismo (2019-2024)', idCategoria: 10, tipo: 'pdf',    rutaArchivo: '/docs/ped-turismo-2019-2024.pdf',          urlExterna: '', fechaSubida: '2026-03-01T14:15:00.000Z' },
    { idDocumento: 5, nombre: 'Ley Orgánica de la Administración Pública del Estado',   idCategoria: 7,  tipo: 'enlace', rutaArchivo: '', urlExterna: 'https://ojp.puebla.gob.mx/ley-organica-administracion-puebla', fechaSubida: '2026-03-05T12:00:00.000Z' },
    { idDocumento: 6, nombre: 'Código de Conducta del Comité de Igualdad Laboral y No Discriminación', idCategoria: 22, tipo: 'pdf', rutaArchivo: '/docs/codigo-conducta-igualdad.pdf', urlExterna: '', fechaSubida: '2026-05-12T10:00:00.000Z' },
    { idDocumento: 7, nombre: 'Acta de la Primera Sesión Extraordinaria del Comité 2026', idCategoria: 23, tipo: 'pdf', rutaArchivo: '/docs/acta-1-sesion-igualdad.pdf', urlExterna: '', fechaSubida: '2026-06-01T09:00:00.000Z' },
    { idDocumento: 8, nombre: 'Protocolo para la Prevención y Atención del Acoso y Hostigamiento Sexual', idCategoria: 22, tipo: 'enlace', urlExterna: 'https://puebla.gob.mx/protocolo-igualdad', rutaArchivo: '', fechaSubida: '2026-06-10T14:00:00.000Z' },
  ];

  for (const doc of docsJson) {
    const cat = catMap[doc.idCategoria];
    if (!cat) continue;
    const moduloId = moduloIdMap[cat.modulo];
    if (!moduloId) continue;
    await db.insert(documentos).values({
      moduloId,
      titulo: doc.nombre,
      url: doc.tipo === 'pdf' ? doc.rutaArchivo : doc.urlExterna,
      tipo: doc.tipo as 'pdf' | 'enlace',
      categoria: cat.cat,
      fechaPublicacion: doc.fechaSubida,
      activo: true,
    });
  }
  console.log('  ✓ Documentos insertados\n');

  // ── 3. CONTACTOS ────────────────────────────────────────────────────────
  console.log('Insertando contactos...');
  const dirJson = [
    { nombre: 'Marta Teresa', apellidoPaterno: 'Ornelas',  apellidoMaterno: 'Guerrero', cargo: 'Secretaria de Turismo',                    area: 'Despacho de la Secretaria',         correo: 'secretaria.turismo@puebla.gob.mx', telefono: '222-246-2044', extension: '1001' },
    { nombre: 'Lic. Andrea',  apellidoPaterno: 'Vázquez',  apellidoMaterno: 'Nava',     cargo: 'Subsecretaria de Promoción Turística',      area: 'Subsecretaría de Promoción Turística', correo: 'andrea.vazquez@puebla.gob.mx', telefono: '222-246-2044', extension: '1002' },
    { nombre: 'Ing. Carlos',  apellidoPaterno: 'Mendoza',  apellidoMaterno: 'Ruiz',     cargo: 'Director General de Innovación y Calidad',  area: 'Dirección General de Innovación',   correo: 'carlos.mendoza@puebla.gob.mx',  telefono: '222-246-2044', extension: '1003' },
    { nombre: 'Lic. María Elena', apellidoPaterno: 'Romero', apellidoMaterno: 'Pérez', cargo: 'Directora General de Promoción',           area: 'Subsecretaría de Promoción Turística', correo: 'maria.romero@puebla.gob.mx', telefono: '222-246-2044', extension: '1004' },
    { nombre: 'C.P. Jorge',   apellidoPaterno: 'Gómez',    apellidoMaterno: 'Morales',  cargo: 'Titular del Órgano Interno de Control',    area: 'Órgano Interno de Control',         correo: 'oic.turismo@puebla.gob.mx',     telefono: '222-246-2044', extension: '1005' },
  ];
  for (let i = 0; i < dirJson.length; i++) {
    const p = dirJson[i];
    await db.insert(contactos).values({
      nombre: `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno}`.trim(),
      cargo: p.cargo, area: p.area, correo: p.correo,
      telefono: p.telefono, extension: p.extension,
      orden: i, activo: true,
    });
  }
  console.log('  ✓ Contactos insertados\n');

  // ── 4. CARRUSEL PRINCIPAL (padre → hijas) ────────────────────────────
  console.log('Insertando carrusel principal...');
  await db.insert(carruseles).values({
    clave: 'principal', nombre: 'Carrusel Principal',
    tipo: 'hero', descripcion: 'Carrusel de la página de inicio', orden: 0, activo: true,
  }).onConflictDoNothing();
  await db.insert(carruseles).values({
    clave: 'galeria', nombre: 'Galería Institucional',
    tipo: 'galeria', descripcion: 'Fotografías institucionales', orden: 1, activo: true,
  }).onConflictDoNothing();

  const carruselesDB = await db.select().from(carruseles);
  const principalId = carruselesDB.find(c => c.clave === 'principal')!.id;
  const galeriaId   = carruselesDB.find(c => c.clave === 'galeria')!.id;

  const slides = [
    { imagenUrl: 'https://images.unsplash.com/photo-1599818818556-c3ccf2de88f0?q=80&w=1200&auto=format&fit=crop', titulo: 'Explora los Pueblos Mágicos de Puebla', descripcion: 'Déjate cautivar por la majestuosidad de Cholula, las flores de Atlixco y la neblina de Zacatlán.', linkDestino: '#destinos', textoBoton: 'Conocer más', orden: 0, esPortada: true },
    { imagenUrl: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?q=80&w=1200&auto=format&fit=crop', titulo: 'Gastronomía Única en el Mundo', descripcion: 'Disfruta de la cuna del Mole Poblano, el rompope y la riqueza culinaria tradicional.', linkDestino: '#experiencias', textoBoton: 'Ver gastronomía', orden: 1, esPortada: false },
    { imagenUrl: 'https://images.unsplash.com/photo-1585464297241-934d7f57a07d?q=80&w=1200&auto=format&fit=crop', titulo: 'Patrimonio Barroco y Modernidad', descripcion: 'El Centro Histórico de Puebla resguarda tesoros arquitectónicos de belleza incomparable.', linkDestino: '#patrimonio', textoBoton: 'Recorrer Centro', orden: 2, esPortada: false },
  ];
  for (const s of slides) {
    await db.insert(carruselImagenes).values({ carruselId: principalId, ...s, activo: true });
  }
  console.log('  ✓ Carrusel principal insertado\n');

  // ── 5. CONTENIDO ESTÁTICO (config del portal) ──────────────────────────
  console.log('Insertando contenido estático...');
  const contenidos = [
    // Config
    { clave: 'config_direccion',       titulo: 'Dirección',         contenido: 'Av. Don Juan de Palafox y Mendoza 14, Centro, 72000 Heroica Puebla de Zaragoza, Pue.', orden: 10 },
    { clave: 'config_telefono',        titulo: 'Teléfono',          contenido: '+52 (222) 123-4567', orden: 11 },
    { clave: 'config_correo',          titulo: 'Correo',            contenido: 'contacto.turismo@puebla.gob.mx', orden: 12 },
    { clave: 'config_facebookUrl',     titulo: 'Facebook',          contenido: 'https://facebook.com/PueblaTurismo', orden: 13 },
    { clave: 'config_twitterUrl',      titulo: 'Twitter',           contenido: 'https://twitter.com/TurismoGobPue', orden: 14 },
    { clave: 'config_instagramUrl',    titulo: 'Instagram',         contenido: 'https://instagram.com/TurismoGobPue', orden: 15 },
    { clave: 'config_seoTitle',        titulo: 'SEO Title',         contenido: 'Secretaría de Turismo — Gobierno del Estado de Puebla', orden: 16 },
    { clave: 'config_seoDescription',  titulo: 'SEO Description',   contenido: 'Sitio oficial de la Secretaría de Turismo del Gobierno del Estado de Puebla. Descubre nuestros pueblos mágicos, gastronomía y patrimonio cultural.', orden: 17 },
    { clave: 'config_titularNombre',   titulo: 'Titular Nombre',    contenido: 'Marta Teresa Ornelas Guerrero', orden: 18 },
    { clave: 'config_titularPuesto',   titulo: 'Titular Puesto',    contenido: 'Secretaria de Turismo', orden: 19 },
    { clave: 'config_titularMensaje',  titulo: 'Mensaje Titular',   contenido: 'Sean bienvenidos al portal oficial de la Secretaría de Turismo del Estado de Puebla. Nuestra misión es dar a conocer al mundo la enorme riqueza histórica, natural y gastronómica de nuestra tierra.', orden: 20 },
    { clave: 'config_titularImagen',   titulo: 'Foto Titular',      contenido: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop', orden: 21 },
  ];
  for (const c of contenidos) {
    await db.insert(contenidoEstatico).values({ ...c, activo: true }).onConflictDoNothing();
  }
  // Limpia entradas legacy de "quienes-somos" si quedaron de un seed anterior.
  await db.delete(contenidoEstatico).where(eq(contenidoEstatico.clave, 'quienes-somos'));
  console.log('  ✓ Contenido estático insertado\n');

  // ── 4b. MIGRACIÓN: news.json → carrusel_imagenes del principal ──────────
  // Las 3 noticias de la versión anterior del portal ahora viven como
  // imágenes del carrusel principal (titulo→titulo, resumen→descripcion,
  // urlImagenPortada→imagenUrl). Se insertan con orden alto para no
  // colisionar con los 3 slides ya existentes.
  console.log('Migrando noticias anteriores al carrusel principal...');
  const noticiasLegacy = [
    {
      titulo:      'Puebla recibe galardón al mejor destino cultural',
      descripcion: 'La Secretaría de Turismo Federal otorgó a Puebla el reconocimiento por su preservación de la riqueza cultural y arquitectura barroca.',
      imagenUrl:   'https://images.unsplash.com/photo-1599818818556-c3ccf2de88f0?q=80&w=1200&auto=format&fit=crop',
      orden:       10,
    },
    {
      titulo:      'Inicia la temporada oficial de Chiles en Nogada',
      descripcion: 'Se proyecta una derrama económica histórica de más de mil millones de pesos para restauranteros del estado.',
      imagenUrl:   'https://images.unsplash.com/photo-1596727147705-61a532a659bd?q=80&w=1200&auto=format&fit=crop',
      orden:       11,
    },
    {
      titulo:      'Zacatlán y Cuetzalan registran ocupación hotelera al 100%',
      descripcion: 'Los destinos de la Sierra Norte de Puebla reportan saldo blanco y una gran afluencia de turistas nacionales.',
      imagenUrl:   'https://images.unsplash.com/photo-1616781297135-231a31acab3d?q=80&w=1200&auto=format&fit=crop',
      orden:       12,
    },
  ];
  for (const n of noticiasLegacy) {
    await db.insert(carruselImagenes).values({
      carruselId: principalId,
      imagenUrl:   n.imagenUrl,
      titulo:      n.titulo,
      descripcion: n.descripcion,
      orden:       n.orden,
      activo:      true,
    });
  }
  console.log('  ✓ Noticias migradas al carrusel principal\n');

  // ── 6. USUARIO ADMIN ────────────────────────────────────────────────────
  console.log('Insertando usuario admin...');
  const hash = await bcrypt.hash('Turismo2026!', 10);
  await db.insert(usuariosAdmin).values({
    usuario: 'admin', passwordHash: hash,
    nombre: 'Administrador OIC', rol: 'admin', activo: true,
  }).onConflictDoNothing();
  console.log('  ✓ Usuario admin insertado (usuario: admin, contraseña: Turismo2026!)\n');

  console.log('✅ Seed completado exitosamente.');
  process.exit(0);
}

seed().catch(e => { console.error('❌ Error en seed:', e); process.exit(1); });
