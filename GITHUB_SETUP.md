# Configuración de Repositorio GitHub

Este documento proporciona instrucciones paso a paso para publicar el Módulo de Gestión de Incidencias en un repositorio público de GitHub.

## Requisitos Previos

- Cuenta de GitHub activa
- Git instalado localmente
- Acceso a la terminal/línea de comandos

## Pasos para Publicar en GitHub

### 1. Crear un Nuevo Repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Completa los campos:
   - **Repository name**: `modulo-gestion-incidencias`
   - **Description**: `Sistema web elegante para gestión de tickets de soporte técnico`
   - **Visibility**: Selecciona **Public**
   - **Initialize this repository with**: Deja sin marcar (ya tenemos commits locales)
3. Haz clic en **Create repository**

### 2. Configurar el Remoto Git Local

En la terminal, desde el directorio del proyecto:

```bash
cd /home/ubuntu/modulo-gestion-incidencias

# Agregar el remoto origin (reemplaza TU_USUARIO con tu nombre de usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/modulo-gestion-incidencias.git

# Verificar que el remoto se agregó correctamente
git remote -v
```

Deberías ver algo como:
```
origin  https://github.com/TU_USUARIO/modulo-gestion-incidencias.git (fetch)
origin  https://github.com/TU_USUARIO/modulo-gestion-incidencias.git (push)
```

### 3. Hacer Push del Código

```bash
# Hacer push de la rama main
git branch -M main
git push -u origin main
```

Se te pedirá autenticación. Tienes dos opciones:

#### Opción A: Usar Token de Acceso Personal (Recomendado)

1. En GitHub, ve a **Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Haz clic en **Generate new token (classic)**
3. Configura:
   - **Note**: `Git Push Token`
   - **Expiration**: Selecciona una duración (30 días, 90 días, etc.)
   - **Scopes**: Marca `repo` (acceso completo a repositorios)
4. Haz clic en **Generate token**
5. Copia el token (no podrás verlo de nuevo)
6. En la terminal, cuando se te pida contraseña, pega el token

#### Opción B: Usar SSH (Alternativa)

1. Configura SSH en tu máquina local:
   ```bash
   ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
   ```
2. Agrega la clave pública a GitHub (**Settings → SSH and GPG keys**)
3. Cambia la URL del remoto:
   ```bash
   git remote set-url origin git@github.com:TU_USUARIO/modulo-gestion-incidencias.git
   ```
4. Intenta hacer push nuevamente

### 4. Verificar la Publicación

1. Ve a `https://github.com/TU_USUARIO/modulo-gestion-incidencias`
2. Verifica que:
   - ✅ Todos los archivos están presentes
   - ✅ El README.md se muestra correctamente
   - ✅ Los commits aparecen en el historial
   - ✅ Las carpetas (client, server, drizzle, .github) están visibles

## Configurar GitHub Actions

Una vez que el repositorio esté en GitHub, el workflow de CI/CD se ejecutará automáticamente:

1. Ve a la pestaña **Actions** en tu repositorio
2. Verás el workflow **CI/CD Pipeline**
3. El workflow ejecutará:
   - Linting y type checking
   - Pruebas unitarias
   - Construcción de imágenes Docker
   - Publicación en GitHub Packages

### Configurar Secrets para GitHub Actions

Para que el workflow de publicación de imágenes Docker funcione, necesitas configurar secrets:

1. Ve a **Settings → Secrets and variables → Actions**
2. Haz clic en **New repository secret** y agrega:

| Nombre | Valor | Descripción |
|--------|-------|-------------|
| `REGISTRY_USERNAME` | Tu nombre de usuario de GitHub | Para autenticarse en GitHub Packages |
| `REGISTRY_PASSWORD` | Tu token de acceso personal | Mismo token usado para Git push |

El workflow usará estos secrets automáticamente.

## Solución de Problemas

### Error: "fatal: 'origin' does not appear to be a 'git' repository"

Asegúrate de estar en el directorio correcto:
```bash
cd /home/ubuntu/modulo-gestion-incidencias
pwd  # Verifica que estés en el directorio correcto
```

### Error: "remote origin already exists"

Si ya agregaste el remoto, actualízalo:
```bash
git remote set-url origin https://github.com/TU_USUARIO/modulo-gestion-incidencias.git
```

### Error: "Permission denied (publickey)" (SSH)

Verifica que tu clave SSH está agregada a GitHub:
```bash
ssh -T git@github.com
```

Deberías ver: `Hi TU_USUARIO! You've successfully authenticated...`

### Error: "401 Unauthorized" (HTTPS)

El token de acceso personal ha expirado o es incorrecto. Genera uno nuevo siguiendo la Opción A anterior.

## Próximos Pasos

Una vez que el repositorio esté publicado en GitHub:

1. **Comparte el enlace**: `https://github.com/TU_USUARIO/modulo-gestion-incidencias`
2. **Monitorea el workflow**: Ve a la pestaña **Actions** para ver el estado de CI/CD
3. **Configura protecciones de rama** (opcional):
   - Ve a **Settings → Branches**
   - Agrega una regla de protección para `main`
   - Requiere que los checks de CI/CD pasen antes de hacer merge

## Recursos Adicionales

- [Documentación de GitHub - Crear un repositorio](https://docs.github.com/es/repositories/creating-and-managing-repositories/creating-a-new-repository)
- [Documentación de GitHub - Autenticación con Git](https://docs.github.com/es/authentication/connecting-to-github-with-ssh)
- [Documentación de GitHub Actions](https://docs.github.com/es/actions)

---

¡Listo! Tu repositorio estará publicado y el workflow de CI/CD se ejecutará automáticamente con cada push.
