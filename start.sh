#!/bin/bash

# ============================================================================
# Controle Financeiro - Easy Start Script
# ============================================================================
# Starts Docker Compose with visual startup monitoring
#
# Usage: 
#   ./start.sh              # Start with default settings
#   ./start.sh --wsl2       # Start with WSL2 optimizations
#   ./start.sh --build      # Rebuild containers before starting
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Parse arguments
USE_WSL2=false
BUILD=false

for arg in "$@"; do
    case $arg in
        --wsl2)
            USE_WSL2=true
            shift
            ;;
        --build)
            BUILD=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./start.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --wsl2    Use WSL2-optimized settings (extended timeouts)"
            echo "  --build   Rebuild containers before starting"
            echo "  --help    Show this help message"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $arg${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Display banner
clear
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}          ${BOLD}${BLUE}💰 Controle Financeiro - Sistema de Gestão${NC}                ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                                        ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo ""
    echo "Creating .env from env.example..."
    if [ -f env.example ]; then
        cp env.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env and add your API keys before continuing${NC}"
        echo ""
        read -p "Press Enter to continue or Ctrl+C to exit..."
    else
        echo -e "${RED}❌ env.example not found. Please create .env manually${NC}"
        exit 1
    fi
fi

# Determine compose command
COMPOSE_CMD="docker-compose"
if $USE_WSL2; then
    echo -e "${BLUE}🐧 Using WSL2-optimized configuration${NC}"
    COMPOSE_CMD="docker-compose -f docker-compose.yml -f docker-compose.wsl2.yml"
else
    echo -e "${BLUE}🐳 Using standard configuration${NC}"
fi

# Build if requested
if $BUILD; then
    echo -e "${BLUE}🔨 Building containers...${NC}"
    echo ""
    $COMPOSE_CMD build
    echo ""
    echo -e "${GREEN}✅ Build complete${NC}"
    echo ""
fi

# Start services
echo -e "${BLUE}🚀 Starting Docker Compose services...${NC}"
echo ""
echo -e "${GRAY}This will start all services in detached mode${NC}"
echo -e "${GRAY}Startup monitoring will begin in a moment...${NC}"
echo ""

# Start in detached mode
$COMPOSE_CMD up -d

echo ""
echo -e "${GREEN}✅ Docker Compose services started${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}📊 Starting Startup Monitor...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

sleep 2

# Run startup monitor
./startup-monitor.sh

