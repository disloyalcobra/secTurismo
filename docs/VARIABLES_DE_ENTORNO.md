# Variables de entorno

La aplicación lee su configuración de variables de entorno:

- **En desarrollo:** se definen en un archivo `.env.local` en la raíz del proyecto. Este archivo está excluido de Git y no debe subirse nunca.
- **En producción:** se definen en el panel del proveedor (por ejemplo, Vercel → Settings → Environment Variables) o en el servicio o contenedor del servidor.

**Cada instalación debe generar sus propios valores.** No se deben reutilizar los del entorno de desarrollo.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `TURSO_DATABASE_URL` | Sí | Dirección de la base de datos. Turso: `libsql://<base>-<organizacion>.turso.io`. Archivo local: `file:./data/portal.db` (ruta relativa a la carpeta desde donde se inicia la app; en servidores es preferible una ruta absoluta, p. ej. `file:/srv/portal/data/portal.db`). |
| `TURSO_AUTH_TOKEN` | Solo con Turso | Token de acceso de la base. Se genera con `turso db tokens create <base>`. Se deja vacío con un archivo local. |
| `JWT_SECRET` | Sí, en producción | Clave para firmar las sesiones del panel. Sin ella, la app no arranca en producción. Si se cambia, se cierran todas las sesiones abiertas. |
| `BLOB_READ_WRITE_TOKEN` | Para subir archivos | Token de un almacén de Vercel Blob. Sin él, la subida de imágenes y PDF desde el panel responde con error 503; el resto del portal funciona (ver [DESPLIEGUE.md](DESPLIEGUE.md#limitación-subida-de-archivos-y-vercel-blob)). |
| `ADMIN_USERNAME` | No | Usuario de acceso de emergencia. Si se omite, vale `admin`. |
| `ADMIN_PASSWORD_HASH` | No | Hash bcrypt de la contraseña de emergencia. **Si está vacía, el acceso de emergencia queda desactivado** (recomendado en operación normal). |

## Cómo generar los valores

`JWT_SECRET`, una cadena aleatoria de 64 caracteres:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

`ADMIN_PASSWORD_HASH`, o el hash para crear un usuario directamente en la base de datos (ejecutar dentro de la carpeta del proyecto, después de `npm install`):

```bash
node -e "console.log(require('bcryptjs').hashSync('ESCRIBE_AQUI_LA_CONTRASEÑA', 10))"
```

## Plantilla de `.env.local`

```dotenv
TURSO_DATABASE_URL=file:./data/portal.db
TURSO_AUTH_TOKEN=
JWT_SECRET=
BLOB_READ_WRITE_TOKEN=
ADMIN_USERNAME=
ADMIN_PASSWORD_HASH=
```
