#!/bin/bash
# Build script with git hash-based cache busting for backend-api and embedding-api
# Only rebuilds when the remote git repositories have new commits

set -e

echo "Fetching latest git hashes from remote repositories..."
./build-backend.sh
./build-embedding.sh