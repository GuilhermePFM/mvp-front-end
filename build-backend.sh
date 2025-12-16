#!/bin/bash
# Build script for backend services with git hash-based cache busting
#
# Usage:
#   ./build-backend.sh                    # Build all backend services
#   ./build-backend.sh backend-api        # Build only backend-api
#   ./build-backend.sh backend-api embeddings-worker   # Build multiple services
#   ./build-backend.sh --help             # Show help

set -e

# Enable Docker BuildKit for faster builds with pip cache persistence
# This makes subsequent builds 10-50x faster by caching pip downloads
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Available backend services
AVAILABLE_SERVICES=("backend-api" "embeddings-worker" "classification-worker")

# Function to show help
show_help() {
    echo ""
    echo "Usage: $0 [SERVICE...]"
    echo ""
    echo "Build backend services with automatic cache busting based on git hash."
    echo ""
    echo "Available services:"
    echo "  backend-api            - Main Flask API service"
    echo "  embeddings-worker      - Kafka embeddings worker"
    echo "  classification-worker  - Kafka classification worker"
    echo ""
    echo "Examples:"
    echo "  $0                              # Build all backend services"
    echo "  $0 backend-api                  # Build only backend-api"
    echo "  $0 backend-api embeddings-worker   # Build multiple services"
    echo ""
    echo "Options:"
    echo "  --help, -h   Show this help message"
    echo ""
    exit 0
}

# Function to validate service name
validate_service() {
    local service=$1
    for valid in "${AVAILABLE_SERVICES[@]}"; do
        if [ "$service" == "$valid" ]; then
            return 0
        fi
    done
    return 1
}

# Parse arguments
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    show_help
fi

# Determine which services to build
if [ $# -eq 0 ]; then
    # No arguments - build all
    SERVICES_TO_BUILD=("${AVAILABLE_SERVICES[@]}")
    echo -e "${BLUE}No services specified. Building all backend services...${NC}"
else
    # Validate all provided service names
    SERVICES_TO_BUILD=()
    for service in "$@"; do
        if validate_service "$service"; then
            SERVICES_TO_BUILD+=("$service")
        else
            echo -e "${YELLOW}Warning: Unknown service '$service'. Skipping.${NC}"
            echo "Available services: ${AVAILABLE_SERVICES[*]}"
        fi
    done
    
    # Exit if no valid services
    if [ ${#SERVICES_TO_BUILD[@]} -eq 0 ]; then
        echo "Error: No valid services specified."
        echo "Run '$0 --help' for usage information."
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Building Backend Services (with BuildKit caching)${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}⚡ BuildKit enabled - pip packages will be cached for faster builds${NC}"
echo ""

# Fetch git hash for cache busting
echo -e "${BLUE}📡 Fetching latest git hash from mvp-api repository...${NC}"
export BACKEND_CACHEBUST=$(git ls-remote https://github.com/GuilhermePFM/mvp-api.git main | cut -f1)
echo -e "${GREEN}✅ Backend API latest commit: $BACKEND_CACHEBUST${NC}"
echo ""

# Build each service
echo -e "${BLUE}🔨 Building services: ${SERVICES_TO_BUILD[*]}${NC}"
echo ""

for service in "${SERVICES_TO_BUILD[@]}"; do
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Building: $service${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    docker-compose build "$service"
    echo -e "${GREEN}✅ $service built successfully${NC}"
    echo ""
done

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Build Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  • Restart services: docker-compose up -d ${SERVICES_TO_BUILD[*]}"
echo "  • View logs: docker-compose logs -f ${SERVICES_TO_BUILD[*]}"
echo ""

