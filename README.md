# Balancer

Balancer is a website of research tools to help bipolar patients achieve stability faster

## Usage

You can view the current build of the website here: [https://balancerproject.org/](https://balancerproject.org/)

## Contributing

### Code for Philly Code of Conduct

The Code for Philly Code of Conduct is [here](https://codeforphilly.org/pages/code_of_conduct/) 

### Join the Balancer community

Balancer is a [Code for Philly](https://www.codeforphilly.org/) project 

Join the [Code for Philly Slack and introduce yourself](https://codeforphilly.org/projects/balancer) in the #balancer channel

The project kanban board is [on GitHub here](https://github.com/orgs/CodeForPhilly/projects/2)

### Architecture

The Balancer website is a Postgres, Django REST, and React project. The source code layout is:

![Architecture Drawing](Architecture.png)

### Setting up a development environment   

Get the code using git by either [forking or cloning](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/about-collaborative-development-models) `CodeForPhilly/balancer-main`

Tools used to run Balancer:
1. `OpenAI API`: Ask for an API key and add it to `config/env/env.dev`

Tools used for development:
1. `Docker`: Install Docker Desktop
2. `Postman`: Ask to get invited to the Balancer Postman team `balancer_dev`
3. `npm`: In the terminal run 1) 'cd frontend' 2) 'npm install' 3) 'cd ..'

### Running Balancer for development

Start the Postgres, Django REST, and React services by starting Docker Desktop and running `docker compose up --build` 

#### Postgres

The application supports connecting to PostgreSQL databases via:

1. **CloudNativePG** - Kubernetes-managed PostgreSQL cluster (for production/sandbox)
2. **AWS RDS** - External PostgreSQL database (AWS managed)
3. **Local Docker Compose** - For local development

See [Database Connection Documentation](./docs/DATABASE_CONNECTION.md) for detailed configuration.

**Local Development:**
- Download a sample of papers to upload from [https://balancertestsite.com](https://balancertestsite.com/) 
- The email and password of `pgAdmin` are specified in `balancer-main/docker-compose.yml`
- The first time you use `pgAdmin` after building the Docker containers you will need to register the server.
    - The `Host name/address` is the Postgres server service name in the Docker Compose file
    - The `Username` and `Password` are the Postgres server environment variables in the Docker Compose file
- You can use the below code snippet to  query the database from a Jupyter notebook: 

```
from sqlalchemy import create_engine
import pandas as pd

engine = create_engine("postgresql+psycopg2://balancer:balancer@localhost:5433/balancer_dev")

query = "SELECT * FROM api_embeddings;"

df = pd.read_sql(query, engine)
```

#### Django REST
- The email and password are set in `server/api/management/commands/createsu.py`

## Local Kubernetes Deployment

### Prereqs

- Fill the configmap with the [env vars](./deploy/manifests/balancer/base/configmap.yml)
- Install [Devbox](https://www.jetify.com/devbox)
- Run the following script with admin privileges:

```bash
HOSTNAME="balancertestsite.com"
LOCAL_IP="127.0.0.1"

# Check if the correct line already exists
if grep -q "^$LOCAL_IP[[:space:]]\+$HOSTNAME" /etc/hosts; then
  echo "Entry for $HOSTNAME with IP $LOCAL_IP already exists in /etc/hosts"
else
  echo "Updating /etc/hosts for $HOSTNAME"
  sudo sed -i "/[[:space:]]$HOSTNAME/d" /etc/hosts
  echo "$LOCAL_IP      $HOSTNAME" | sudo tee -a /etc/hosts
fi
```

### Steps to reproduce

Inside root dir of balancer

```bash
devbox shell
devbox create:cluster
devbox run deploy:balancer
```

The website should be available in [https://balancertestsite.com:30219/](https://balancertestsite.com:30219/)

## License 

Balancer is licensed under the [AGPL-3.0 license](https://choosealicense.com/licenses/agpl-3.0/)
