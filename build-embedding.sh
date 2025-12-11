#!/bin/bash
# Build script for embedding-api only with git hash-based cache busting

set -e

echo "Fetching latest git hash from mvp-embedding repository..."
export EMBEDDING_CACHEBUST=$(git ls-remote https://github.com/GuilhermePFM/mvp-embedding.git main | cut -f1)
echo "Embedding API latest commit: $EMBEDDING_CACHEBUST"

echo ""
echo "Building embedding-api..."
docker-compose build embedding-api

