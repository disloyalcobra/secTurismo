# Plan de Configuración de la Base de Datos
## Secretaría de Turismo del Estado de Puebla

---

# 1. Objetivo

Este documento define la configuración y funcionamiento de la base de datos que utilizará el sistema web de la Secretaría de Turismo del Estado de Puebla.

El objetivo es contar con una base de datos sencilla, escalable y fácil de mantener, que permita administrar el contenido del sitio web desde un panel de administración desarrollado en Next.js.

---

# 2. Tecnologías

El proyecto utilizará las siguientes tecnologías:

| Tecnología | Uso |
|------------|-----|
| Next.js | Framework principal del sistema |
| TypeScript | Desarrollo del proyecto |
| Turso | Base de datos SQLite distribuida |
| Drizzle ORM | ORM para acceso y administración de la base de datos |
| LibSQL | Driver de conexión entre Next.js y Turso |

---

# 3. Arquitectura

La aplicación seguirá la siguiente arquitectura:

```
Usuario
      │
      ▼
Next.js
      │
      ▼
Drizzle ORM
      │
      ▼
LibSQL
      │
      ▼
Turso Database
```

El acceso a la base de datos se realizará únicamente mediante Drizzle ORM.

No se realizarán consultas SQL directamente desde la aplicación, excepto durante la creación de la base de datos o migraciones.

---

# 4. Base de Datos

La base de datos estará organizada en tablas independientes según el tipo de información que administra el sitio.

Cada tabla representa un módulo del sistema.

---

# 5. Descripción de las tablas

## 5.1 Tabla: modulos

Esta tabla almacena el catálogo de módulos del sitio.

Su función es identificar las distintas secciones que utilizan documentos.

Actualmente contendrá registros como:

- Control Interno
- Normatividad
- Planes
- Comité de Ética
- Igualdad Laboral

Cada documento estará asociado a uno de estos módulos.

Campos principales:

- id
- clave
- nombre
- descripcion
- orden
- activo

---

## 5.2 Tabla: documentos

Es la tabla principal del sistema.

Almacena todos los documentos publicados en el sitio.

No importa a qué sección pertenezca un documento; todos se almacenan aquí y se clasifican mediante el campo **modulo_id**.

Cada registro puede contener:

- título
- descripción
- enlace al documento
- categoría
- orden
- fecha de publicación
- estado

Esta tabla será utilizada por:

- Control Interno
- Normatividad
- Planes
- Comité de Ética
- Igualdad Laboral

---

## 5.3 Tabla: contactos

Almacena el Directorio Institucional.

Cada registro representa una persona.

Información almacenada:

- Nombre
- Cargo
- Área
- Teléfono
- Extensión
- Correo electrónico
- Fotografía

El administrador podrá:

- Crear contactos
- Editar contactos
- Ocultar contactos
- Cambiar el orden de aparición

---

## 5.4 Tabla: carruseles

Representa los distintos carruseles existentes en el sistema.

Ejemplo:

- Carrusel Principal
- Galería Institucional

Esta tabla únicamente define el contenedor del carrusel.

---

## 5.5 Tabla: carrusel_imagenes

Contiene las imágenes que pertenecen a cada carrusel.

Cada imagen podrá almacenar:

- Imagen
- Título
- Descripción
- Link
- Orden
- Fecha de inicio
- Fecha de fin
- Estado

La relación es:

```
1 Carrusel
        │
        └──────────► Muchas imágenes
```

---

## 5.6 Tabla: usuarios_admin

Almacena los usuarios con acceso al panel administrativo.

Inicialmente el sistema trabajará con un solo administrador.

La tabla permitirá crecer en el futuro sin modificar la estructura.

Información almacenada:

- Usuario
- Contraseña
- Nombre
- Rol
- Último acceso
- Estado

La contraseña será almacenada utilizando hash seguro.

---

## 5.7 Tabla: contenido_estatico

Esta tabla almacenará el contenido fijo del sitio web.

Su objetivo es evitar crear una tabla para cada sección informativa.

Ejemplos de registros:

| Clave | Contenido |
|--------|-----------|
| quienes_somos | Historia institucional |
| mision | Texto de misión |
| vision | Texto de visión |

En el futuro podrán agregarse nuevos registros sin modificar la estructura de la base de datos.

Por ejemplo:

- Objetivos
- Política de Calidad
- Avisos
- Dirección
- Teléfono
- Redes Sociales

Todo el contenido editable del sitio se administrará desde esta tabla.

---

# 6. Relaciones

Las relaciones del sistema serán las siguientes:

```
MODULOS
    │
    │ 1
    │
    └────────────── N
                 DOCUMENTOS


CARRUSELES
    │
    │ 1
    │
    └────────────── N
            CARRUSEL_IMAGENES


CONTACTOS
    │
    └── Independiente


USUARIOS_ADMIN
    │
    └── Independiente


CONTENIDO_ESTATICO
    │
    └── Independiente
```

---

# 7. Administración

El panel administrativo únicamente gestionará cinco módulos.

## Gestión de Documentos

Permitirá administrar:

- Control Interno
- Normatividad
- Planes
- Comité de Ética
- Igualdad Laboral

Operaciones:

- Crear
- Editar
- Eliminar
- Activar
- Desactivar

---

## Gestión de Directorio

Permitirá administrar los contactos del directorio institucional.

---

## Gestión de Carruseles

Permitirá:

- Crear imágenes
- Editar imágenes
- Eliminar imágenes
- Cambiar orden
- Activar o desactivar imágenes

---

## Gestión de Contenido Estático

Permitirá editar:

- Quiénes Somos
- Misión
- Visión

Sin necesidad de modificar código fuente.

---

## Gestión de Usuarios

Permitirá administrar los usuarios con acceso al panel.

---

# 8. Uso de Drizzle ORM

Toda la interacción con la base de datos se realizará mediante Drizzle ORM.

Drizzle será responsable de:

- Definir el esquema de la base de datos.
- Generar migraciones.
- Ejecutar consultas.
- Insertar registros.
- Actualizar registros.
- Eliminar registros.
- Mantener la seguridad mediante consultas tipadas.

No se utilizarán consultas SQL escritas manualmente dentro de la aplicación.

---

# 9. Uso de Turso

Turso será el motor de base de datos del proyecto.

Ventajas:

- Basado en SQLite.
- Muy rápido.
- Baja latencia.
- Ideal para aplicaciones desarrolladas con Next.js.
- Fácil integración con Drizzle ORM.
- Escalable.
- Respaldo automático.
- Compatible con despliegues en Vercel.

---

# 10. Flujo de funcionamiento

```
Administrador

        │

        ▼

Panel Administrativo

        │

        ▼

Drizzle ORM

        │

        ▼

Base de Datos Turso

        │

        ▼

Sitio Público
```

Todo el contenido mostrado en el sitio web será obtenido desde Turso mediante Drizzle ORM.

---

# 11. Objetivo Final

Se busca contar con una arquitectura sencilla, organizada y escalable que permita:

- Centralizar toda la información del sitio.
- Evitar duplicación de tablas.
- Facilitar el mantenimiento.
- Permitir el crecimiento futuro del sistema.
- Administrar el contenido desde un único panel.
- Mantener una separación clara entre la lógica de negocio y el acceso a la base de datos mediante Drizzle ORM.