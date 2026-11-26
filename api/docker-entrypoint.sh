#!/bin/sh
set -e

cd /app/api

intentos=0

until npm run db:migrate; do
  intentos=$((intentos + 1))
  if [ "$intentos" -ge 30 ]; then
    echo "No se pudieron ejecutar las migraciones despues de 30 intentos" >&2
    exit 1
  fi
  sleep 3
done

exec npm run start
