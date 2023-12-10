FROM python:3.11-slim-buster
ENV PYTHONUNBUFFERED=1
WORKDIR /backend

COPY requirements.txt /backend/
RUN pip install -r requirements.txt

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . /backend/