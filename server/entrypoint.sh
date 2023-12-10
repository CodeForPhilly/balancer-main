#!/bin/sh

# if [ "$DATABASE" = "postgres" ]
# then
#     echo "Waiting for postgres..."

#     while ! nc -z $SQL_HOST $SQL_PORT; do
#       sleep 0.1
#     done

#     echo "PostgreSQL started"
# fi

# python manage.py flush --no-input

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Starting server..."
gunicorn balancer_backend.wsgi:application --bind 0.0.0.0:8000

exec "$@"
