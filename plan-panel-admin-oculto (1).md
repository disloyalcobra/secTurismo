# Plan — Panel Oculto de Administración (Gestión de Documentos)
**Proyecto:** Sitio web Secretaría de Turismo del Estado de Puebla
**Módulo:** Acceso administrativo oculto para carga de documentos y contactos

---

## 1. Objetivo

Crear una página de administración **no listada en la navegación pública**, accesible únicamente mediante una URL directa (link externo) más autenticación por usuario y contraseña. Esta página permitirá, en una etapa posterior, subir/editar documentos y contactos que se conectarán a la base de datos (fase futura).

---

## 2. Estrategia de "ocultamiento"

Importante: ocultar la ruta **no es seguridad real**, solo evita que usuarios casuales la encuentren. La seguridad real la da la autenticación (sección 3). Aun así:

- La ruta **no debe aparecer** en el menú, footer, sitemap.xml ni robots.txt navegable
- Ruta sugerida: no usar algo obvio como `/admin` o `/login`. Ejemplo: `/turismo-gestion-2026` o una ruta con slug aleatorio tipo `/panel-x7f2k9`
- Se recomienda **no indexar** esa ruta en buscadores:
  ```
  # robots.txt
  Disallow: /panel-x7f2k9
  ```
- El link se comparte directamente al personal autorizado (no se publica en ningún lugar del sitio)

---

## 3. Autenticación (usuario y contraseña)

Como aún no hay base de datos, hay dos caminos posibles para esta primera etapa:

### Opción A — Credenciales fijas en variables de entorno (rápido, temporal)
- Usuario y contraseña (hasheada) guardados como variables de entorno del proyecto, no en el código fuente
- Válido solo como solución **provisional** mientras no exista la tabla `usuarios_admin`
- Ejemplo de variables:
  ```
  ADMIN_USER=usuario_definido
  ADMIN_PASSWORD_HASH=<hash_bcrypt>
  ```

### Opción B — Autenticación con servicio externo (recomendado a mediano plazo)
- Usar un servicio como NextAuth/Auth.js con un solo usuario "credentials provider"
- Permite migrar fácilmente a base de datos después sin rehacer el sistema de login

**Recomendación:** iniciar con Opción A para no bloquear el avance visual, y migrar a Opción B (o a la tabla `usuarios_admin` ya definida en el plan general) cuando se conecte la base de datos.

---

## 4. Flujo de acceso

```
1. Admin recibe el link directo (fuera del sitio: WhatsApp, correo, etc.)
   ↓
2. Accede a la ruta oculta → ve SOLO un formulario de login
   (sin navbar, sin footer, sin branding público — página aislada)
   ↓
3. Ingresa usuario + contraseña
   ↓
4. Backend valida credenciales
   ↓
5. Si es correcto → se genera sesión/token (cookie httpOnly o JWT)
   ↓
6. Redirige al panel de administración
   ↓
7. Sesión expira tras inactividad (ej. 30-60 min)
```

---

## 5. Medidas de seguridad mínimas (desde esta etapa)

- Contraseña **siempre hasheada** (bcrypt o argon2), nunca en texto plano
- Conexión únicamente por **HTTPS**
- Límite de intentos de login (ej. bloquear tras 5 intentos fallidos por 15 min) para evitar fuerza bruta
- Cookies de sesión con flags `httpOnly`, `secure`, `sameSite`
- No mostrar mensajes de error específicos ("usuario no existe" vs "contraseña incorrecta") — usar mensaje genérico: *"Usuario o contraseña incorrectos"*
- Logs de acceso (fecha, hora, IP) para auditoría, aunque sea en un archivo simple por ahora

---

## 6. Estructura de la página de login (visual)

Debe seguir la paleta institucional (vino/blanco) pero en versión minimalista, sin distraer:

- Fondo blanco o vino sólido
- Logo de la Secretaría centrado
- Campo usuario
- Campo contraseña
- Botón "Iniciar sesión" (vino, texto blanco)
- Sin enlaces a otras secciones del sitio público
- Sin indicar en el `<title>` de la pestaña que es un panel de gobierno sensible (usar algo genérico)

---

## 7. Contenido del panel una vez autenticado (placeholder por ahora)

Hasta que exista la base de datos, el panel puede mostrar una interfaz **funcional pero con datos simulados (mock)**:

- Vista de "Documentos" con formulario de carga (título, categoría, archivo/link, fecha) — guarda temporalmente en memoria o archivo JSON local
- Vista de "Contactos" con formulario similar
- Botón de "Cerrar sesión"

Esto permite avanzar el diseño y la lógica de UI sin depender aún de la base de datos, y cuando esta se implemente, solo se conecta el formulario existente a las tablas `documentos` y `contactos` ya definidas.

---

## 8. Pendiente para fases futuras (no en este alcance)

- [ ] Conexión real a base de datos (`usuarios_admin`, `documentos`, `contactos`)
- [ ] Roles y permisos (editor vs admin general)
- [ ] Historial de cambios / versión de documentos
- [ ] Recuperación de contraseña
- [ ] Autenticación de dos factores (2FA) — recomendable dado que es un sitio gubernamental

---

## 9. Stack técnico sugerido para esta etapa

Basado en las tecnologías que ya manejas:

| Capa | Opción sugerida |
|---|---|
| Framework | Next.js (rutas API integradas facilitan el login) o Astro con endpoints |
| Autenticación | NextAuth/Auth.js (credentials provider) o lógica propia con JWT |
| Hash de contraseña | bcrypt |
| Hosting | Vercel |
| Almacenamiento temporal (mock) | Archivo JSON o localStorage del lado servidor (no persistente) |

---

*Documento generado como parte de la planeación del sitio web de la Secretaría de Turismo del Estado de Puebla — módulo de gestión documental oculta.*
