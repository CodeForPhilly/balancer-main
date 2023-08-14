# Env files can be used to override any variable defaults
# (e.g., DOCKER_SPECIFIC_ENV_PATH=config/docker/env/base.env DOCKER_SPECIFIC_ENV_PATH=config/docker/env/local.env make do-something)
ifdef DOCKER_COMMON_ENV_PATH
include $(DOCKER_COMMON_ENV_PATH)
DOCKER_COMMON_ENV_PATH_FROM_PYTHON_DOCKER=$(DOCKER_BACKEND_CTX_FROM_PYTHON_DOCKER)/$(DOCKER_COMMON_ENV_PATH)
endif

ifdef DOCKER_SPECIFIC_ENV_PATH
include $(DOCKER_SPECIFIC_ENV_PATH)
DOCKER_SPECIFIC_ENV_PATH_FROM_PYTHON_DOCKER=$(DOCKER_BACKEND_CTX_FROM_PYTHON_DOCKER)/$(DOCKER_SPECIFIC_ENV_PATH)
endif

export

DJANGO_SETTINGS_MODULE=config.settings.base
NAMESPACE ?= local
PROJECT_NAME ?= balancer_backend
PYTHON_VERSION ?= 3.10

DOCKER_APP_DEST ?= /app
DOCKER_BACKEND_CTX_FROM_COMPOSE ?= ../../..
DOCKER_BACKEND_CTX_FROM_PROJECT_ROOT ?= .
DOCKER_BACKEND_CTX_FROM_PYTHON_DOCKER ?= ..
DOCKER_ENTRYPOINT_DEST ?= /entrypoint.sh
DOCKER_LOCAL_CMD ?= /bin/bash
DOCKER_LOG_FOLDER_PATH ?= /root/.$(PROJECT_NAME)/logs
DOCKER_NO_CACHE ?=  # Define with any value to disable caching on build
DOCKER_PROJECT_ROOT_FROM_CTX ?= .
DOCKER_PROJECT_SERVICE_NAME ?= balancer-backend
DOCKER_PYTHON_DOCKER_FROM_CTX ?= Python-Docker
DOCKER_REGISTRY ?= docker.fakecodeforphillydomain.com
DOCKER_TAG_VERSION ?= latest
DOCKER_WATCH ?= # Define with any value to display background deployment

# These are built dyanimcally and used below?
DOCKER_APP_SOURCE_FROM_COMPOSE ?= $(DOCKER_BACKEND_CTX_FROM_COMPOSE)/$(DOCKER_PROJECT_ROOT_FROM_CTX)
DOCKER_COMPOSE_FILE ?= $(DOCKER_BACKEND_CTX_FROM_PYTHON_DOCKER)/$(DOCKER_PROJECT_ROOT_FROM_CTX)/config/docker/compose/docker-compose.$(NAMESPACE).yaml
DOCKER_CONFIG_FOLDER_PATH ?= /root/.$(DOCKER_PROJECT_SERVICE_NAME)/config
DOCKER_ENTRYPOINT_SOURCE_FROM_CTX ?= $(DOCKER_PROJECT_ROOT_FROM_CTX)/config/docker/scripts/$(NAMESPACE)-entrypoint.sh
DOCKER_USER_CONFIG_PATH_FROM_CTX ?= $(DOCKER_PROJECT_ROOT_FROM_CTX)/config
DOCKER_USER_LOCAL_LOG_PATH_FROM_CTX ?= $(DOCKER_PROJECT_ROOT_FROM_CTX)/logs

all: pull-python-docker build-base-image build-project

# Necessary env vars for builds and deployment
set-app-vars:
	export \
		DOCKER_APP_DEST=$(DOCKER_APP_DEST) \
		DOCKER_CONFIG_FOLDER_PATH=$(DOCKER_CONFIG_FOLDER_PATH) \
		DOCKER_BACKEND_CTX_FROM_COMPOSE=$(DOCKER_BACKEND_CTX_FROM_COMPOSE) \
		DOCKER_LOG_FOLDER_PATH=$(DOCKER_LOG_FOLDER_PATH) \
		DOCKER_REGISTRY=$(DOCKER_REGISTRY) \
		DOCKER_TAG_VERSION=$(DOCKER_TAG_VERSION) \
		DOCKER_USER_CONFIG_PATH_FROM_CTX={DOCKER_USER_CONFIG_PATH_FROM_CTX} \
		DOCKER_USER_LOCAL_LOG_PATH_FROM_CTX={DOCKER_USER_LOCAL_LOG_PATH_FROM_CTX} \
		PROJECT_NAME=$(PROJECT_NAME) \
		DOCKER_APP_SOURCE_FROM_COMPOSE=$(DOCKER_APP_SOURCE_FROM_COMPOSE) \

