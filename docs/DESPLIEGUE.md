# Despliegue (alojamiento en producción)

El portal es una aplicación Node.js estándar (Next.js), por lo que puede alojarse en cualquier servicio o servidor que ejecute Node.js 20.9 o superior. A continuación se describen tres opciones; la Secretaría puede elegir la que mejor se ajuste a sus políticas.

| | A. Vercel + Turso | B. Servidor propio | C. Otro proveedor en la nube |
|---|---|---|---|
| Infraestructura que mantener | Ninguna | Servidor, sistema operativo, HTTPS y respaldos | Mínima |
| Base de datos | Turso | Archivo SQLite en el servidor (o Turso) | Turso o SQLite con disco persistente |
| Subida de imágenes y PDF | Vercel Blob (integrado) | Requiere token de Vercel Blob o un ajuste al código | Igual que B |
| Cambios al código | No | No (salvo para prescindir de Vercel Blob) | No (salvo para prescindir de Vercel Blob) |

En cualquier opción, antes de publicar sigue [BASE_DE_DATOS_VACIA.md](BASE_DE_DATOS_VACIA.md) y configura las [variables de entorno](VARIABLES_DE_ENTORNO.md).

---

## Opción A. Vercel + Turso con cuentas institucionales

Es la configuración con la que se desarrolló y probó el portal. **No reutilices las cuentas del desarrollador**: crea cuentas nuevas con un correo institucional.

> **Planes:** el plan gratuito de Vercel (Hobby) está pensado para uso personal y no comercial. Antes de elegir plan, la Secretaría debe revisar los términos vigentes de Vercel y de Turso y valorar si corresponde un plan de pago (por ejemplo, Vercel Pro).

1. **Repositorio:** el código debe estar en una cuenta u organización de GitHub de la Secretaría (ver [ENTREGA.md](ENTREGA.md)).
2. **Turso:** crea la base y obtén la URL y el token (paso 0 de [BASE_DE_DATOS_VACIA.md](BASE_DE_DATOS_VACIA.md)). Después aplica los pasos 1 y 2 de ese documento.
3. **Vercel → Add New → Project:** importa el repositorio de GitHub. Next.js se detecta solo; no hay que cambiar los comandos de compilación.
4. **Vercel → Storage → Create → Blob:** crea un almacén y vincúlalo al proyecto. Vercel agrega `BLOB_READ_WRITE_TOKEN` automáticamente.
5. **Vercel → Settings → Environment Variables:** agrega `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` y `JWT_SECRET`, generado según [VARIABLES_DE_ENTORNO.md](VARIABLES_DE_ENTORNO.md).
6. **Deploy.** Cada `push` a la rama principal vuelve a publicar el sitio automáticamente.
7. **Dominio:** en Settings → Domains se puede asignar un dominio institucional, por ejemplo un subdominio de `puebla.gob.mx`, configurando el registro DNS que indique Vercel.

**Verificación:**

- `/` carga sin errores.
- `/admin` permite iniciar sesión.
- Subir una imagen desde el panel devuelve una URL `https://….public.blob.vercel-storage.com/…`.
- El inicio de sesión aparece en **Bitácora Admin**.

---

## Opción B. Servidor propio de la Secretaría

### Requisitos

- Servidor Windows Server o Linux con **Node.js 20.9+** (LTS recomendada) y Git.
- Un **certificado HTTPS**. En producción la cookie de sesión se marca como `secure`, así que **el panel solo funciona por HTTPS**. Por HTTP simple, el inicio de sesión no se conserva.
- Un servidor web delante de la aplicación (IIS con URL Rewrite/ARR, Nginx, Apache, Caddy…) que atienda HTTPS y reenvíe el tráfico al puerto de Node. Debe enviar el encabezado `X-Forwarded-For`, que se usa para la bitácora y el bloqueo por intentos.

### Instalación

```bash
git clone <URL del repositorio institucional> portal-turismo
cd portal-turismo
npm ci
npm run build
```

Define las variables de entorno del servicio (no en un archivo dentro del repositorio). Por ejemplo, con SQLite local:

