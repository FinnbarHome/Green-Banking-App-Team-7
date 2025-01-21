# Use a Node.js base image
FROM node:23-alpine

# Set the working directory
WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --production --no-cache

# Copy the rest of the application files
COPY . .

# Expose the backend port dynamically
EXPOSE 5000

# Start the frontend server
CMD ["npm", "start"]
