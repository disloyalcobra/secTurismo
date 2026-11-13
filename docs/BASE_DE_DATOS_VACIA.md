# Crear la base de datos de producción (vacía)

El portal se entrega **sin datos**. Los datos usados durante el desarrollo eran de prueba y no se migran. Una base lista para producción necesita solo tres cosas:

1. **Las tablas**, creadas desde la migración de la carpeta `drizzle/`.
2. **El catálogo de módulos**: las 5 secciones de documentos. Las páginas las buscan por su clave y el panel no permite crearlas, así que deben insertarse al inicio.
3. **Un primer usuario administrador**, para entrar a `/admin`. Desde ahí se crean los demás usuarios y se captura todo el contenido.

> ⚠️ **No ejecutes `npm run seed` en producción.** Ese script carga documentos, contactos e imágenes ficticios y crea un administrador con una contraseña que está escrita en el código.

## Paso 0. Crear la base

**Opción Turso** (con la [Turso CLI](https://docs.turso.tech/cli/introduction) y una cuenta institucional):

```bash
turso db create portal-turismo
turso db show portal-turismo --url           # → TURSO_DATABASE_URL
turso db tokens create portal-turismo        # → TURSO_AUTH_TOKEN
```

**Opción archivo SQLite local** (servidor propio): no hay nada que crear. El archivo se genera en el paso 1. Solo asegúrate de que exista la carpeta indicada en `TURSO_DATABASE_URL`, por ejemplo `file:./data/portal.db` necesita la carpeta `data/`.

## Paso 1. Crear las tablas

Desde la carpeta del proyecto, con las dependencias instaladas (`npm install`), define las variables en la terminal y aplica la migración.

> Drizzle Kit **no** lee `.env.local`, por eso las variables se definen a mano.

PowerShell (Windows):

```powershell
$env:TURSO_DATABASE_URL = "libsql://portal-turismo-<organizacion>.turso.io"   # o "file:./data/portal.db"
$env:TURSO_AUTH_TOKEN   = "<token>"                                           # vacío si es archivo local
npx drizzle-kit migrate
```

Bash (Linux / macOS):

```bash
export TURSO_DATABASE_URL="libsql://portal-turismo-<organizacion>.turso.io"   # o "file:./data/portal.db"
export TURSO_AUTH_TOKEN="<token>"                                             # vacío si es archivo local
npx drizzle-kit migrate
```

Debe terminar con `migrations applied successfully!`.

## Paso 2. Insertar el catálogo y el primer administrador

Guarda el siguiente script como `inicializar-bd.mjs` **en la raíz del proyecto** y ejecútalo en la misma terminal del paso 1, de modo que las variables sigan definidas:

```bash
node inicializar-bd.mjs admin "UnaContraseñaSegura#2027"
```

```js
// inicializar-bd.mjs — crea el catálogo mínimo y el primer administrador.
// Uso (desde la carpeta del proyecto, con TURSO_DATABASE_URL definida):
//   node inicializar-bd.mjs <usuario> "<contraseña>"
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const [usuario, password] = process.argv.slice(2);
if (!usuario || !password || password.length < 10) {
  console.error('Uso: node inicializar-bd.mjs <usuario> "<contraseña de 10+ caracteres>"');
  process.exit(1);
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

await db.batch([
  `INSERT OR IGNORE INTO modulos (clave, nombre, descripcion, orden, activo) VALUES
     ('control-interno',  'Control Interno',                      'OIC – Órgano Interno de Control',     1, 1),
     ('normatividad',     'Normatividad',                          'Marco Legal y Normatividad',          2, 1),
     ('planes',           'Planes',                                'Planes y Programas Institucionales', 3, 1),
     ('comite-etica',     'Comité de Ética',                       'Comité de Ética e Integridad',        4, 1),
     ('igualdad-laboral', 'Igualdad Laboral y No Discriminación',  'Comité de Igualdad Laboral',          5, 1)`,
  `INSERT OR IGNORE INTO carruseles (clave, nombre, tipo, descripcion, orden, activo)
     VALUES ('principal', 'Carrusel Principal', 'hero', 'Carrusel de la página de inicio', 0, 1)`,
  {
    sql: `INSERT OR IGNORE INTO usuarios_admin (usuario, password_hash, nombre, rol, activo)
            VALUES (?, ?, 'Administrador', 'admin', 1)`,
    args: [usuario, bcrypt.hashSync(password, 10)],
  },
], 'write');

const r = await db.execute('SELECT (SELECT COUNT(*) FROM modulos) AS modulos, (SELECT COUNT(*) FROM usuarios_admin) AS usuarios');
console.log('Base inicializada:', r.rows[0]);
```

Resultado esperado:

```
Base inicializada: { modulos: 5, usuarios: 1 }
```

El script puede ejecutarse más de una vez sin duplicar registros. Si el usuario ya existe, no cambia su contraseña. **Al terminar, borra `inicializar-bd.mjs`** y no guardes la contraseña en ningún archivo.

## Paso 3. Primeros pasos en el panel

1. Entra a `/admin` con el usuario creado.
2. En **Usuarios del Sistema**, crea las cuentas personales de los administradores designados.
3. En **Ajustes Portal**, captura la dirección, el teléfono, el correo, las redes sociales, el SEO y los datos del titular.
4. En **Directorio Personal**, da de alta las áreas y después los contactos.
5. En **Documentos / PDFs**, crea las categorías de cada módulo y después los documentos. Para documentos con enlace de Google Drive, usa carpetas institucionales, no personales.
6. En **Slides Carrusel**, sube las imágenes del carrusel principal y de la galería. Requiere almacenamiento de archivos configurado; ver [DESPLIEGUE.md](DESPLIEGUE.md#limitación-subida-de-archivos-y-vercel-blob).
7. En **Bitácora Admin** se pueden revisar los accesos y los cambios realizados.

## Respaldos

- **Turso:**

  ```bash
  turso db shell portal-turismo .dump > respaldo-AAAA-MM-DD.sql
  ```

- **Archivo local:** copia el archivo `.db` con la aplicación detenida, o usa `sqlite3 portal.db ".backup respaldo.db"`.
- **Archivos subidos:** respalda también el almacén de archivos (Vercel Blob u otro), porque la base de datos solo guarda sus URL.
