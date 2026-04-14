# Balancer

Balancer is a website of digital tools designed to help prescribers choose the most suitable medications
for patients with bipolar disorder, helping them shorten their journey to stability and well-being

## Usage

You can view the current build of the website here: [https://balancerproject.org/](https://balancerproject.org/)
You can view the website in a sandbox here: [https://sandbox.balancerproject.org/](https://sandbox.balancerproject.org/)

## Contributing 

### Join the Balancer community

Balancer is a [Code for Philly](https://www.codeforphilly.org/) project 

Join the [Code for Philly Slack and introduce yourself](https://codeforphilly.org/projects/balancer) in the #balancer channel

The project kanban board is [on GitHub here](https://github.com/orgs/CodeForPhilly/projects/2)

### Code for Philly Code of Conduct

The Code for Philly Code of Conduct is [here](https://codeforphilly.org/pages/code_of_conduct/) 

### Setting up a development environment

Get the code using git by either forking or cloning `CodeForPhilly/balancer-main`

1. Copy the example environment file:
   ```bash
   cp config/env/dev.env.example config/env/dev.env
   ```
2. (Optional) Add your API keys to `config/env/dev.env`:
   - `OpenAI API`

Tools used for development:
1. `Docker`: Install Docker Desktop
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
- Download a sample of papers to upload from [https://balancerproject.org/](https://balancerproject.org/) 
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

## API Documentation

Interactive API docs are auto-generated using [drf-spectacular](https://drf-spectacular.readthedocs.io/) and available at:

- **Swagger UI**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/) — interactive explorer with "Try it out" functionality
- **ReDoc**: [http://localhost:8000/api/redoc/](http://localhost:8000/api/redoc/) — clean, readable reference docs
- **Raw schema**: [http://localhost:8000/api/schema/](http://localhost:8000/api/schema/) — OpenAPI 3.0 JSON/YAML

### Testing authenticated endpoints

Most endpoints require JWT authentication. To test them in Swagger UI:

1. **Get a token**: Find the `POST /auth/jwt/create/` endpoint in Swagger UI, click **Try it out**, enter an authorized `email` and `password`, and click **Execute**. Copy the `access` token from the response.
2. **Authorize**: Click the **Authorize** button (lock icon) at the top of the page. Enter `JWT <your-access-token>` in the value field. The prefix must be `JWT`, not `Bearer`.
3. **Test endpoints**: All subsequent requests will include your token. Use **Try it out** on any protected endpoint.
4. **Token refresh**: Access tokens expire after 60 minutes. Use `POST /auth/jwt/refresh/` with your `refresh` token, or repeat step 1.

### Deployment 

1. Merging your PR into develop automatically triggers a GitHub Release
2. The release triggers a container build workflow that builds and pushes the Docker image
3. [Go to GitHub Packages](https://github.com/CodeForPhilly/balancer-main/pkgs/container/balancer-main%2Fapp) to find the new image tag 
4. Update newTag in kustomization.yaml [in the cluster repo](https://github.com/CodeForPhilly/cfp-live-cluster/blob/main/balancer/kustomization.yaml)
5. Open a PR to [cfp-sandbox-cluster](https://github.com/CodeForPhilly/cfp-sandbox-cluster) (or [cfp-live-cluster](https://github.com/CodeForPhilly/cfp-live-cluster))

## Architecture

The Balancer website is a Postgres, Django REST, and React project. The source code layout is:

![Architecture Drawing](Architecture.png)

## License 

Balancer is licensed under the [AGPL-3.0 license](https://choosealicense.com/licenses/agpl-3.0/)
