# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for node-gyp (sometimes required for some packages)
RUN apk add --no-cache python3 make g++

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/

# Install dependencies using yarn workspace
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate GraphQL types and build the frontend
WORKDIR /app/frontend
# Note: VITE_BASE_PATH is not strictly required if we use a subdomain,
# but if we wanted sub-path routing, we'd use it here.
# For subdomain routing, the default base '/' works perfectly.

ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

RUN yarn generate
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Add a custom nginx configuration to handle React Router (fallback to index.html)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
