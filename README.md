# Balancer

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://choosealicense.com/licenses/agpl-3.0/)
[![Code for Philly](https://img.shields.io/badge/Code%20for%20Philly-Project-orange)](https://codeforphilly.org/projects/balancer)
[![Stack](https://img.shields.io/badge/Stack-Django%20%7C%20React%20%7C%20PostgreSQL%20%7C%20K8s-green)](https://github.com/CodeForPhilly/balancer)

**Balancer** is a digital clinical decision support tool designed to assist prescribers in selecting the most suitable medications for patients with bipolar disorder. By providing evidence-based insights, Balancer aims to shorten the patient's journey to stability and well-being.

This is an open-source project maintained by the **[Code for Philly](https://www.codeforphilly.org/)** community.

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Environment Configuration](#-environment-configuration)
- [Quick Start: Local Development](#-quick-start-local-development)
- [Advanced: Local Kubernetes Deployment](#-advanced-local-kubernetes-deployment)
- [Data Layer](#-data-layer)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏗 Architecture

Balancer follows a modern containerized 3-tier architecture:

1.  **Frontend**: React (Vite) application serving the user interface.
2.  **Backend**: Django REST Framework API handling business logic, authentication, and AI orchestration.
3.  **Data & AI**: PostgreSQL (with `pgvector` for RAG) and integrations with LLM providers (OpenAI/Anthropic).

```mermaid
graph TD
    User[User / Prescriber] -->|HTTPS| Frontend[React Frontend]
    Frontend -->|REST API| Backend[Django Backend]
    
    subgraph "Data Layer"
        Backend -->|Read/Write| DB[(PostgreSQL + pgvector)]
    end
    
    subgraph "External AI Services"
        Backend -->|LLM Queries| OpenAI[OpenAI API]
        Backend -->|LLM Queries| Anthropic[Anthropic API]
    end
    
    subgraph "Infrastructure"
        Docker[Docker Compose (Local)]
        K8s[Kubernetes / Kind (Dev/Prod)]
    end
```

---

## 🛠 Prerequisites

Before you start, ensure you have the following installed:

*   **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: Required for running the application containers.
*   **[Node.js & npm](https://nodejs.org/)**: Required if you plan to do frontend development outside of Docker.
*   **[Devbox](https://www.jetify.com/devbox)** (Optional): Required only for the Local Kubernetes workflow.
*   **Postman** (Optional): Useful for API testing. Ask in Slack to join the `balancer_dev` team.

---

## 🔐 Environment Configuration

To run the application, you need to configure your environment variables.

1.  **Backend Config**:
    *   Navigate to `config/env/`.
    *   Copy the example file: `cp dev.env.example dev.env`
    *   **Action Required**: Open `dev.env` and populate your API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.). Ask the project leads in Slack if you need shared development keys.

    > **⚠️ SECURITY WARNING**: Never commit `config/env/dev.env` to version control. It is already ignored by `.gitignore`.

2.  **Frontend Config**:
    *   The frontend uses `frontend/.env` for local dev only (e.g. `VITE_API_BASE_URL=http://localhost:8000` for the Vite proxy).
    *   Production builds use relative API URLs (no `.env.production` or API base URL needed); the same image works for sandbox and live.

---

## 🚀 Quick Start: Local Development

This is the standard workflow for contributors working on features or bug fixes.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/CodeForPhilly/balancer.git
    cd balancer
    ```

2.  **Install Frontend Dependencies** (Optional but recommended for IDE support)
    ```bash
    cd frontend
    npm install
    cd ..
    ```

3.  **Start Services**
    Run the full stack (db, backend, frontend) using Docker Compose:
    ```bash
    docker compose up --build
    ```

4.  **Access the Application**
    *   **Frontend**: [http://localhost:3000](http://localhost:3000)
    *   **Backend API**: [http://localhost:8000](http://localhost:8000)
    *   **Django Admin**: [http://localhost:8000/admin](http://localhost:8000/admin)

    > **Default Superuser Credentials:**
    > *   **Email**: `admin@example.com`
    > *   **Password**: `adminpassword`
    > *   *(Defined in `server/api/management/commands/createsu.py`)*

---

## ☸️ Advanced: Local Kubernetes Deployment

Use this workflow if you are working on DevOps tasks, Helm charts, or Kubernetes manifests.

### 1. Configure Hostname
We map a local domain to your machine to simulate production routing.

Run this script to update your `/etc/hosts` file (requires `sudo`):

```bash
#!/bin/bash
HOSTNAME="balancertestsite.com"
LOCAL_IP="127.0.0.1"

if grep -q "^$LOCAL_IP[[:space:]]\+$HOSTNAME" /etc/hosts; then
  echo "✅ Entry for $HOSTNAME already exists."
else
  echo "Updating /etc/hosts..."
  echo "$LOCAL_IP      $HOSTNAME" | sudo tee -a /etc/hosts
fi
```

### 2. Deploy with Devbox
We use `devbox` to manage the local Kind cluster and deployments.

```bash
devbox shell
devbox create:cluster
devbox run deploy:balancer
```

The application will be available at: **[https://balancertestsite.com:30219/](https://balancertestsite.com:30219/)**

---

## 💾 Data Layer

Balancer supports multiple PostgreSQL configurations depending on the environment:

| Environment | Database Technology | Description |
| :--- | :--- | :--- |
| **Local Dev** | **Docker Compose** | Standard postgres container. Access at `localhost:5433`. |
| **Kubernetes** | **CloudNativePG** | Operator-managed HA cluster. Used in Kind and Prod. |
| **AWS** | **RDS** | Managed PostgreSQL for scalable cloud deployments. |

### Querying the Local Database
You can connect via any SQL client using:
*   **Host**: `localhost`
*   **Port**: `5433`
*   **User/Pass**: `balancer` / `balancer`
*   **DB Name**: `balancer_dev`

**Python Example (Jupyter):**
```python
from sqlalchemy import create_engine
import pandas as pd

# Connect to local docker database
engine = create_engine("postgresql+psycopg2://balancer:balancer@localhost:5433/balancer_dev")

# Query embeddings table
df = pd.read_sql("SELECT * FROM api_embeddings;", engine)
print(df.head())
```

---

## 🤝 Contributing

We welcome contributors of all skill levels!

1.  **Join the Community**:
    *   Join the [Code for Philly Slack](https://codeforphilly.org/chat).
    *   Say hello in the **#balancer** channel.
2.  **Find a Task**:
    *   Check our [GitHub Project Board](https://github.com/orgs/CodeForPhilly/projects/2).
3.  **Code of Conduct**:
    *   Please review the [Code for Philly Code of Conduct](https://codeforphilly.org/pages/code_of_conduct/).

### Pull Request Workflow
1.  Fork the repo.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Open a Pull Request against the `develop` branch.

---

## 📄 License

Balancer is open-source software licensed under the **[AGPL-3.0 License](https://choosealicense.com/licenses/agpl-3.0/)**.