```dotenv
NODE_ENV=production
PORT=3000
TURSO_DATABASE_URL=file:/srv/portal-turismo/data/portal.db   # en Windows: file:C:/portal-turismo/data/portal.db
JWT_SECRET=<generado>
BLOB_READ_WRITE_TOKEN=<si se usa Vercel Blob>
```

Crea la base vacía con [BASE_DE_DATOS_VACIA.md](BASE_DE_DATOS_VACIA.md) usando esa misma `TURSO_DATABASE_URL` y arranca la aplicación:

```bash
npm start
```

### Mantener el proceso activo

- **Linux:** crea un servicio `systemd` que ejecute `npm start` en la carpeta del proyecto, con las variables en `Environment=` o en un `EnvironmentFile=` con permisos restringidos.
- **Windows:** usa un gestor como [PM2](https://pm2.keymetrics.io/) (`pm2 start npm --name portal-turismo -- start`) o NSSM para registrarlo como servicio de Windows.

### Actualizar a una nueva versión

```bash
git pull
npm ci
npm run build
# reiniciar el servicio
```

Si la nueva versión incluye migraciones nuevas en `drizzle/`, aplícalas con `npx drizzle-kit migrate` (paso 1 de [BASE_DE_DATOS_VACIA.md](BASE_DE_DATOS_VACIA.md)) **antes** de reiniciar.

### Respaldos

Programa respaldos periódicos del archivo `.db` y de los archivos subidos (ver [BASE_DE_DATOS_VACIA.md](BASE_DE_DATOS_VACIA.md#respaldos)).

---

## Opción C. Otro proveedor en la nube

Cualquier plataforma que ejecute Node.js (Azure App Service, Render, Railway, Google Cloud Run, AWS, etc.) sirve con estas indicaciones:

- **Comando de compilación:** `npm ci && npm run build`. **Comando de inicio:** `npm start`. Puerto: la variable `PORT`.
- **Base de datos:** se recomienda **Turso**. Si se usa un archivo SQLite, el proveedor debe ofrecer un **disco persistente**. En plataformas sin disco persistente (contenedores efímeros, *serverless*), el archivo se perdería en cada reinicio.
- **Archivos subidos:** misma situación que la opción B (ver abajo).

---

## Limitación: subida de archivos y Vercel Blob

El endpoint `src/app/api/upload/route.ts`, que guarda las imágenes de carruseles y galería y los PDF subidos desde el panel, usa **Vercel Blob**. Necesita la variable `BLOB_READ_WRITE_TOKEN`; sin ella, responde *"El almacenamiento no está configurado"* (HTTP 503).

Qué significa en la práctica:

- **Con Vercel (opción A):** no hay problema; el almacén se crea y vincula desde el panel de Vercel.
- **Fuera de Vercel (opciones B y C):** hay dos alternativas.
  1. **Seguir usando Vercel Blob sin alojar el sitio en Vercel.** La Secretaría crea una cuenta institucional de Vercel, crea un almacén Blob y copia su token en `BLOB_READ_WRITE_TOKEN`. Vercel Blob funciona desde cualquier servidor. Es la opción sin cambios de código.
  2. **Dejar de depender de Vercel.** Un desarrollador debe modificar `src/app/api/upload/route.ts` para guardar los archivos en el disco del servidor o en otro servicio de almacenamiento (Amazon S3, Azure Blob Storage, Cloudflare R2, etc.) y devolver la URL pública. El resto de la aplicación solo guarda esa URL, así que no requiere más cambios.
     - **Si se guardan en disco:** no basta con escribir en `public/`. Next.js solo sirve los archivos que estaban en `public/` al compilar, así que se necesita una ruta que entregue los archivos nuevos o que el servidor web los sirva desde una carpeta propia.

Mientras tanto, todo lo demás funciona sin almacenamiento de archivos: directorio, configuración y documentos como **enlace externo** (Google Drive). Lo único que no está disponible es la subida desde el panel.

> La carpeta `public/uploads/` del repositorio contiene imágenes de prueba de la etapa de desarrollo. La base vacía no las usa y pueden eliminarse.
