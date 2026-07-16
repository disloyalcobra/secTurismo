# 🏛️ Portal Web Institucional — Secretaría de Turismo

> **Gobierno del Estado de Puebla**  
> *Hacer historia. Hacer futuro.*

Sistema web gubernamental informativo y de gestión documental para la Secretaría de Turismo del Estado de Puebla, México.

---

## 🎨 Identidad Visual

Paleta basada en la identidad gráfica oficial del Gobierno del Estado de Puebla (2019–2024).

| Elemento | HEX | Uso Principal |
|---|---|---|
| **Guinda Institucional** | `#7D1035` | Navbar, encabezados, botones primarios, acentos principales |
| **Guinda Oscuro** | `#5A0A26` | Hover de botones, subencabezados, bordes activos |
| **Beige / Arena** | `#D9D3C7` | Fondos de sección alternados, separadores, badges neutros |
| **Blanco Roto** | `#F5F2EE` | Fondo principal de página, tarjetas, contenedores |
| **Blanco Puro** | `#FFFFFF` | Texto sobre fondos guinda, fondos de modales |
| **Texto Oscuro** | `#1A1A1A` | Cuerpo de texto principal |
| **Gris Medio** | `#555555` | Texto secundario, etiquetas, metadata |

---

## 📐 Arquitectura del Sistema

```
Portal Turismo Puebla
├── Sitio Público (portal informativo)
│   ├── Inicio
│   ├── Quiénes Somos
│   ├── Directorio
│   ├── Normatividad y Comités
│   ├── Planes Institucionales
│   ├── Control Interno  ← botón destacado
│   └── Comité de Ética  ← botón destacado
│
└── Panel de Administración (ruta oculta /admin)
    ├── Gestión de Contenidos
    ├── Gestión de Carrusel
    ├── Gestión de Directorio
    ├── Gestión de Documentos PDF
    ├── Gestión de Enlaces Externos
    ├── Gestión de Noticias
    ├── Gestión de Galería
    └── Configuración General
```

---

## 🗺️ Navegación y Estructura de Páginas

### Menú Principal

| Sección | Descripción | Tipo |
|---|---|---|
| **Inicio** | Carrusel, noticias destacadas y accesos rápidos | Dinámica |
| **Quiénes Somos** | Misión, visión, organigrama, historia | Estática / Editable |
| **Directorio** | Personal directivo y operativo con datos de contacto | Dinámica |
| **Normatividad y Comités** | Marco legal, reglamentos, acuerdos | Dinámica |
| **Planes Institucionales** | Programas sectoriales, planes de trabajo, indicadores | Dinámica |

### Botones de Acceso Rápido

Ubicados en la sección principal del `Inicio`, con estilo visual destacado en guinda institucional `#7D1035`.

| Botón | Destino | Contenido |
|---|---|---|
| 🔴 **Control Interno** | `/control-interno` | Directorio de documentos PDF y enlaces externos clasificados por categoría |
| 🔴 **Comité de Ética** | `/comite-etica` | Integrantes, convocatorias, actas y documentos normativos del comité |

---

## 🗄️ Modelo de Datos

### Contenidos del Sitio

#### `Carrusel`
Diapositivas del carrusel en la página de inicio.

| Campo | Tipo | Descripción |
|---|---|---|
| `idSlide` | INT (PK) | Identificador único |
| `titulo` | VARCHAR(100) | Título de la diapositiva |
| `descripcion` | TEXT | Texto descriptivo |
| `urlImagen` | VARCHAR(255) | Ruta de la imagen subida |
| `urlEnlace` | VARCHAR(255) | Enlace del botón de acción (opcional) |
| `textoBoton` | VARCHAR(50) | Etiqueta del botón (opcional) |
| `orden` | INT | Posición en el carrusel |
| `activo` | BOOL | Visibilidad en el portal público |

#### `Paginas`
Contenido editable de las secciones estáticas del portal.

