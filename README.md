# Módulo de Gestión de Incidencias

Sistema web elegante y funcional para registrar y gestionar tickets de soporte técnico, controlando su estado y prioridad. Diseñado para el equipo de soporte de Kódigo Fuente.

## Características Principales

- **Gestión Completa de Tickets**: Crear, listar, editar y eliminar tickets de soporte
- **Control de Estados**: Flujo lineal de estados (Abierto → En progreso → Resuelto)
- **Priorización**: Cuatro niveles de prioridad (Bajo, Medio, Alto, Crítico)
- **Asignación de Agentes**: Asignar tickets a agentes de soporte específicos
- **Filtros Avanzados**: Filtrar por estado, prioridad y cliente
- **Resumen Estadístico**: Vista de contadores por estado
- **Interfaz Elegante**: Diseño profesional con tema claro y responsivo
- **Autenticación Segura**: Integración con Manus OAuth
- **Validaciones Robustas**: Validación de datos en frontend y backend

## Requisitos Previos

- Docker y Docker Compose instalados
- Node.js 22+ (para desarrollo local sin Docker)
- pnpm (para desarrollo local)
- Git

## Instalación Rápida con Docker

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/modulo-gestion-incidencias.git
cd modulo-gestion-incidencias
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y actualiza los valores necesarios:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Database
DB_NAME=tickets_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=5432

# Ports
BACKEND_PORT=3000
FRONTEND_PORT=80

# OAuth (obtén estos valores de Manus)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

# Owner info
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name

# API Keys
JWT_SECRET=your-secret-key-change-in-production
BUILT_IN_FORGE_API_KEY=your-key
VITE_FRONTEND_FORGE_API_KEY=your-key
```

### 3. Levantar los servicios

```bash
docker-compose up -d
```

Esto iniciará:
- **PostgreSQL** en puerto 5432
- **Backend API** en puerto 3000
- **Frontend** en puerto 80

### 4. Acceder a la aplicación

Abre tu navegador y ve a:
- **Frontend**: `http://localhost`
- **Backend API**: `http://localhost:3000/api/trpc`

## Desarrollo Local

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar base de datos

```bash
# Generar migraciones
pnpm drizzle-kit generate

# Aplicar migraciones (requiere base de datos ejecutándose)
pnpm drizzle-kit migrate
```

### 3. Iniciar servidor de desarrollo

```bash
# Terminal 1: Backend
pnpm run dev

# Terminal 2: Frontend (en otra terminal)
cd client
pnpm run dev
```

El servidor estará disponible en `http://localhost:5173` (frontend) y `http://localhost:3000` (backend).

## Estructura del Proyecto

```
modulo-gestion-incidencias/
├── client/                      # Frontend React + Vite
│   ├── src/
│   │   ├── pages/              # Páginas principales
│   │   │   ├── TicketsPage.tsx # Página principal de tickets
│   │   │   ├── Home.tsx        # Página de inicio (redirección)
│   │   │   └── NotFound.tsx    # Página 404
│   │   ├── components/
│   │   │   ├── tickets/        # Componentes de tickets
│   │   │   │   ├── TicketForm.tsx
│   │   │   │   ├── TicketTable.tsx
│   │   │   │   ├── TicketDetail.tsx
│   │   │   │   ├── TicketSummary.tsx
│   │   │   │   └── TicketFilters.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ui/             # Componentes shadcn/ui
│   │   ├── lib/
│   │   │   └── trpc.ts         # Configuración de tRPC
│   │   └── index.css           # Estilos globales
│   └── index.html
├── server/                      # Backend Node.js + Express
│   ├── routers.ts              # Procedimientos tRPC
│   ├── db.ts                   # Funciones de base de datos
│   └── _core/                  # Configuración y middleware
├── drizzle/                     # Esquema y migraciones
│   ├── schema.ts               # Definición de tablas
│   └── migrations/             # Archivos SQL de migraciones
├── shared/                      # Código compartido
│   ├── types.ts                # Tipos compartidos
│   └── const.ts                # Constantes
├── Dockerfile.backend          # Imagen Docker del backend
├── Dockerfile.frontend         # Imagen Docker del frontend
├── docker-compose.yml          # Configuración de servicios
├── nginx.conf                  # Configuración de nginx
├── .github/workflows/
│   └── ci-cd.yml              # Pipeline de GitHub Actions
├── DECISIONS.md                # Decisiones tecnológicas
└── README.md                   # Este archivo
```

