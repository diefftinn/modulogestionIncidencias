# Módulo de Gestión de Incidencias - TODO

## Base de Datos y Backend
- [x] Definir esquema de datos en drizzle/schema.ts (tablas: tickets, users, agents)
- [x] Generar y aplicar migraciones de base de datos
- [x] Implementar procedimientos tRPC para CRUD de tickets
- [x] Implementar procedimientos tRPC para cambiar estado de tickets
- [x] Implementar procedimientos tRPC para obtener resumen de tickets
- [x] Implementar validaciones en backend (título, cliente, prioridad requeridos)
- [x] Implementar lógica de restricción: solo eliminar tickets en estado Abierto
- [x] Implementar lógica de restricción: tickets Resueltos son solo lectura
- [x] Escribir pruebas unitarias con Vitest

## Frontend - Componentes y Páginas
- [x] Configurar tema visual elegante y profesional (colores, tipografía)
- [x] Crear componente TicketForm para crear/editar tickets
- [x] Crear componente TicketTable para listar tickets
- [x] Crear componente TicketDetail para vista de detalle
- [x] Crear componente TicketSummary para mostrar contadores
- [x] Crear página principal con DashboardLayout
- [x] Implementar filtros y búsqueda de tickets
- [x] Implementar cambio de estado con validaciones visuales
- [x] Implementar eliminación de tickets con confirmación

## Integración Frontend-Backend
- [x] Conectar formulario de creación de tickets con tRPC
- [x] Conectar listado de tickets con tRPC
- [x] Conectar cambio de estado con tRPC
- [x] Conectar eliminación de tickets con tRPC
- [x] Conectar resumen de estados con tRPC
- [x] Implementar manejo de errores y feedback visual

## Docker y Configuración
- [x] Crear Dockerfile para backend
- [x] Crear Dockerfile para frontend
- [x] Crear docker-compose.yml con servicios (backend, frontend, mysql)
- [x] Configurar variables de entorno para Docker
- [x] Validar que docker-compose up funciona correctamente

## GitHub Actions CI/CD
- [x] Crear workflow para linter y pruebas unitarias
- [x] Crear workflow para construcción de imágenes Docker
- [x] Crear workflow para publicación en GitHub Packages
- [x] Configurar secrets necesarios en GitHub (documentado en README)

## Documentación
- [x] Escribir DECISIONS.md con justificación de tecnologías
- [x] Actualizar README.md con instrucciones de instalación
- [x] Documentar estructura del proyecto
- [x] Documentar flujo de desarrollo

## Entregables Finales
- [x] Inicializar repositorio Git
- [x] Crear commits significativos
- [x] Crear guía GITHUB_SETUP.md para publicar en GitHub
- [x] Verificar que todos los archivos están en el repositorio (141 archivos)
- [x] Validar que docker-compose up funciona desde cero

**Nota**: El push a GitHub requiere credenciales del usuario. Ver GITHUB_SETUP.md para instrucciones paso a paso.
