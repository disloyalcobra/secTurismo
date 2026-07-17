// src/db/schema.ts
// Drizzle ORM Schema — Secretaría de Turismo del Estado de Puebla

import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

// ─── modulos ───────────────────────────────────────────────────────────────
// Catálogo de secciones del sitio (control-interno, normatividad, etc.)
export const modulos = sqliteTable('modulos', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  clave:       text('clave').notNull().unique(),
  nombre:      text('nombre').notNull(),
  descripcion: text('descripcion'),
  orden:       integer('orden').default(0),
  activo:      integer('activo', { mode: 'boolean' }).default(true),
});

// ─── categorias ───────────────────────────────────────────────────────────
// Sub-categorías por módulo (ej. "Manuales", "Procedimientos" en
// control-interno). Administrado desde el panel.
export const categorias = sqliteTable('categorias', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  moduloId:    integer('modulo_id').notNull().references(() => modulos.id, { onDelete: 'cascade' }),
  nombre:      text('nombre').notNull(),
  descripcion: text('descripcion'),
  orden:       integer('orden').default(0),
  activo:      integer('activo', { mode: 'boolean' }).default(true),
});

// ─── areas ────────────────────────────────────────────────────────────────
// Áreas institucionales a las que se adscriben los contactos del directorio
// (ej. "Despacho del Secretario", "Dirección de Promoción"). Administrado
// desde el panel.
export const areas = sqliteTable('areas', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  nombre:      text('nombre').notNull().unique(),
  descripcion: text('descripcion'),
  orden:       integer('orden').default(0),
  activo:      integer('activo', { mode: 'boolean' }).default(true),
});

// ─── documentos ────────────────────────────────────────────────────────────
// Todos los documentos/PDFs/enlaces del sitio. La categoría ahora es FK
// (categorias.id) con borrado en cascada.
export const documentos = sqliteTable('documentos', {
  id:                   integer('id').primaryKey({ autoIncrement: true }),
  moduloId:             integer('modulo_id').notNull().references(() => modulos.id, { onDelete: 'cascade' }),
  categoriaId:          integer('categoria_id').references(() => categorias.id, { onDelete: 'cascade' }),
  titulo:               text('titulo').notNull(),
  descripcion:          text('descripcion'),
  url:                  text('url').notNull(),           // ruta PDF o URL externa
  tipo:                 text('tipo').default('pdf'),      // 'pdf' | 'enlace'
  orden:                integer('orden').default(0),
  fechaPublicacion:     text('fecha_publicacion'),
  activo:               integer('activo', { mode: 'boolean' }).default(true),
  fechaCreacion:        text('fecha_creacion').default(sql`CURRENT_TIMESTAMP`),
  fechaActualizacion:   text('fecha_actualizacion').default(sql`CURRENT_TIMESTAMP`),
});

// ─── contactos ─────────────────────────────────────────────────────────────
// Directorio institucional. El área ahora es FK (areas.id) con borrado en
// cascada.
export const contactos = sqliteTable('contactos', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  areaId:     integer('area_id').references(() => areas.id, { onDelete: 'cascade' }),
  nombre:     text('nombre').notNull(),
  cargo:      text('cargo').notNull(),
  telefono:   text('telefono'),
  extension:  text('extension'),
  correo:     text('correo'),
  fotoUrl:    text('foto_url'),
  orden:      integer('orden').default(0),
  activo:     integer('activo', { mode: 'boolean' }).default(true),
});

// ─── carruseles (PADRE) ────────────────────────────────────────────────────
// Contenedor de imágenes. Un carrusel representa una "slide" o sección
// temática (por ej. "Pueblos Mágicos", "Gastronomía") y agrupa varias
// imágenes en carrusel_imagenes (sus hijas).
//
// Relación padre→hijo:
//   - `tipo = 'hero'` y `activo = true` → sus imágenes se proyectan en
//     el carrusel principal de la home.
//   - `tipo = 'galeria'` o `activo = false` → solo se ven en /galeria.
export const carruseles = sqliteTable('carruseles', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  clave:       text('clave').notNull().unique(),
  nombre:      text('nombre').notNull(),
  tipo:        text('tipo').notNull(),                   // 'hero' | 'galeria'
  descripcion: text('descripcion'),
  orden:       integer('orden').default(0),
  activo:      integer('activo', { mode: 'boolean' }).default(true),
});

// ─── carrusel_imagenes (HIJAS) ─────────────────────────────────────────────
// Imágenes de cada carrusel. La primera (orden = 0) es la "portada" del
// carrusel padre y se usa como fondo del slide en el hero.
export const carruselImagenes = sqliteTable('carrusel_imagenes', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  carruselId:    integer('carrusel_id').notNull().references(() => carruseles.id, { onDelete: 'cascade' }),
  imagenUrl:     text('imagen_url').notNull(),
  titulo:        text('titulo'),
  descripcion:   text('descripcion'),
  linkDestino:   text('link_destino'),
  textoBoton:    text('texto_boton'),
  album:         text('album'),                         // para galería: album temático
  orden:         integer('orden').default(0),           // 0 = portada
  fechaInicio:   text('fecha_inicio'),
  fechaFin:      text('fecha_fin'),
  fechaEvento:   text('fecha_evento'),                  // para galería
  activo:        integer('activo', { mode: 'boolean' }).default(true),
  fechaCreacion: text('fecha_creacion').default(sql`CURRENT_TIMESTAMP`),
});

// ─── usuarios_admin ────────────────────────────────────────────────────────
// Usuarios con acceso al panel administrativo
export const usuariosAdmin = sqliteTable('usuarios_admin', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  usuario:       text('usuario').notNull().unique(),
  passwordHash:  text('password_hash').notNull(),
  nombre:        text('nombre'),
  rol:           text('rol').default('admin'),
  ultimoAcceso:  text('ultimo_acceso'),
  activo:        integer('activo', { mode: 'boolean' }).default(true),
});

// ─── contenido_estatico ────────────────────────────────────────────────────
// Textos y configuración editable del sitio (quienes_somos, config_*, etc.)
export const contenidoEstatico = sqliteTable('contenido_estatico', {
  id:       integer('id').primaryKey({ autoIncrement: true }),
  clave:    text('clave').notNull().unique(),
  titulo:   text('titulo').notNull(),
  contenido: text('contenido'),
  orden:    integer('orden').default(0),
  activo:   integer('activo', { mode: 'boolean' }).default(true),
});

// ─── Tipos exportados ──────────────────────────────────────────────────────
export type Modulo          = typeof modulos.$inferSelect;
export type Categoria       = typeof categorias.$inferSelect;
export type Area            = typeof areas.$inferSelect;
export type Documento       = typeof documentos.$inferSelect;
export type Contacto        = typeof contactos.$inferSelect;
export type Carrusel        = typeof carruseles.$inferSelect;
export type CarruselImagen  = typeof carruselImagenes.$inferSelect;
export type UsuarioAdmin    = typeof usuariosAdmin.$inferSelect;
export type ContenidoEstatico = typeof contenidoEstatico.$inferSelect;
