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

Si ya tienes el proyecto, actualiza tu copia desde `main` y ejecuta `pnpm install` en la raíz. Si pnpm bloquea la compilación de `bcrypt`, ejecuta `pnpm approve-builds`, selecciona `bcrypt` y ejecuta `pnpm rebuild bcrypt`.

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
```

Conservar las demás variables de `.env.example` si existen. Generar el secreto JWT con:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Copiar el resultado en `JWT_SECRET`. No subir `.env` a GitHub.

## 5. Ejecutar las migraciones

Desde `api`:

```powershell
pnpm exec sequelize db:migrate --config src/config/database.cli.cjs --migrations-path migrations
```

Esto crea las tablas de la base de datos. Si el proyecto tiene el script `db:migrate`, también se puede usar `pnpm db:migrate`.


## 6. Arrancar la API

Desde `api`:

```powershell
pnpm start
```
Mantener MySQL iniciado y la terminal abierta. Comprobar en el navegador o Postman:

- `GET http://127.0.0.1:3000/api/health` — debe responder `200 OK`.
- `GET http://127.0.0.1:3000/api/cursos` — catálogo público.


## 7. Agregar datos a la base de datos
 en la carpeta  seeders hay un base de datos para descargar y podas hacer pruebas.