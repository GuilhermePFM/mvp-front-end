#!/bin/bash
# Build script with automatic cache busting for backend-api and embedding-api
# This ensures the latest code is always fetched from the git repositories

export CACHEBUST=$(date +%s)
echo "Building with CACHEBUST=$CACHEBUST"
docker-compose build backend-api embedding-api

