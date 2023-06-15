# balancer-backend
Django driven backend for the CodeForPhilly balancer project (https://opencollective.com/code-for-philly/projects/balancer)


# Running with docker-compose
Docker-compose runs docker containers for the django backend connecting to the postgres database.

1. Clone this repo
2. run `docker-compose build backend`
3. run `docker-compose run backend python manage.py migrate`
4. run `docker-compose up`
5. open http://localhost:8000/ and you should see the django page
