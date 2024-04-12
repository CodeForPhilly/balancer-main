#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

python manage.py makemigrations api
# python manage.py flush --no-input
python manage.py migrate
# create superuser for postgre admin on start up
python manage.py createsu
# populate the database on start up
python manage.py populatedb
exec "$@"
