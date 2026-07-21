# Dockerfile
# Stage 1: Build compilation
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm ci

# Copy full source and build assets
COPY . .
RUN npm run build

# Stage 2: Minimal production container
FROM node:20-alpine

WORKDIR /app

# Only copy production packages
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Configure runtime environments
ENV NODE_ENV=production
EXPOSE 3000

# Default entrypoint (can be overridden in docker-compose.yml)
CMD ["node", "dist/server.cjs"]