| Campo | Tipo | Descripción |
|---|---|---|
| `idPagina` | INT (PK) | Identificador único |
| `slug` | VARCHAR(50) | Identificador URL (`quienes-somos`, `inicio`, etc.) |
| `titulo` | VARCHAR(100) | Título visible de la sección |
| `contenido` | TEXT | Cuerpo HTML/Markdown editable |
| `ultimaActualizacion` | DATETIME | Última modificación |

#### `Noticias`
Comunicados y novedades institucionales.

| Campo | Tipo | Descripción |
|---|---|---|
| `idNoticia` | INT (PK) | Identificador único |
| `titulo` | VARCHAR(150) | Título del comunicado |
| `resumen` | TEXT | Extracto para tarjeta en inicio |
| `contenido` | TEXT | Cuerpo completo |
| `urlImagenPortada` | VARCHAR(255) | Imagen principal |
| `fechaPublicacion` | DATE | Fecha de publicación |
| `activo` | BOOL | Publicado / no publicado |

---

### Directorio

#### `Directorio`
Personal de la Secretaría de Turismo.

| Campo | Tipo | Descripción |
|---|---|---|
| `idPersonal` | INT (PK) | Identificador único |
| `nombre` | VARCHAR(30) | Nombre(s) |
| `apellidoPaterno` | VARCHAR(20) | Apellido paterno |
| `apellidoMaterno` | VARCHAR(20) | Apellido materno |
| `cargo` | VARCHAR(80) | Cargo o puesto |
| `area` | VARCHAR(80) | Dirección o área de adscripción |
| `correo` | VARCHAR(80) | Correo electrónico institucional |
| `telefono` | VARCHAR(15) | Teléfono de contacto |
| `extension` | VARCHAR(6) | Extensión telefónica |
| `activo` | BOOL | Aparece en el directorio público |

---

### Documentos

#### `CategoriaDocumento`
Clasificación de documentos por sección.

| Campo | Tipo | Descripción |
|---|---|---|
| `idCategoria` | INT (PK) | Identificador único |
| `nombreCategoria` | VARCHAR(60) | Nombre de la categoría |
| `seccion` | VARCHAR(30) | Sección destino: `control-interno`, `normatividad`, `planes`, `comite-etica` |

#### `Documentos`
Archivos PDF y enlaces a documentos externos.

| Campo | Tipo | Descripción |
|---|---|---|
| `idDocumento` | INT (PK) | Identificador único |
| `nombre` | VARCHAR(150) | Nombre descriptivo del documento |
| `idCategoria` | INT (FK) | → `CategoriaDocumento` |
| `tipo` | ENUM | `pdf` — archivo subido / `enlace` — URL externa |
| `rutaArchivo` | VARCHAR(255) | Ruta del PDF en el servidor (si `tipo = pdf`) |
| `urlExterna` | VARCHAR(255) | URL del documento externo (si `tipo = enlace`) |
| `fechaSubida` | DATETIME | Fecha de carga al sistema |
| `activo` | BOOL | Visibilidad en el portal |

---

### Galería

#### `Galeria`
Imágenes de eventos, destinos y actividades de la Secretaría.

| Campo | Tipo | Descripción |
|---|---|---|
| `idImagen` | INT (PK) | Identificador único |
| `titulo` | VARCHAR(100) | Descripción de la imagen |
| `urlImagen` | VARCHAR(255) | Ruta del archivo de imagen |
| `album` | VARCHAR(60) | Agrupación temática (opcional) |
| `fechaEvento` | DATE | Fecha del evento fotografiado |
| `activo` | BOOL | Visibilidad en la galería pública |

---

### Administración

#### `Usuarios`
Cuentas de acceso al panel de administración.

| Campo | Tipo | Descripción |
|---|---|---|
| `idUsuario` | INT (PK) | Identificador único |
| `nombreUsuario` | VARCHAR(40) | Nombre completo |
| `email` | VARCHAR(80) | Correo de acceso |
| `passwordHash` | VARCHAR(255) | Contraseña hasheada (bcrypt/Argon2) |
| `rol` | ENUM | `admin` |
| `activo` | BOOL | Cuenta habilitada |
| `ultimoAcceso` | DATETIME | Último inicio de sesión registrado |

