# Use an official Python runtime as a parent image
FROM python:3.11.4-slim-buster

# Set work directory
WORKDIR /usr/src/server

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install system dependencies
RUN apt-get update && \
    apt-get install -y netcat && \
    apt-get install -y tesseract-ocr libtesseract-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# install Python dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt

# Copy project
COPY . /usr/src/server

# Correct line endings in entrypoint.sh and make it executable
RUN sed -i 's/\r$//' /usr/src/server/entrypoint.sh && chmod +x /usr/src/server/entrypoint.sh

# run entrypoint.sh
ENTRYPOINT ["/usr/src/server/entrypoint.sh"]
