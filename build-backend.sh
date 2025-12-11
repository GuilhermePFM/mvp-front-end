#!/bin/bash
# Build script for backend-api only with git hash-based cache busting

set -e

echo "Fetching latest git hash from mvp-api repository..."
export BACKEND_CACHEBUST=$(git ls-remote https://github.com/GuilhermePFM/mvp-api.git main | cut -f1)
echo "Backend API latest commit: $BACKEND_CACHEBUST"

echo ""
echo "Building backend-api..."
docker-compose build backend-api