#### `BitacoraAdmin`
Auditoría de acciones realizadas en el panel.

| Campo | Tipo | Descripción |
|---|---|---|
| `idRegistro` | INT (PK) | Identificador único |
| `idUsuario` | INT (FK) | → `Usuarios` |
| `accion` | VARCHAR(100) | Descripción de la acción (`Subió PDF`, `Editó directorio`, etc.) |
| `entidadAfectada` | VARCHAR(50) | Tabla o módulo modificado |
| `fecha` | DATETIME | Fecha y hora exacta de la acción |
| `ip` | VARCHAR(45) | Dirección IP del administrador |

---

## 🗺️ Diagrama de Relaciones

```
Usuarios ──────────────────────────────► BitacoraAdmin

CategoriaDocumento ────────────────────► Documentos
                                          (PDF o enlace externo)
                                          └── seccion: control-interno
                                          └── seccion: normatividad
                                          └── seccion: planes
                                          └── seccion: comite-etica

Carrusel ──► Inicio (componente visual)
Noticias ──► Inicio (tarjetas destacadas)
Galeria  ──► Inicio + Secciones

Paginas (slug) ──► Renderizado de cada ruta pública
Directorio     ──► /directorio (tabla pública)
```

---

## 📱 Módulos del Sistema

### 1. 🏠 Inicio
- Carrusel de hasta 5 diapositivas con imagen, título, descripción y botón de acción.
- Presentación institucional de la Secretaría.
- Tarjetas de las 3 últimas noticias publicadas.
- **Botones destacados:** Control Interno y Comité de Ética (color `#7D1035`).
- Galería fotográfica con efecto lightbox.
- Pie de página con datos de contacto, redes sociales y enlace a aviso de privacidad.

### 2. 🏛️ Quiénes Somos
- Misión y visión institucional.
- Objetivos estratégicos.
- Organigrama de la Secretaría.
- Historia de la dependencia.
- Mensaje del titular (fotografía y texto editable desde Admin).

### 3. 📋 Directorio
- Tabla con nombre, cargo, área, correo y teléfono de cada servidor público.
- Buscador por nombre o área.
- Filtro por dirección.
- Administrable desde el panel Admin.

### 4. ⚖️ Normatividad y Comités
- Marco normativo aplicable (leyes, reglamentos, acuerdos).
- Documentos en PDF descargables o con enlace externo.
- Información del Comité de Ética e Integridad.
- Convocatorias y actas del comité.

### 5. 📊 Planes Institucionales
- Plan Estatal de Desarrollo — sector turismo.
- Programa Sectorial de Turismo.
- Planes anuales de trabajo.
- Indicadores de desempeño.
- Informes de avance descargables.

### 6. 🔒 Control Interno
Accesible desde el **botón destacado** en Inicio.

- Directorio de documentos clasificados por categoría.
- Cada documento muestra: nombre, categoría, fecha y botón de descarga o enlace.
- Buscador por nombre y filtro por categoría.
- Administrable desde el panel: subir PDFs o agregar URLs externas.

**Categorías de documentos:**

| Categoría | Descripción |
|---|---|
| Informes de Auditoría Interna | Resultados de auditorías del Órgano Interno de Control |
| Plan Anual de Trabajo OIC | Programas del Órgano Interno de Control |
| Actas de Reuniones | Minutas y acuerdos de sesiones |
| Procedimientos y Manuales | Manuales operativos y administrativos |
| Seguimiento de Observaciones | Avances en atención de recomendaciones |
| Normatividad Interna | Circulares, lineamientos y disposiciones |

### 7. 🤝 Comité de Ética
Accesible desde el **botón destacado** en Inicio.

- Integrantes del Comité de Ética e Integridad Institucional.
- Convocatorias y resultados de elecciones del comité.
- Actas de sesiones ordinarias y extraordinarias.
- Documentos normativos del comité (Código de Ética, Código de Conducta).

