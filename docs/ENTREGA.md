# Entrega-recepción del sistema

Lista de verificación para transferir el portal a la Secretaría de Turismo al concluir el servicio social. El objetivo es que la Secretaría tenga el control total del código y de su infraestructura, y que **no quede ninguna dependencia de las cuentas personales del desarrollador**.

## 1. Código fuente

- [ ] La Secretaría crea una cuenta u organización de GitHub con un correo institucional. Si no usará GitHub, recibe una copia completa del repositorio (`git clone --mirror` o un archivo .zip).
- [ ] Se **transfiere** el repositorio `disloyalcobra/secTurismo` a esa cuenta: GitHub → Settings → General → Danger Zone → *Transfer ownership*. La transferencia conserva el historial; GitHub redirige la URL anterior.
- [ ] La Secretaría designa a la persona responsable del repositorio y decide si será privado (recomendado) o público.
- [ ] Se confirma que el repositorio no contiene secretos. `.env.local` está excluido por `.gitignore`.

## 2. Documentación entregada

- [ ] Carpeta `docs/` (esta documentación técnica).
- [ ] Manual de usuario y manual del administrador.
- [ ] Formatos de control: altas, bajas y cambios de contenido; solicitud de acceso al panel; acta de entrega-recepción.

## 3. Base de datos

- [ ] **Se entrega vacía.** Los datos de la base usada durante el desarrollo son de prueba y no se migran.
- [ ] La Secretaría crea su propia base siguiendo [BASE_DE_DATOS_VACIA.md](BASE_DE_DATOS_VACIA.md), con el primer administrador a su nombre.

## 4. Alojamiento

- [ ] La Secretaría elige una de las opciones de [DESPLIEGUE.md](DESPLIEGUE.md) y la configura con **sus propias cuentas** y **sus propios secretos** (`JWT_SECRET`, tokens y contraseñas).
- [ ] Si se aloja fuera de Vercel, decide cómo se manejarán los archivos subidos (ver la sección *Limitación: subida de archivos y Vercel Blob*).
- [ ] Se verifica el sitio en el nuevo alojamiento: inicio, secciones de documentos, directorio, galería, inicio de sesión en `/admin` y bitácora.

## 5. Seguridad

- [ ] Ninguna cuenta de producción usa la contraseña de prueba que aparece en `src/db/seed.ts` y en `DEPLOY_VERCEL.md`.
- [ ] Las variables `ADMIN_USERNAME` y `ADMIN_PASSWORD_HASH` quedan vacías, salvo que se necesite un acceso de emergencia.
- [ ] Cada administrador tiene su propio usuario; no se comparte una sola cuenta.
- [ ] Se acuerda quién resguarda las credenciales de GitHub, del alojamiento y de la base de datos.

## 6. Cierre de la instalación de desarrollo

La instalación usada durante el servicio social (https://portal-sec-turismo.vercel.app/, Vercel y Turso en cuentas personales del prestador) **no forma parte de la entrega**. Cuando la Secretaría confirme que su instalación funciona:

- [ ] El prestador elimina el proyecto de su cuenta de Vercel, junto con su almacén Blob.
- [ ] El prestador elimina la base de datos de su cuenta de Turso.
- [ ] Se deja de difundir la URL de desarrollo y se comunica la nueva dirección oficial.
- [ ] Se firma el acta de entrega-recepción.
