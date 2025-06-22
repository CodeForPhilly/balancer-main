#!/bin/bash

cd frontend

## Frontend

npm run i && npm run build

cd ..

docker compose -f docker-compose.prod.yml up --build # This is generating balancer-backend:latest image

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

echo "$CR_PAT" | docker login ghcr.io -u TineoC --password-stdin

docker tag balancer-backend:latest ghcr.io/codeforphilly/balancer-main/backend:latest .

docker tag balancer-backend:latest chrissst/balancer:latest

docker push chrissst/balancer:latest