### 8. ⚙️ Panel de Administración
Accesible únicamente desde la **ruta oculta** `/admin`, no indexada ni enlazada públicamente.

| Módulo | Acciones |
|---|---|
| **Carrusel** | Subir, eliminar y reordenar imágenes; editar título, descripción y enlace |
| **Contenidos** | Editar texto de todas las secciones (Quiénes Somos, Inicio, etc.) |
| **Directorio** | Agregar, editar y eliminar entradas del directorio de personal |
| **Documentos PDF** | Subir archivos PDF y asignarlos a una sección y categoría |
| **Enlaces Externos** | Agregar URLs externas y asignarlas a una sección y categoría |
| **Noticias** | Publicar, editar y archivar comunicados institucionales |
| **Galería** | Subir y eliminar imágenes; organizar por álbum |
| **Configuración** | Editar datos de contacto, redes sociales, logotipos y metadatos SEO |
| **Bitácora** | Consultar historial de acciones por usuario, fecha y entidad modificada |

---

## 🔄 Flujos Principales

### Flujo: Publicar un Documento en Control Interno

```
1. Admin accede a /admin
   └─ Autenticación con usuario y contraseña

2. Navega a Módulo → Documentos

3. Selecciona tipo:
   ├─ "Subir PDF"  → carga archivo desde dispositivo, asigna nombre y categoría
   └─ "Agregar enlace" → ingresa URL externa, nombre y categoría

4. Asigna la sección destino:
   └─ "control-interno"

5. El documento aparece automáticamente en /control-interno
   └─ Se registra en BitacoraAdmin
```

### Flujo: Actualizar el Carrusel de Inicio

```
1. Admin accede a /admin → Carrusel

2. Sube imagen (JPG/PNG, máx. 5 MB)

3. Completa: título, descripción, texto del botón, URL de destino

4. Define el orden de aparición

5. Activa el slide
   └─ Se muestra de inmediato en la página de Inicio
   └─ Se registra en BitacoraAdmin
```

---

## 🛡️ Seguridad

### Portal Público
- Certificado SSL/TLS con renovación automática (HTTPS obligatorio).
- Cabeceras HTTP de seguridad: `CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`.
- Sanitización de inputs para prevenir XSS e inyección SQL.
- Rate limiting en endpoints de la API.
- Validación de tipo y tamaño de archivos en la carga de PDFs.

### Panel de Administración
- URL no indexada: directiva `noindex` y regla en `robots.txt`.
- Contraseña hasheada con **bcrypt** o **Argon2**.
- Sesión con **JWT**, expiración automática a los 30 minutos de inactividad.
- Bloqueo de cuenta tras **5 intentos fallidos** de acceso.
- Registro completo de actividad en `BitacoraAdmin`.
- Posibilidad de habilitar **2FA** como mejora futura.

### Gestión de Archivos
- PDFs almacenados fuera del directorio web raíz.
- Validación de MIME type y extensión al momento de la carga.
- Nomenclatura de archivos sanitizada (sin path traversal).
- Límite de tamaño por archivo: **20 MB**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| **Frontend** | Next.js / React | SSR para SEO gubernamental, escalabilidad |
| **Estilos** | Tailwind CSS | Diseño responsivo consistente con la paleta guinda |
| **Backend / API** | Next.js API Routes | Integración total con el frontend |
| **Base de Datos** | PostgreSQL | Robusta, relacional, estándar gubernamental |
| **Almacenamiento** | Sistema de archivos del servidor o compatible S3 | Gestión segura de PDFs e imágenes |
| **Autenticación** | JWT + bcrypt / NextAuth | Estándar seguro para panel Admin |
| **Servidor Web** | Nginx + PM2 | Alta disponibilidad y manejo de procesos |
| **Despliegue** | VPS gubernamental o Vercel (producción) | Soberanía de datos o despliegue rápido |

