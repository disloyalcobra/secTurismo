# Instalación local (desarrollo o pruebas)

## Requisitos

- Node.js 20.9 o superior (se recomienda la versión LTS más reciente) y npm.
- Git.
- Opcional: [Turso CLI](https://docs.turso.tech/cli/introduction), si se va a trabajar contra una base en Turso.

## Pasos

1. Clona el repositorio e instala las dependencias:

   ```bash
   git clone <URL del repositorio institucional>
   cd secTurismo
   npm install
   ```

2. Crea el archivo `.env.local` en la raíz, con la plantilla de [VARIABLES_DE_ENTORNO.md](VARIABLES_DE_ENTORNO.md). Para trabajar sin Turso basta con:

   ```dotenv
   TURSO_DATABASE_URL=file:./data/portal.db
   JWT_SECRET=cualquier-cadena-larga-para-desarrollo
   ```

   Si `./data` no existe, créala antes (`mkdir data`).

3. Crea las tablas y los datos mínimos siguiendo [BASE_DE_DATOS_VACIA.md](BASE_DE_DATOS_VACIA.md).

   Para tener contenido de ejemplo puedes ejecutar `npm run seed`, **solo en una base de pruebas**. Inserta datos ficticios y un administrador con contraseña conocida. El seed no carga `.env.local` por sí mismo, así que primero define `TURSO_DATABASE_URL` en la terminal.

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   - Sitio público: http://localhost:3000
   - Panel administrativo: http://localhost:3000/admin

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática. |
| `npm run build` | Compila la versión de producción. |
| `npm start` | Ejecuta la versión compilada (puerto 3000; se cambia con la variable `PORT`). |
| `npm run lint` | Revisión de código con ESLint. |
| `npm run seed` | Carga datos de PRUEBA. No usar en producción. |
| `npm run db:studio` | Abre Drizzle Studio para ver y editar la base de datos en el navegador. |

> En desarrollo, sin `BLOB_READ_WRITE_TOKEN`, la subida de imágenes y PDF desde el panel muestra el error "El almacenamiento no está configurado". Los documentos con enlace externo (Google Drive) funcionan con normalidad.
