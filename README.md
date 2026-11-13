# Documentación del Portal de la Secretaría de Turismo de Puebla

Portal web informativo de uso interno desarrollado como proyecto de servicio social (Universidad Madero, 2026). Centraliza el repositorio de documentos, el directorio de contactos, los carruseles e imágenes institucionales y un panel administrativo para actualizar el contenido.

Esta documentación está pensada para que la Secretaría de Turismo, o el proveedor que designe, pueda **instalar, alojar y mantener el portal sin depender de las cuentas personales del desarrollador original**.

## Contenido

| Documento | Para qué sirve |
|---|---|
| [ARQUITECTURA.md](ARQUITECTURA.md) | Tecnologías, estructura del código, modelo de datos, seguridad y API. |
| [VARIABLES_DE_ENTORNO.md](VARIABLES_DE_ENTORNO.md) | Variables que necesita la aplicación y cómo generar cada una. |
| [INSTALACION_LOCAL.md](INSTALACION_LOCAL.md) | Levantar el portal en una computadora para desarrollo o pruebas. |
| [BASE_DE_DATOS_VACIA.md](BASE_DE_DATOS_VACIA.md) | Crear la base de datos de producción vacía, con el catálogo mínimo y el primer administrador. |
| [DESPLIEGUE.md](DESPLIEGUE.md) | Opciones de alojamiento: Vercel + Turso con cuentas institucionales, servidor propio u otro proveedor. |
| [ENTREGA.md](ENTREGA.md) | Lista de verificación para la entrega-recepción del sistema. |

## Resumen rápido

- **Aplicación:** Next.js 16 (React 19, TypeScript). Es un solo proyecto que contiene el sitio público, el panel `/admin` y la API.
- **Base de datos:** SQLite/libSQL. En la nube se usa Turso, pero también funciona con un archivo SQLite local.
- **Archivos subidos desde el panel:** Vercel Blob (ver la limitación en [DESPLIEGUE.md](DESPLIEGUE.md#limitación-subida-de-archivos-y-vercel-blob)).
- **Requisito mínimo:** Node.js 20.9 o superior.
- **Repositorio del código:** https://github.com/disloyalcobra/secTurismo. Debe transferirse a una cuenta institucional; ver [ENTREGA.md](ENTREGA.md).

## Estado de la entrega

- El código se entrega tal como está en el repositorio.
- **La base de datos se entrega vacía.** Los datos de la instalación usada durante el desarrollo eran de prueba y no forman parte de la entrega. Para crear la base de producción sigue [BASE_DE_DATOS_VACIA.md](BASE_DE_DATOS_VACIA.md).
- Las cuentas de Vercel y Turso usadas durante el desarrollo son personales del prestador de servicio social y **no se transfieren**. La Secretaría debe crear las suyas o usar su propia infraestructura.
