#!/bin/bash

# Setup script for the Journey Planner app
# This script installs dependencies, generates GraphQL types, and builds both backend and frontend.
# It is intended to be used by Jules as a setup script for faster startups in new sessions.

echo "Installing pnpm..."
corepack enable && corepack prepare pnpm@latest --activate

echo "Installing dependencies..."
pnpm install

echo "Generating GraphQL types..."
pnpm generate

echo "Building backend..."
pnpm build:backend

echo "Building frontend..."
pnpm build:frontend

echo "Setup complete! The environment is ready."
