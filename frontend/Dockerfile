# Use the official Node.js 14 image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Expose a port if required
EXPOSE 3000

# Start the application
CMD [ "npm", "run", "dev" ]

# Set the image name
ARG IMAGE_NAME
ENV IMAGE_NAME $IMAGE_NAME