# pull official base image
FROM python:3.11.4-slim-buster

# set work directory
WORKDIR /usr/src/server

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 0

# install system dependencies
RUN apt-get update && apt-get install -y netcat

# install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt

RUN pip install spacy && python -m spacy download en_core_web_sm

# copy project
COPY . /usr/src/app

# Correct line endings in entrypoint.sh and make it executable
RUN sed -i 's/\r$//' /usr/src/app/entrypoint.sh && chmod +x /usr/src/app/entrypoint.sh

# run entrypoint.sh
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
