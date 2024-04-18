#!/bin/sh

trap "echo Received SIGTERM, exiting...; exit 0" TERM
#   To terminate a pod, kubernetes sends a SIGTERM and waits for a period of time for the pod to stop.
#   We exit this loop if that happens.
if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi
trap - TERM

python manage.py makemigrations api
python manage.py migrate
# create superuser for postgres admin on start up
python manage.py createsu
# populate the database on start up
python manage.py populatedb

exec "$@"