# Used for builds and launches.
pull-python-docker:
	if ! [ -d Python-Docker ]; then\
		git clone https://github.com/jusjayson/Python-Docker.git;\
	fi
	cd Python-Docker && git pull;

# Builds base python/poetry image of given version
build-base-image: pull-python-docker set-app-vars
	cd $(DOCKER_BACKEND_CTX_FROM_PROJECT_ROOT)/$(DOCKER_PYTHON_DOCKER_FROM_CTX) && \
		DOCKER_REGISTRY=$(DOCKER_REGISTRY) \
		PYTHON_VERSION=$(PYTHON_VERSION) \
		make build-base-image

# Installs projects and requirements (per pyproject.toml)
build-project: set-app-vars
	cd $(DOCKER_BACKEND_CTX_FROM_PROJECT_ROOT)/$(DOCKER_PYTHON_DOCKER_FROM_CTX) && \
		DOCKER_BACKEND_CTX_FROM_PYTHON_DOCKER=$(DOCKER_BACKEND_CTX_FROM_PYTHON_DOCKER) \
		DOCKER_ENTRYPOINT_DEST=$(DOCKER_ENTRYPOINT_DEST) \
		DOCKER_ENTRYPOINT_SOURCE_FROM_CTX=$(DOCKER_ENTRYPOINT_SOURCE_FROM_CTX) \
		DOCKER_NO_CACHE=$(DOCKER_NO_CACHE) \
		DOCKER_PROJECT_ROOT_FROM_CTX=$(DOCKER_PROJECT_ROOT_FROM_CTX) \
		NAMESPACE=$(NAMESPACE) \
		DONT_PASS_SSH_KEYS=1 \
		make build-project

# Create django superuser
create-superuser: set-app-vars migrations migrate
	NAMESPACE=$(NAMESPACE) \
	docker compose \
		-f config/docker/compose/docker-compose.local.yaml \
		run \
			-it \
		${DOCKER_PROJECT_SERVICE_NAME} bash -c "cd app && ./manage.py createsuperuser"

# Initialize poetry project in order to generate pyproject.toml and poetry.lock
init-project:
	cd $(DOCKER_BACKEND_CTX_FROM_PROJECT_ROOT)/$(DOCKER_PYTHON_DOCKER_FROM_CTX) && \
		DOCKER_ABSOLUTE_APP_SOURCE=$(shell realpath ".") \
		DOCKER_REGISTRY=$(DOCKER_REGISTRY) \
		DOCKER_TAG_VERSION=$(DOCKER_TAG_VERSION) \
		PYTHON_VERSION=$(PYTHON_VERSION) \
		make init-project

# Run any command $(DOCKER_LOCAL_CMD) in local container
launch-local-project: set-app-vars
	NAMESPACE=$(NAMESPACE) \
	docker compose \
		-f config/docker/compose/docker-compose.local.yaml \
		run \
			 --service-ports \
			 -it \
			 --rm \
			 --name=balancer-local \
		${DOCKER_PROJECT_SERVICE_NAME} $(DOCKER_LOCAL_CMD)

# Launch django runserver in local container
launch-local-server: set-app-vars
	NAMESPACE=local \
	docker compose \
		-f config/docker/compose/docker-compose.local.yaml \
		run \
			--service-ports \
			-it \
		${DOCKER_PROJECT_SERVICE_NAME} bash -c "cd app && ./manage.py runserver 0.0.0.0:8000"

# Launch django shell-plus in local container
launch-shell-plus: set-app-vars
	NAMESPACE=$(NAMESPACE) \
	PROJECT_NAME=$(PROJECT_NAME) \
	docker compose \
		-f config/docker/compose/docker-compose.local.yaml \
		run -it ${DOCKER_PROJECT_SERVICE_NAME} $(DOCKER_LOCAL_CMD)

# Run django makemigrations in local container
migrations: set-app-vars
	NAMESPACE=$(NAMESPACE) \
	docker compose \
		-f config/docker/compose/docker-compose.local.yaml \
		run \
			-it \
		${DOCKER_PROJECT_SERVICE_NAME} bash -c "cd app && ./manage.py makemigrations"

# Run django migrate in local container
migrate: set-app-vars
	docker compose \
		-f config/docker/compose/docker-compose.local.yaml \
		run \
			-it \
		${DOCKER_PROJECT_SERVICE_NAME} bash -c "cd app && ./manage.py migrate"

# Run django tests (from ${TESTS_ROOT}) in local container
run-tests: set-app-vars
	NAMESPACE=$(NAMESPACE) \
	docker compose \
		-f config/docker/compose/docker-compose.local.yaml \
		run -it ${DOCKER_PROJECT_SERVICE_NAME} bash -c "cd app/balancer && pytest ${TESTS_ROOT}"

# Teardown containers (as defined by compose file)
teardown-project: pull-python-docker
	docker compose -f $(DOCKER_COMPOSE_FILE) down --remove-orphans



