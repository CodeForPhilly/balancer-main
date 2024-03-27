# Use the official PostgreSQL 15 image as a parent image
FROM postgres:15

# Install build dependencies and update CA certificates
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    build-essential \
    postgresql-server-dev-15 \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Clone, build and install pgvector
RUN cd /tmp \
    && git clone --branch v0.6.1 https://github.com/pgvector/pgvector.git \
    && cd pgvector \
    && make \
    && make install

# Clean up unnecessary packages and files
RUN apt-get purge -y --auto-remove git build-essential postgresql-server-dev-15 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/pgvector

COPY init-vector-extension.sql /docker-entrypoint-initdb.d/
