CREATE TABLE `areas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`orden` integer DEFAULT 0,
	`activo` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `areas_nombre_unique` ON `areas` (`nombre`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP,
	`username` text NOT NULL,
	`ip` text,
	`status` text,
	`action` text,
	`entity` text
);
--> statement-breakpoint
CREATE TABLE `carrusel_imagenes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`carrusel_id` integer NOT NULL,
	`imagen_url` text NOT NULL,
	`titulo` text,
	`descripcion` text,
	`link_destino` text,
	`texto_boton` text,
	`album` text,
	`orden` integer DEFAULT 0,
	`fecha_inicio` text,
	`fecha_fin` text,
	`fecha_evento` text,
	`activo` integer DEFAULT true,
	`fecha_creacion` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`carrusel_id`) REFERENCES `carruseles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `carruseles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clave` text NOT NULL,
	`nombre` text NOT NULL,
	`tipo` text NOT NULL,
	`descripcion` text,
	`orden` integer DEFAULT 0,
	`activo` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `carruseles_clave_unique` ON `carruseles` (`clave`);--> statement-breakpoint
CREATE TABLE `categorias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`modulo_id` integer NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`orden` integer DEFAULT 0,
	`activo` integer DEFAULT true,
	FOREIGN KEY (`modulo_id`) REFERENCES `modulos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contactos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`area_id` integer,
	`nombre` text NOT NULL,
	`cargo` text NOT NULL,
	`telefono` text,
	`extension` text,
	`correo` text,
	`foto_url` text,
	`orden` integer DEFAULT 0,
	`activo` integer DEFAULT true,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contenido_estatico` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clave` text NOT NULL,
	`titulo` text NOT NULL,
	`contenido` text,
	`orden` integer DEFAULT 0,
	`activo` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contenido_estatico_clave_unique` ON `contenido_estatico` (`clave`);--> statement-breakpoint
CREATE TABLE `documentos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`modulo_id` integer NOT NULL,
	`categoria_id` integer,
	`titulo` text NOT NULL,
	`descripcion` text,
	`url` text NOT NULL,
	`tipo` text DEFAULT 'pdf',
	`orden` integer DEFAULT 0,
	`fecha_publicacion` text,
	`activo` integer DEFAULT true,
	`fecha_creacion` text DEFAULT CURRENT_TIMESTAMP,
	`fecha_actualizacion` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`modulo_id`) REFERENCES `modulos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `modulos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clave` text NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`orden` integer DEFAULT 0,
	`activo` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `modulos_clave_unique` ON `modulos` (`clave`);--> statement-breakpoint
CREATE TABLE `usuarios_admin` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`usuario` text NOT NULL,
	`password_hash` text NOT NULL,
	`nombre` text,
	`rol` text DEFAULT 'admin',
	`ultimo_acceso` text,
	`activo` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_admin_usuario_unique` ON `usuarios_admin` (`usuario`);