## Flujo de Trabajo de Tickets

### Estados de Ticket

1. **Abierto**: Ticket recién creado, pendiente de atención
2. **En progreso**: Ticket siendo atendido por un agente
3. **Resuelto**: Ticket completado, no puede ser modificado

### Prioridades

- **Bajo**: Problemas menores, sin impacto inmediato
- **Medio**: Problemas moderados, afectan funcionalidad
- **Alto**: Problemas graves, afectan múltiples usuarios
- **Crítico**: Problemas críticos, sistema caído o datos en riesgo

### Restricciones

- Solo se pueden eliminar tickets en estado **Abierto**
- Tickets en estado **Resuelto** son de solo lectura
- El flujo de estados es lineal (no se puede retroceder)
- Los campos título, cliente y prioridad son obligatorios

## Pruebas

### Ejecutar pruebas unitarias

```bash
pnpm test
```

### Ejecutar pruebas con cobertura

```bash
pnpm test -- --coverage
```

### Pruebas incluidas

- Creación de tickets con validaciones
- Cambio de estado con restricciones
- Eliminación de tickets
- Cálculo de resumen de estados

## Linting y Formateo

```bash
# Verificar formato
pnpm run format --check

# Formatear código
pnpm run format

# Type checking
pnpm run check
```

## Build para Producción

### Con Docker Compose

```bash
docker-compose build
docker-compose up -d
```

### Build manual

```bash
# Build frontend
pnpm run build

# Build backend
pnpm run build

# Iniciar servidor
pnpm run start
```

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a base de datos | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `your-secret-key` |
| `VITE_APP_ID` | ID de aplicación Manus OAuth | `app-id-xxx` |
| `OAUTH_SERVER_URL` | URL del servidor OAuth | `https://api.manus.im` |
| `OWNER_OPEN_ID` | OpenID del propietario | `owner-id-xxx` |
| `OWNER_NAME` | Nombre del propietario | `John Doe` |
| `NODE_ENV` | Entorno de ejecución | `production` o `development` |

## Deployment

### GitHub Pages / Vercel / Netlify

El frontend puede ser desplegado en cualquier servicio de hosting estático. El backend requiere un servidor Node.js.

### Opciones recomendadas

1. **Railway**: Soporte nativo para Docker Compose
2. **Render**: Despliegue simple de contenedores
3. **AWS ECS**: Para aplicaciones a escala empresarial
4. **DigitalOcean App Platform**: Solución simple y asequible

## Solución de Problemas

### Error: "Cannot connect to database"

Verifica que PostgreSQL está corriendo y que `DATABASE_URL` es correcto:

```bash
docker-compose ps
```

### Error: "Missing session cookie"

Esto es normal en desarrollo. Asegúrate de estar autenticado a través de Manus OAuth.

### Error: "Port already in use"

Cambia los puertos en `.env`:

```env
BACKEND_PORT=3001
FRONTEND_PORT=8080
```

### Limpiar datos de desarrollo

```bash
# Detener servicios
docker-compose down

# Eliminar volúmenes (borra base de datos)
docker-compose down -v

# Reiniciar
docker-compose up -d
```

## Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

## Contacto

Para preguntas o soporte, contacta al equipo de desarrollo de Kódigo Fuente.

## Roadmap Futuro

- [ ] Búsqueda de texto completo en tickets
- [ ] Exportación de tickets a PDF/CSV
- [ ] Notificaciones en tiempo real
- [ ] Historial de cambios en tickets
- [ ] Comentarios y notas en tickets
- [ ] Métricas y reportes avanzados
- [ ] Integración con sistemas de ticketing externos
- [ ] API pública para integraciones

---

**Última actualización**: Mayo 2026  
**Versión**: 1.0.0
