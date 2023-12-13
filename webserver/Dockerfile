FROM node:alpine3.17 as build

WORKDIR /server/frontend
COPY ./server/frontend/package.json ./
COPY ./server/frontend/package-lock.json ./
RUN npm install
COPY ./server/frontend ./
RUN npm run build

FROM nginx:latest

COPY ./webserver/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /server/frontend/dist /usr/share/nginx/html

