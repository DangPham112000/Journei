# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for node-gyp
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json and pnpm lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate GraphQL types and build the backend
WORKDIR /app/backend
RUN pnpm generate
RUN pnpm build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm in production stage
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY backend/package.json backend/

# Copy built output and node_modules from builder
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/backend /app/backend

WORKDIR /app/backend

EXPOSE 4000

# Start the application
CMD ["pnpm", "start"]
