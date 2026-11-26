
# MiniAula Primaria

Proyecto final de Ingeniería Web 2.

## Integrantes
- Andrea Sanchez Rivero
- Ana Cristina Vaca 

## Descripción
MiniAula Primaria es una plataforma educativa que permite
a docentes crear cursos, lecciones y cuestionarios.

Los estudiantes pueden inscribirse, completar lecciones,
resolver evaluaciones y consultar su progreso.

## Tecnologías
- Backend: Node.js + Express
- Frontend: React + Vite
- Base de datos: MySQL + Sequelize
- API REST
- Docker
- Git y GitHub

## Estructura
- api/: Backend
- web/: Frontend

## Estado
Proyecto en desarrollo.

## Docker

### Requisitos

- Docker Desktop iniciado.
- No es necesario instalar Node.js, pnpm ni MySQL en Windows.
- No se publica el puerto 3306 de MySQL: el contenedor `db` solo es accesible desde la red interna de Docker.

### Configuración inicial (una sola vez)

Copia la plantilla de variables y edita los secretos:

```powershell
Copy-Item .env.example .env
notepad .env
```

Variables obligatorias:

- `DB_PASSWORD`: contraseña del usuario de aplicación `miniaula_app`.
- `MYSQL_ROOT_PASSWORD`: contraseña de root **dentro del contenedor**.
- `JWT_SECRET`: secreto largo y aleatorio para firmar los tokens.

Puedes generar un valor para `JWT_SECRET` desde PowerShell:

```powershell
$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[BitConverter]::ToString($bytes).Replace('-', '')
```

No modifiques `api/.env`: se usa para desarrollo local fuera de Docker. Compose no lo copia a la imagen.

Si cambias `DB_PASSWORD` o `MYSQL_ROOT_PASSWORD` después de la primera inicialización del volumen, MySQL conserva las contraseñas anteriores; actualiza los usuarios dentro del contenedor o usa los valores definitivos antes del primer arranque.

### Levantar el proyecto

El comando correcto es `-d` (o `--detach`); `docker compose up --d` no es válido:

```powershell
docker compose config
docker compose up --build -d
docker compose ps
```

También funciona:

```powershell
docker compose up --build
```

Servicios resultantes:

- Frontend: http://localhost:8080
- API: http://localhost:3000/api/health
- MySQL: contenedor `miniaula-db`, red interna `miniaula-net`

### Migraciones

Las migraciones se ejecutan automáticamente cuando la API arranca. El entrypoint espera a que MySQL pase su healthcheck y luego ejecuta `db:migrate`; si lo reinicias, Sequelize vuelve a aplicar solo las pendientes.

Para ejecutarlas manualmente:

```powershell
docker compose exec -w /app/api api npm run db:migrate
docker compose exec -w /app/api api npm run db:migrate:status
```

No se usa `sequelize.sync({ force: true })` y no se ejecutan migraciones `down` ni SQL destructivo de forma automática.

### Datos iniciales

`api/seeders/miniaula-datos.sql` es un dump antiguo que contiene `DROP TABLE IF EXISTS`. **No se carga automáticamente** porque borraría los datos del volumen Docker.

Forma recomendada: registrar usuarios, cursos y lecciones desde la propia aplicación.

Si necesitas importar el dump para una demostración, hazlo **solo en un volumen Docker nuevo y vacío**, nunca sobre tu MySQL de Windows ni sobre datos existentes:

```powershell
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -u root "$MYSQL_DATABASE"' < api/seeders/miniaula-datos.sql
```

Después de importar el dump, vuelve a ejecutar las migraciones para añadir columnas posteriores como `videoPath`:

```powershell
docker compose exec -w /app/api api npm run db:migrate
```

### Videos

Los videos se guardan en el volumen persistente `miniaula_video_data`, montado en `/app/api/uploads/videos`. No se incluyen en la imagen ni en el repositorio; se conserva `api/uploads/videos/.gitkeep`.

Para copiar un video local ya existente al volumen Docker:

```powershell
docker cp "api/uploads/videos/nombre.mp4" miniaula-api:/app/api/uploads/videos/
```

### Persistencia y apagado

Para detener y volver a iniciar conservando base de datos y videos:

```powershell
docker compose stop
docker compose start
```

Para bajar los contenedores sin borrar volúmenes:

```powershell
docker compose down
```

No ejecutes `docker compose down -v`: eliminaría los volúmenes de MySQL y videos.

### Comprobaciones

```powershell
docker compose ps
docker compose logs -f db
docker compose logs -f api
docker compose exec db mysqladmin ping -h 127.0.0.1 --silent
Invoke-WebRequest http://localhost:3000/api/health
Invoke-WebRequest http://localhost:8080
```

Si el puerto 3000 u 8080 está ocupado, cambia `PORT` o `WEB_PORT` en `.env` y vuelve a levantar con `docker compose up --build -d`. Si usas `http://127.0.0.1:8080` en lugar de `localhost`, ajusta `WEB_ORIGIN` a `http://127.0.0.1:8080`.

### Variables de entorno

| Variable | Uso | Valor por defecto |
| --- | --- | --- |
| `DB_NAME` | Base de datos de MySQL | `miniaula` |
| `DB_USER` | Usuario de aplicación | `miniaula_app` |
| `DB_PASSWORD` | Contraseña de aplicación | obligatoria |
| `MYSQL_ROOT_PASSWORD` | Contraseña root del contenedor | obligatoria |
| `JWT_SECRET` | Firma de tokens JWT | obligatoria |
| `JWT_EXPIRES_IN` | Duración del token | `2h` |
| `PORT` | Puerto de la API | `3000` |
| `WEB_PORT` | Puerto del frontend | `8080` |
| `NODE_ENV` | Entorno de Node | `production` |
| `TRUST_PROXY` | Confía en el proxy de Nginx para `express-rate-limit` | `1` |
| `VITE_API_URL` | Base de la API en el build de Vite | `/api` |
| `WEB_ORIGIN` | Origen permitido por CORS | `http://localhost:8080` |
| `VIDEO_UPLOAD_DIR` | Carpeta de videos en la API | `uploads/videos` |
| `VIDEO_MAX_SIZE_MB` | Tamaño máximo de video | `100` |

`VITE_API_URL` se usa durante `vite build` (build-arg), no en tiempo de ejecución de Nginx.
