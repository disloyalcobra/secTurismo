# Arquitectura

## Tecnologías

| Componente | Tecnología | Uso |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19 | Páginas públicas, panel administrativo y rutas API en un solo proyecto. |
| Lenguaje | TypeScript | Todo el código. |
| Base de datos | libSQL / SQLite (`@libsql/client`) | En producción se usó Turso; acepta también un archivo local (`file:...`). |
| ORM | Drizzle ORM + Drizzle Kit | Esquema en `src/db/schema.ts` y migraciones en `drizzle/`. |
| Archivos | Vercel Blob (`@vercel/blob`) | Imágenes y PDF subidos desde el panel. |
| Autenticación | `jose` (JWT HS256) y `bcryptjs` | Sesión del panel en una cookie y contraseñas cifradas. |
| Calidad | ESLint | `npm run lint` |

## Estructura del proyecto

```
drizzle/                    Migraciones SQL generadas por Drizzle Kit (esquema completo)
public/                     Archivos estáticos (escudo, íconos). public/uploads/ contiene imágenes de prueba
src/
  app/
    page.tsx                Inicio (carrusel principal, mensaje del titular)
    quienes-somos/          Páginas públicas…
    directorio/
    galeria/
    normatividad/           Secciones de documentos: cada una consulta /api/documents?seccion=<clave>
    planes/
    control-interno/
    comite-etica/
    igualdad-laboral/
    components/             Encabezado, pie de página y contenido de inicio
    admin/                  Panel administrativo (/admin): login y dashboard
    api/                    Rutas API (ver tabla abajo)
  db/
    schema.ts               Definición de tablas
    index.ts                Cliente de base de datos (lee TURSO_DATABASE_URL y TURSO_AUTH_TOKEN)
    seed.ts                 Datos de PRUEBA. No usar en producción
  lib/
    auth.ts                 Firma y verificación de la sesión (JWT_SECRET)
    audit.ts                Registro en la bitácora (tabla audit_logs)
  proxy.ts                  Protege las rutas API (equivalente a "middleware" en Next.js 16)
drizzle.config.ts           Configuración de Drizzle Kit
next.config.ts              Configuración de Next.js
```

## Modelo de datos

Definido en `src/db/schema.ts`. La migración `drizzle/0000_careful_randall_flagg.sql` crea las 10 tablas.

| Tabla | Contenido |
|---|---|
| `modulos` | Las 5 secciones de documentos del portal. **Catálogo fijo**: las páginas las buscan por `clave` (`control-interno`, `normatividad`, `planes`, `comite-etica`, `igualdad-laboral`). |
| `categorias` | Subcategorías de cada módulo. Se administran desde el panel. |
| `documentos` | Documentos de cada módulo: enlace externo (p. ej. Google Drive) o PDF subido. |
| `areas` | Áreas de adscripción del directorio. |
| `contactos` | Directorio institucional. |
| `carruseles` | Agrupadores de imágenes. El de clave `principal` es el carrusel de la página de inicio; los demás aparecen en `/galeria`. |
| `carrusel_imagenes` | Imágenes de cada carrusel. |
| `contenido_estatico` | Configuración editable: datos de contacto, redes sociales, SEO y datos del titular (claves `config_*`). |
| `usuarios_admin` | Usuarios del panel, con contraseña cifrada con bcrypt. |
| `audit_logs` | Bitácora de inicios de sesión y acciones administrativas. |

Para cambiar el esquema: edita `src/db/schema.ts`, ejecuta `npx drizzle-kit generate` para crear una nueva migración en `drizzle/` y aplícala con `npx drizzle-kit migrate`.

## Seguridad

- **Sesión:** al iniciar sesión se emite un JWT firmado con `JWT_SECRET`. Se guarda en la cookie `admin_session` (`httpOnly`, `sameSite=lax` y `secure` en producción) y expira en 1 hora.
- **Protección de la API** (`src/proxy.ts`):
  - Las consultas `GET` de contenido público son abiertas.
  - Toda escritura (`POST`, `PUT`, `DELETE`) y los endpoints `logs`, `upload` y `usuarios` requieren una sesión válida.
- **Contraseñas:** se guardan con bcrypt (10 rondas).
- **Bloqueo por intentos:** tras 5 intentos fallidos, la IP se bloquea 15 minutos. El contador vive en memoria, así que se reinicia si el servidor se reinicia (o en cada arranque en frío en Vercel).
- **Acceso de emergencia:** si el usuario no existe en `usuarios_admin`, el login compara contra `ADMIN_USERNAME` y `ADMIN_PASSWORD_HASH`, siempre que estén definidas (ver [VARIABLES_DE_ENTORNO.md](VARIABLES_DE_ENTORNO.md)).
- **Subidas:** solo se aceptan PDF, JPG, PNG y WEBP de hasta 20 MB, con nombre sanitizado.

> **Importante:** el archivo `src/db/seed.ts` y el documento `DEPLOY_VERCEL.md` de la raíz contienen la contraseña de prueba del administrador. No ejecutes el seed en producción y asegúrate de que ningún usuario de producción use esa contraseña.

## API

| Ruta | Métodos | Uso |
|---|---|---|
| `/api/auth/login`, `/api/auth/logout` | POST | Inicio y cierre de sesión. |
| `/api/documents` | GET público; POST/PUT/DELETE con sesión | Documentos (`?seccion=<clave del módulo>`). |
| `/api/categorias` | GET público; escritura con sesión | Categorías por módulo. |
| `/api/directory` | GET público; escritura con sesión | Contactos. |
| `/api/areas` | GET público; escritura con sesión | Áreas del directorio. |
| `/api/carousel`, `/api/carousel/[id]`, `/api/carousel/[id]/imagenes` | GET público; escritura con sesión | Carruseles e imágenes. Si no existe, el carrusel `principal` se crea automáticamente. |
| `/api/galeria` | GET | Imágenes de los carruseles distintos al principal. |
| `/api/config` | GET público; escritura con sesión | Configuración del portal (`contenido_estatico`). |
| `/api/usuarios` | Con sesión | Alta, edición y baja de usuarios del panel, incluido el cambio de contraseña. |
| `/api/logs` | Con sesión | Consulta de la bitácora. |
| `/api/upload` | POST con sesión | Subida de archivos a Vercel Blob. |
