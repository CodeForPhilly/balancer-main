# Balancer

Balancer is a website of digital tools designed to help prescribers choose the most suitable medications
for patients with bipolar disorder, helping them shorten their journey to stability and well-being

## Usage

You can view the current build of the website here: [https://balancertestsite.com](https://balancertestsite.com/)

## Contributing 

### Join the Balancer community

Balancer is a [Code for Philly](https://www.codeforphilly.org/) project 

Join the [Code for Philly Slack and introduce yourself](https://codeforphilly.org/projects/balancer) in the #balancer channel

The project kanban board is [on GitHub here](https://github.com/orgs/CodeForPhilly/projects/2)

### Code for Philly Code of Conduct

The Code for Philly Code of Conduct is [here](https://codeforphilly.org/pages/code_of_conduct/) 

### Setting up a development environment   

Get the code using git by either forking or cloning `CodeForPhilly/balancer-main`

Tools used to run Balancer:
1. `OpenAI API`: Ask for the API key and add it to `config/env/env.dev`
2. `Anthropic API`: Ask for the API key and add it to `config/env/env.dev`

Tools used for development:
1. `Docker`: Install Docker Desktop
2. `Postman`: Ask to get invited to the Balancer Postman team `balancer_dev`
3. `npm`: In the terminal run 1) 'cd frontend' 2) 'npm install' 3) 'cd ..'

### Running Balancer for development

Running Balancer:
- Start Docker Desktop and run `docker compose up --build` 
- The email and password are set in `server/api/management/commands/createsu.py`
- Download a sample of papers to upload from [https://balancertestsite.com](https://balancertestsite.com/) 

Running pgAdmin:
- The email and password of `pgAdmin` are specified in `balancer-main/docker-compose.yml`
- The first time you use `pgAdmin` after building the Docker containers you will need to register the server. 
- The `Host name/address`, `Username` and `Password` are specified in  `balancer-main/docker-compose.yml`

## Architecture

The Balancer website is a Postgres, Django REST, and React project:

![Architecture Drawing](Architecture.png)

## License 

Balancer is licensed under the [AGPL-3.0 license](https://choosealicense.com/licenses/agpl-3.0/)
