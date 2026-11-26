## 1. Requisitos

- Node.js 24 y pnpm 11 (`npm install -g pnpm@11` si no está instalado).
- MySQL Server 8.x iniciado y MySQL Workbench.
- Git y acceso al repositorio.

## 2. Descargar e instalar

Clonar el repositorio (reemplazar `URL_DEL_REPOSITORIO` por la URL de GitHub). Desde la raíz del proyecto:

```powershell
git clone URL_DEL_REPOSITORIO
cd MiniAula
pnpm install
cd api
```

Si ya tienes el proyecto, actualiza tu copia y ejecuta `pnpm install` en la raíz. Si pnpm bloquea la compilación de `bcrypt`, ejecuta `pnpm approve-builds`, selecciona `bcrypt` y ejecuta `pnpm rebuild bcrypt`.

### Dependencias nuevas

- `multer`: recepción de archivos multimedia con `multipart/form-data`.

El resto de dependencias (`express`, `sequelize`, `mysql2`, `zod`, `jsonwebtoken`, `bcrypt`, `dotenv`, `express-rate-limit`) se instalan desde el workspace con `pnpm install`.

## 3. Crear la base de datos

En MySQL Workbench, con una cuenta administradora, ejecutar:

```sql
CREATE DATABASE IF NOT EXISTS miniaula
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'miniaula_app'@'localhost'
    IDENTIFIED BY 'TU_CLAVE_LOCAL';

GRANT ALL PRIVILEGES ON miniaula.* TO 'miniaula_app'@'localhost';
```

Reemplazar `TU_CLAVE_LOCAL` por una contraseña propia. Si el usuario ya existe, usar su contraseña actual.

## 4. Configurar el archivo .env

Desde la carpeta `api`, copiar el archivo de ejemplo (si `.env` todavía no existe):

```powershell
Copy-Item .env.example .env
```

Editar `.env` con los valores locales:

```dotenv
PORT=3000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=miniaula
DB_USER=miniaula_app
DB_PASSWORD=TU_CLAVE_LOCAL
JWT_SECRET=TU_SECRETO_ALEATORIO
JWT_EXPIRES_IN=2h
WEB_ORIGIN=http://127.0.0.1:5173
VIDEO_UPLOAD_DIR=uploads/videos
VIDEO_MAX_SIZE_MB=100
```

Generar el secreto JWT con:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Nuevas variables:

- `WEB_ORIGIN`: origen autorizado por CORS para el frontend Vite.
- `VIDEO_UPLOAD_DIR`: carpeta de videos, relativa a `api/` o absoluta. Por defecto `uploads/videos`.
- `VIDEO_MAX_SIZE_MB`: límite máximo por video. Valor inicial `100` (100 MB).

No subir `.env` a GitHub ni usar contraseñas, tokens ni credenciales personales.

## 5. Configuración de almacenamiento de videos

- Los videos se guardan en `api/uploads/videos`.
- Se aceptan MP4, WebM y MOV.
- Se validan extensión, tipo MIME y cabecera binaria del archivo; un PDF renombrado es rechazado.
- Los nombres se generan con UUID y se limpian para evitar rutas peligrosas.
- El límite inicial es 100 MB y se configura con `VIDEO_MAX_SIZE_MB`.
- La ruta HTTP protegida es `GET /api/videos/:archivo` y requiere JWT; el instructor propietario y el estudiante con acceso secuencial pueden reproducir el archivo.
- `lecciones.videoUrl` se conserva como columna legacy para no perder datos antiguos. La API no lo expone ni el reproductor lo usa. Los videos nuevos se guardan en `lecciones.videoPath` como ruta relativa `videos/<nombre>`.

## 6. Ejecutar las migraciones

Desde `api`:

```powershell
pnpm db:migrate
```

O de forma explícita:

```powershell
pnpm exec sequelize db:migrate --config src/config/database.cli.cjs --migrations-path migrations
```

Las migraciones nuevas son:

- `20261124000100-add-video-path-lecciones.js`: agrega `videoPath` sin borrar `videoUrl`.
- `20261124000200-create-inscripciones.js`: crea inscripciones con restricción única por estudiante y curso.
- `20261124000300-create-progresos.js`: crea progresos con restricción única por estudiante y lección.

Para conocer el estado: `pnpm db:migrate:status`.

## 7. Arrancar la API

Desde `api`:

```powershell
pnpm dev
```

O para producción local:

```powershell
pnpm start
```

Comprobar:

- `GET http://127.0.0.1:3000/api/health` — `200 OK`.
- `GET http://127.0.0.1:3000/api/cursos` — catálogo público.

Desde la raíz también funcionan `pnpm dev:api` y `pnpm start:api`.

## 8. Datos de prueba y Postman

`seeders/miniaula-datos.sql` contiene usuarios, cursos y lecciones de prueba. Los enlaces externos presentes en `videoUrl` son solo legacy y no se muestran como videos subidos.

Importar `postman/MiniAula-dias-11-12-13.postman_collection.json`. La colección tiene 39 peticiones organizadas en autenticación, multimedia, inscripciones, mis cursos, acceso a lecciones, completar lecciones y consultar progreso. Configurar las variables `baseUrl`, `cursoId`, `leccionId`, `videoPath` y las rutas locales de los archivos antes de ejecutar. Cada petición incluye el código HTTP esperado como prueba.

Ejemplos de cuerpo:

- Lección con video: `multipart/form-data` con `titulo`, `contenido` y `video` (archivo).
- Lección solo texto: `{"titulo":"...","contenido":"..."}`.
- Inscripción: sin cuerpo, `POST /api/cursos/:id/inscripcion`.
- Completar lección: sin cuerpo, `POST /api/cursos/:id/lecciones/:leccionId/completar`.
- Progreso: sin cuerpo, `GET /api/cursos/:id/progreso`.

## 9. Endpoints nuevos principales

- `POST /api/cursos/:id/lecciones` — crear lección; acepta JSON o `multipart/form-data`.
- `PUT /api/lecciones/:id` — editar o reemplazar video.
- `DELETE /api/lecciones/:id` — elimina lección y su archivo.
- `GET /api/videos/:archivo` — sirve video con control de acceso.
- `POST /api/cursos/:id/inscripcion` — inscribirse.
- `GET /api/inscripciones/mis-cursos` — cursos del estudiante autenticado.
- `GET /api/inscripciones/cursos/:id` y `/estado` — detalle y estado de inscripción.
- `GET /api/cursos/:id/lecciones/:leccionId` — lección accesible según orden.
- `POST /api/cursos/:id/lecciones/:leccionId/completar` — completar lección.
- `GET /api/cursos/:id/progreso`, `/progreso/lecciones`, `/progreso/porcentaje`.
- `GET /api/instructor/cursos/:id/lecciones/:leccionId` — administración del instructor propietario.
