# Docker is hard, but we can pretend it isn't 😏

## Purpose

Eliminate barriers to deploying backend development environment, so you can focus on writing good code!

## A note on Makefiles

We employ a [Makefile](../Makefile) to abstract complex installation and deployment commands into simple one-liners.

### Why a Makefile?

#### It's easy to use

Make is a convenient way to abstract scripts of complex shell code into simple commands.

#### It's DRY

Pre-existing make commands can be declared as pre-requisites for other commands. For example,
a command `initialize-project` may require `pull-repo` and `build-project` as pre-requisite commands (which should themselves be smart about not repeating work that has already been done!)

#### Why not Python?

While one can make use of Python for command line scripting, ultimately that code must itself call shell code. If keyword arguments are not necessary (Python is much better at handling those across platforms in my opinion), I opt for Makefiles, which don't need to wrap each shell command to be executed.

## Show me the commands, already!

### You need Make to run the commands

#### Mac OS

Modern versions of Mac OS should come with make already installed. If you don't have the Make command already, after following the MAC_OS_INSTALLATION.md, open a terminal and run the following...
`brew install gcc`

#### Linux

Make should already be installed on your distribution. If not, you should be able to use your package manage to install it.

For example, on debian
`apt install make`.

#### Windows

You'll have the smoothest experience using [Windows Subsystem Linux](https://learn.microsoft.com/en-us/windows/wsl/install) for development of this project. After following Microsoft's instructions and installing a Linux distro, navigate to a terminal within the distro,and then follow the instructions in the Linux section above.

### Command location

All make commands should be run from the backend dir:

```
$YOUR_GIT_REPO_LOCATION/backend
```

### Build commands

You need to build the project's docker container in order to use it.

#### Base Image

The backend development environment requires a "base image" combining Python and the Poetry dependency installation tool. Before doing anything else, ensure you have our base image by running
`make build-base-image`.

#### Build the Development image

After installating the base-image, run
`make build-project`
in order to build the balancer backend develompent environment.

### Deployment commands

#### Launching django server

We use Django for serving our API endpoints to the balancer frontend. In other words, Django's web-server must be running in order to use our app. To do so, in its own termainal, run

```
make launch-local-server
```

#### NOTE

The local server does not run as a background process, so you'll need to give it its own terminal to run in!

### Test utilities

#### Launching shell-plus

[Shell plus](https://django-extensions.readthedocs.io/en/latest/shell_plus.html) is an extremely convenient manner of working with Django (our models, ORM, api, etc). Some immediately useful functionality:

    - Automatically imports all models, such that they can be called without manual imports.
    - Adds tab auto-complete to all project paths, making it easier to use imports.
    - Gives direct access to the ORM (i.e., `Accounts.objects.filter(...)`)

#### API Calls

Pending ...