### Requerimientos de Infraestructura
- Servidor dedicado o VPS: mínimo **4 GB RAM**, 2 vCPU, **50 GB SSD**.
- Sistema operativo: **Ubuntu Server 22.04 LTS**.
- Dominio institucional: `turismo.puebla.gob.mx` (o subdominio asignado).
- Respaldos automáticos diarios de base de datos y archivos.

### Accesibilidad y SEO
- Cumplimiento **WCAG 2.1 nivel AA**.
- Diseño 100% responsivo (mobile-first).
- Tiempo de carga menor a **3 segundos** en conexión promedio.
- Metadatos SEO editables desde panel Admin.
- Mapa del sitio XML generado automáticamente (`sitemap.xml`).
- Panel Admin excluido de indexación (`noindex`, `robots.txt`).

---

## 📅 Plan de Desarrollo

| Fase | Actividades | Entregables | Duración |
|---|---|---|---|
| **1 — Análisis** | Levantamiento de requerimientos, revisión de identidad gráfica, definición de arquitectura | Documento de requerimientos, wireframes, arquitectura de navegación | 2 semanas |
| **2 — Diseño UI/UX** | Mockups de alta fidelidad con paleta guinda/beige/blanco, validación con la dependencia | Prototipos en Figma, guía de estilo, kit de componentes | 3 semanas |
| **3 — Frontend** | Implementación del diseño: carrusel, galería, menú, secciones públicas | Portal público funcional con contenidos de prueba | 4 semanas |
| **4 — Backend** | API REST, base de datos, módulo de subida de PDFs, autenticación Admin | API funcional, panel Admin operativo | 4 semanas |
| **5 — Integración y pruebas** | Integración de módulos, pruebas de funcionalidad, carga y seguridad | Reporte de pruebas, corrección de bugs, release candidate | 2 semanas |
| **6 — Despliegue** | Configuración del servidor, SSL, dominio, carga de contenidos iniciales | Sitio en producción, documentación técnica, capacitación | 1 semana |

**Duración total estimada: 16 semanas (4 meses)**

---

## 👤 Roles del Sistema

| Rol | Acceso | Permisos |
|---|---|---|
| **Administrador** | Panel `/admin` | Gestión completa de contenidos, documentos, directorio, carrusel, galería, configuración y bitácora |
| **Público** | Portal web | Solo visualización de contenidos e información publicada |

> El acceso de visitante no requiere autenticación. El único rol con sesión activa es el **Administrador**.

---

## 📋 Referencias Normativas

- Ley de Transparencia y Acceso a la Información Pública del Estado de Puebla.
- Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados.
- Lineamientos Técnicos de Seguridad de la Información — Gobierno del Estado de Puebla.
- Guía de Identidad Gráfica Institucional — Gobierno del Estado de Puebla 2019–2024.
- WCAG 2.1: Web Content Accessibility Guidelines (W3C).

---

## 🗂️ Glosario

| Término | Definición |
|---|---|
| **Ruta oculta** | URL no enlazada públicamente ni indexada por motores de búsqueda (`/admin`) |
| **JWT** | JSON Web Token — estándar para autenticación segura en aplicaciones web |
| **PDF** | Portable Document Format — formato de documento digital estándar |
| **SSL/TLS** | Protocolo de cifrado de comunicación entre navegador y servidor |
| **Carrusel** | Componente visual que presenta imágenes deslizables en la página de inicio |
| **Lightbox** | Efecto visual que muestra imágenes ampliadas sobre un fondo oscuro |
| **SSR** | Server-Side Rendering — renderizado en servidor para mejor SEO |
| **WCAG** | Web Content Accessibility Guidelines — estándares de accesibilidad web |
| **noindex** | Directiva HTML que impide la indexación de una página por buscadores |
| **Bitácora** | Registro de auditoría de acciones realizadas por el administrador |
| **OIC** | Órgano Interno de Control |
| **2FA** | Autenticación de dos factores |

---

*Portal Web Institucional — Secretaría de Turismo del Estado de Puebla*  
*Documento de Especificación del Sistema v1.0*  
*Gobierno del Estado de Puebla — Hacer historia. Hacer futuro.*
