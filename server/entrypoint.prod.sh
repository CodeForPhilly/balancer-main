#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."
#   To terminate a pod, kubernetes sends a SIGTERM and waits for a period of time for the pod to stop.
#   We exit this loop if that happens.
    trap "echo Received SIGTERM, exiting...; exit 0" TERM
    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done
    trap - TERM
    echo "PostgreSQL started"
fi

python manage.py makemigrations api
# python manage.py flush --no-input
python manage.py migrate

exec "$@"
