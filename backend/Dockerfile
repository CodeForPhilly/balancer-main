FROM python:3.10

WORKDIR /balancer

COPY pyproject.toml poetry.lock /balancer/
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-dev --no-interaction

COPY . /balancer/

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

ARG IMAGE_NAME
ENV IMAGE_NAME $IMAGE_NAME