# Despliegue en Vercel — Secretaría de Turismo (Puebla)

## Cambios aplicados en este commit

1. **Bitácora en Turso** — `src/lib/audit.ts`, `src/app/api/logs/route.ts` y `src/app/api/auth/login/route.ts` ahora escriben a la tabla `audit_logs` en Turso. Antes escribían a `src/data/access_logs.json`, lo cual no funciona en Vercel (FS efímero).

2. **Uploads a Vercel Blob** — `src/app/api/upload/route.ts` ahora usa `@vercel/blob` en vez de `fs.writeFile` a `public/uploads/`. La URL devuelta apunta a `*.vercel-storage.com`.

3. **Schema migrado** — nueva tabla `audit_logs` agregada a `src/db/schema.ts` y migración generada en `drizzle/0000_careful_randall_flagg.sql`.

4. **Rutas de imagen arregladas** — `<img src="Escudo_pie.svg">` → `<img src="/Escudo_pie.svg">` en `public-header.tsx`, `public-footer.tsx` y `dashboard.tsx` (antes rotas en subrutas).

5. **Middleware → Proxy** — `src/middleware.ts` renombrado a `src/proxy.ts` (convención de Next.js 16).

6. **next.config.ts** — agregado `images.remotePatterns` para `images.unsplash.com` (compatibilidad con seed existente).

## Pasos para desplegar

### 1. Aplicar la migración a Turso (antes del primer deploy)

```bash
npx drizzle-kit push
```

Opcionalmente, aplicar la migración SQL manualmente con `turso db shell <db-name> < drizzle/0000_careful_randall_flagg.sql`.

### 2. Crear un Blob Store en Vercel

1. Dashboard de Vercel → **Storage** → **Create Database** → **Blob**.
2. Nombre: `turismo-uploads` (o el que prefieras).
3. Vercel inyectará automáticamente `BLOB_READ_WRITE_TOKEN` en el proyecto cuando lo vincules, pero también puedes copiarlo manualmente a las variables de entorno.

### 3. Configurar variables de entorno en Vercel

En **Settings → Environment Variables** del proyecto, agregar:

| Variable | Valor |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://secturismo-disloyalcobra.aws-us-east-1.turso.io` |
| `TURSO_AUTH_TOKEN` | (el valor de tu `.env.local`) |
| `JWT_SECRET` | **regenerar** — el actual dice "change_me" y es inseguro |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD_HASH` | (o regenerar con `bcrypt.hash` server-side) |
| `BLOB_READ_WRITE_TOKEN` | (Vercel lo inyecta si el Blob store está vinculado) |

**Importante**: no subir `.env.local` al repositorio. Las variables de entorno se configuran en el dashboard de Vercel.

### 4. Migrar imágenes existentes (opcional pero recomendado)

Los 5.3 MB de archivos en `public/uploads/` (los que ya están commiteados) **aún son accesibles** en Vercel desde `/uploads/...` — son archivos estáticos servidos directamente. Si quieres migrarlos a Vercel Blob:

1. Crear un script `scripts/migrate-uploads-to-blob.ts` (puedo ayudarte si lo necesitas).
2. Actualizar las URLs en la DB de Turso (tabla `carrusel_imagenes.imagen_url`) cambiando `/uploads/xxx.jpg` por la URL absoluta de Blob.
3. Borrar `public/uploads/` para reducir el tamaño del deploy.

### 5. Deploy

1. Push al branch conectado (Vercel detecta el push y hace deploy automático).
2. O usar `vercel --prod` desde la CLI.

### 6. Verificación post-deploy

- `/` carga el hero con el carrusel.
- `/admin` muestra el login. Credenciales: `admin` / `Turismo2026!` (si se re-ejecutó el seed; o las credenciales del fallback de `ADMIN_USERNAME`/`ADMIN_PASSWORD_HASH`).
- Subir una imagen desde el panel → la URL devuelta debe ser `https://<store-id>.public.blob.vercel-storage.com/...`.
- Login → debe aparecer un registro en `audit_logs` (consultable en el panel).

## Limitaciones conocidas

- **Rate-limit de login** — el `Map<>` que bloquea IPs tras 5 intentos fallidos se reinicia en cada cold start de Vercel. Si necesitas rate-limit persistente entre invocaciones serverless, habría que crear una tabla `login_attempts` en Turso. No incluido en este commit.
