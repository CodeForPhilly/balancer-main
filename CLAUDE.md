# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Balancer is a web application designed to help prescribers choose suitable medications for patients with bipolar disorder. It's a Code for Philly project built with a PostgreSQL + Django REST Framework + React stack, running on Docker.

Live site: https://balancertestsite.com

## Development Setup

### Prerequisites
- Docker Desktop
- Node.js and npm
- API keys for OpenAI and Anthropic (request from team)

### Initial Setup
```bash
# Clone the repository
git clone <repo-url>

# Install frontend dependencies
cd frontend
npm install
cd ..

# Configure environment variables
# Copy config/env/dev.env.example and fill in API keys:
# - OPENAI_API_KEY
# - ANTHROPIC_API_KEY
# - PINECONE_API_KEY (if needed)

# Start all services
docker compose up --build
```

### Services
- **Frontend**: React + Vite dev server at http://localhost:3000
- **Backend**: Django REST Framework at http://localhost:8000
- **Database**: PostgreSQL at localhost:5433
- **pgAdmin**: Commented out by default (port 5050)

## Common Development Commands

### Docker Operations
```bash
# Start all services
docker compose up --build

# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f [service_name]

# Stop all services
docker compose down

# Rebuild a specific service
docker compose build [frontend|backend|db]

# Access Django shell in backend container
docker compose exec backend python manage.py shell

# Run Django migrations
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

### Frontend Development
```bash
cd frontend

# Start dev server (outside Docker)
npm run dev

# Build for production
npm run build

# Lint TypeScript/TSX files
npm run lint

# Preview production build
npm run preview
```

### Backend Development
```bash
cd server

# Create Django superuser (credentials in api/management/commands/createsu.py)
docker compose exec backend python manage.py createsuperuser

# Access Django admin
# Navigate to http://localhost:8000/admin

