# balancer-backend
Django driven backend for the CodeForPhilly balancer project (https://opencollective.com/code-for-philly/projects/balancer)

## Environment setup instructions
This project makes use of Python-Docker in order to
    1. Rapidly initialize and update packages (using Python poetry)
    2. Build project (with requirements) for local and production environments.
    3. Launch and teardown docker containers.

### Build project
1. Run 
```make build-base-image```
in order to install poetry atop the Python base image.
2. Run
```make build-project```
in order to create an image for dev deployment with all packages
defined in pyproject.toml.

### Deploy project
1. Run
```make launch-local-project``` (after building)
in order to launch a development container with interactive shell.

### Teardown project
1. Run
```make teardown-project```
in order to tear down any exisiting development containers.