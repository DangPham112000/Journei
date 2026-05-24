#!/bin/bash

# Setup script for the Journey Planner app
# This script installs dependencies, generates GraphQL types, and builds both backend and frontend.
# It is intended to be used as a setup script for faster startups in new sessions.

echo "Installing dependencies..."
yarn install

echo "Generating GraphQL types..."
yarn generate

echo "Building backend..."
yarn build:backend

echo "Building frontend..."
yarn build:frontend

echo "Setup complete! The environment is ready."
