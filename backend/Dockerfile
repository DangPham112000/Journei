# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/

# Install dependencies using yarn workspace
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate GraphQL types and build the backend
WORKDIR /app/backend
RUN yarn generate
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY backend/package.json backend/

# Install only production dependencies
# Note: we install all dependencies and then prune them, or just install with --production
# But because of workspaces, it's easier to copy the built output and node_modules from builder
# Let's just copy the whole backend from builder to ensure it works properly with workspaces
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/backend /app/backend

WORKDIR /app/backend

EXPOSE 4000

# Start the application
CMD ["yarn", "start"]