# Run database migrations
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# Django shell
docker compose exec backend python manage.py shell
```

### Git Workflow
- Main development branch: `develop`
- Production branch: `listOfMed` (used for PRs)
- Create feature branches from `develop`
- PRs should target `listOfMed` branch

## Architecture

### Backend Architecture (Django REST Framework)

#### URL Routing Pattern
Django uses **dynamic URL importing** (see `server/balancer_backend/urls.py`). API endpoints are organized by feature modules in `server/api/views/`:
- `conversations/` - Patient conversation management
- `feedback/` - User feedback
- `listMeds/` - Medication catalog
- `risk/` - Risk assessment endpoints
- `uploadFile/` - PDF document uploads
- `ai_promptStorage/` - AI prompt templates
- `ai_settings/` - AI configuration
- `embeddings/` - Vector embeddings for RAG
- `medRules/` - Medication rules management
- `text_extraction/` - PDF text extraction
- `assistant/` - AI assistant endpoints

Each module contains:
- `views.py` or `views_*.py` - API endpoints
- `models.py` - Django ORM models
- `urls.py` - URL patterns
- `serializers.py` - DRF serializers (if present)

#### Authentication
- Uses **JWT authentication** with `rest_framework_simplejwt`
- Default: All endpoints require authentication (`IsAuthenticated`)
- To make an endpoint public, add to the view class:
  ```python
  from rest_framework.permissions import AllowAny

  class MyView(APIView):
      permission_classes = [AllowAny]
      authentication_classes = []  # Optional: disable auth entirely
  ```
- Auth endpoints via Djoser: `/auth/`
- JWT token lifetime: 60 minutes (access), 1 day (refresh)

#### Key Data Models
- **Medication** (`api.views.listMeds.models`) - Medication catalog with benefits/risks
- **MedRule** (`api.models.model_medRule`) - Include/Exclude rules for medications based on patient history
- **MedRuleSource** - Junction table linking MedRules → Embeddings → Medications
- **Embeddings** (`api.models.model_embeddings`) - Vector embeddings from uploaded PDFs for RAG
- **UploadFile** (`api.views.uploadFile.models`) - Uploaded PDF documents with GUID references

#### RAG (Retrieval Augmented Generation) System
The application uses embeddings from medical literature PDFs to provide evidence-based medication recommendations:
1. PDFs uploaded via `uploadFile` → text extracted → chunked → embedded (OpenAI/Pinecone)
2. MedRules created linking medications to specific evidence (embeddings)
3. API endpoints return recommendations with source citations (filename, page number, text excerpt)

### Frontend Architecture (React + TypeScript)

#### Project Structure
- **`src/components/`** - Reusable React components (Header, forms, etc.)
- **`src/pages/`** - Page-level components
- **`src/routes/routes.tsx`** - React Router configuration
- **`src/services/`** - Redux store, actions, reducers, API clients
- **`src/contexts/`** - React Context providers (GlobalContext for app state)
- **`src/api/`** - API client functions using Axios
- **`src/utils/`** - Utility functions

#### State Management
- **Redux** for auth state and global application data
  - Store: `src/services/store.tsx`
  - Actions: `src/services/actions/`
  - Reducers: `src/services/reducers/`
- **React Context** (`GlobalContext`) for UI state:
  - `showSummary` - Display medication summary
  - `enterNewPatient` - New patient form state
  - `isEditing` - Form edit mode
  - `showMetaPanel` - Metadata panel visibility

#### Routing
Routes defined in `src/routes/routes.tsx`:
- `/` - Medication Suggester (main tool)
- `/medications` - Medication List
- `/about` - About page
- `/help` - Help documentation
- `/feedback` - Feedback form
- `/logout` - Logout handler
- Admin routes (superuser only):
  - `/rulesmanager` - Manage medication rules
  - `/ManageMeds` - Manage medication database

#### Styling
- **Tailwind CSS** for utility-first styling
- **PostCSS** with nesting support
- Custom CSS in component directories (e.g., `Header/header.css`)
- Fonts: Quicksand (branding), Satoshi (body text)

### Database Schema Notes
- **pgvector extension** enabled for vector similarity search
- Custom Dockerfile for PostgreSQL (`db/Dockerfile`) - workaround for ARM64 compatibility
- Database connection:
  - Host: `db` (Docker internal) or `localhost:5433` (external)
  - Credentials: `balancer/balancer` (dev environment)
  - Database: `balancer_dev`

### Environment Configuration
- **Development**: `config/env/dev.env` (used by Docker Compose)
- **Frontend Production**: `frontend/.env.production`
  - Contains `VITE_API_BASE_URL` for production API endpoint
- **Never commit** actual API keys - use `.env.example` as template
- Django `SECRET_KEY` should be a long random string in production (not "foo")

## Important Development Patterns

### Adding a New API Endpoint
1. Create view in appropriate `server/api/views/{module}/views.py`
2. Add URL pattern to `server/api/views/{module}/urls.py`
3. If new module, add to `urls` list in `server/balancer_backend/urls.py`
4. Consider authentication requirements (add `permission_classes` if needed)

### Working with MedRules
MedRules use a many-to-many relationship with medications and embeddings:
- `rule_type`: "INCLUDE" (beneficial) or "EXCLUDE" (contraindicated)
- `history_type`: Patient diagnosis state (e.g., "DIAGNOSIS_DEPRESSED", "DIAGNOSIS_MANIC")
- Access sources via `MedRuleSource` intermediate model
- API returns benefits/risks with source citations (filename, page, text, **upload_file_guid**)

### PDF Access and Authentication
**Feature**: Conditional PDF viewing/downloading based on authentication state

**Behavior**:
- **Logged-in users**: See "View PDF" button (blue) that opens `/drugSummary` page in new tab
- **Non-logged-in users**: See "Download PDF" button (green) that directly downloads via `/v1/api/uploadFile/<guid>` endpoint

**Implementation Details**:
- Backend: `upload_file_guid` field added to source_info in `views_riskWithSources.py` (3 locations)
- Frontend: `isAuthenticated` prop passed through component hierarchy:
  - `PatientManager` (gets from Redux) → `PatientSummary` → `MedicationTier` → `MedicationItem`
- Download endpoint: `/v1/api/uploadFile/<guid>` is **public** (AllowAny permission)
- Fallback: If `upload_file_guid` missing from API, GUID is extracted from `link_url` query parameter
- Route: `/drugSummary` (camelCase) - fixed from inconsistent `/drugsummary` usage

**Files Modified**:
- Backend: `server/api/views/risk/views_riskWithSources.py`
- Frontend: `frontend/src/pages/PatientManager/PatientManager.tsx`, `PatientSummary.tsx`
- Routes: Multiple files updated for consistent `/drugSummary` casing
- Auth: `ProtectedRoute.tsx` and `Layout_V2_Main.tsx` fixed for proper auth checking

### Frontend API Calls
- API client functions in `src/api/`
- Use Axios with base URL from environment
- JWT tokens managed by Redux auth state
- Error handling should check for 401 (unauthorized) and redirect to login

### Docker Networking
Services use a custom network (192.168.0.0/24):
- db: 192.168.0.2
- backend: 192.168.0.3
- frontend: 192.168.0.5
- Services communicate using service names (e.g., `http://backend:8000`)

## Testing

### Backend Tests
Limited test coverage currently. Example test:
- `server/api/views/uploadFile/test_title.py`

To run tests:
```bash
docker compose exec backend python manage.py test
```

### Frontend Tests
No test framework currently configured. Consider adding Jest/Vitest for future testing.

## Key Files Reference

- `server/balancer_backend/settings.py` - Django configuration (auth, database, CORS)
- `server/balancer_backend/urls.py` - Root URL configuration with dynamic imports
- `frontend/src/routes/routes.tsx` - React Router configuration
- `frontend/src/services/store.tsx` - Redux store setup
- `docker-compose.yml` - Local development environment
- `config/env/dev.env.example` - Environment variables template

## Project Conventions

- Python: Follow Django conventions, use class-based views (APIView)
- TypeScript: Use functional components with hooks, avoid default exports except for pages
- CSS: Prefer Tailwind utilities, use custom CSS only when necessary
- Git: Feature branches from `develop`, PRs to `listOfMed`
- Code formatting: Prettier for frontend (with Tailwind plugin)
