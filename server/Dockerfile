FROM python:3.11.4-slim-bullseye

# set work directory
WORKDIR /usr/src/server

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install system dependencies
RUN apt-get update && apt-get install -y netcat

# install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install --timeout=600 --retries=5 -r requirements.txt


# copy project
COPY . /usr/src/server

# Correct line endings in entrypoint.sh and make it executable
RUN sed -i 's/\r$//' /usr/src/server/entrypoint.sh && chmod +x /usr/src/server/entrypoint.sh

# run entrypoint.sh
ENTRYPOINT ["/usr/src/server/entrypoint.sh"]