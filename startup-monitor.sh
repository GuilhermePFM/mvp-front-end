#!/bin/bash

# ============================================================================
# Docker Compose Startup Monitor
# ============================================================================
# Monitors Docker Compose startup and provides clear visual feedback
# Shows which services are ready and when the system is fully operational
#
# Usage: ./startup-monitor.sh
# ============================================================================

set -e

# Configuration
PROJECT_NAME="finance"
CHECK_INTERVAL=2

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Service order (dependency order)
SERVICES=(
    "broker"
    "kafka-init"
    "embedding-api"
    "backend-api"
    "embeddings-worker"
    "classification-worker"
    "frontend"
)

# Service display names
declare -A SERVICE_NAMES=(
    ["broker"]="Kafka Broker"
    ["kafka-init"]="Kafka Topics"
    ["embedding-api"]="Embedding API"
    ["backend-api"]="Backend API"
    ["embeddings-worker"]="Embeddings Worker"
    ["classification-worker"]="Classification Worker"
    ["frontend"]="Frontend (Nginx)"
)

# Container names
declare -A CONTAINER_NAMES=(
    ["broker"]="broker"
    ["kafka-init"]="kafka-init"
    ["embedding-api"]="finance-embedding"
    ["backend-api"]="finance-backend"
    ["embeddings-worker"]="finance-embeddings-worker"
    ["classification-worker"]="finance-classification-worker"
    ["frontend"]="finance-frontend"
)

# Track service states
declare -A SERVICE_STATUS
declare -A SERVICE_HEALTH

# Function to clear screen and move cursor to top
clear_screen() {
    printf "\033[2J\033[H"
}

# Function to get timestamp
get_timestamp() {
    date '+%H:%M:%S'
}

# Function to get service status
get_service_status() {
    local container=$1
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${container}$"; then
        echo "running"
    elif docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q "^${container}$"; then
        local state=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null)
        echo "$state"
    else
        echo "not-started"
    fi
}

# Function to get health status
get_health_status() {
    local container=$1
    local status=$(get_service_status "$container")
    
    # Special handling for kafka-init (no health check, check exit code)
    # Must check BEFORE the running status check since kafka-init exits after completion
    if [ "$container" == "kafka-init" ]; then
        local exit_code=$(docker inspect --format='{{.State.ExitCode}}' "$container" 2>/dev/null || echo "1")
        if [ "$exit_code" == "0" ]; then
            echo "completed"
        else
            echo "running"
        fi
        return
    fi
    
    if [ "$status" != "running" ]; then
        echo "n/a"
        return
    fi
    
    local health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container" 2>/dev/null || echo "none")
    
    echo "$health"
}

# Function to render status icon and text
render_status() {
    local status=$1
    local health=$2
    
    case "$status" in
        "not-started")
            echo -e "${GRAY}⚪ Waiting...${NC}"
            ;;
        "created")
            echo -e "${BLUE}🔵 Created${NC}"
            ;;
        "running")
            case "$health" in
                "healthy")
                    echo -e "${GREEN}✅ Ready${NC}"
                    ;;
                "starting")
                    echo -e "${YELLOW}⏳ Starting...${NC}"
                    ;;
                "unhealthy")
                    echo -e "${RED}❌ Unhealthy${NC}"
                    ;;
                "completed")
                    echo -e "${GREEN}✅ Completed${NC}"
                    ;;
                "none")
                    echo -e "${GREEN}🟢 Running${NC}"
                    ;;
                *)
                    echo -e "${CYAN}🔄 Initializing${NC}"
                    ;;
            esac
            ;;
        "exited")
            # Check exit code
            local container=$3
            local exit_code=$(docker inspect --format='{{.State.ExitCode}}' "$container" 2>/dev/null || echo "1")
            if [ "$exit_code" == "0" ]; then
                echo -e "${GREEN}✅ Completed${NC}"
            else
                echo -e "${RED}❌ Failed (exit $exit_code)${NC}"
            fi
            ;;
        "restarting")
            echo -e "${YELLOW}🔄 Restarting${NC}"
            ;;
        *)
            echo -e "${GRAY}❓ Unknown${NC}"
            ;;
    esac
}

# Function to check if service is ready
is_service_ready() {
    local status=$1
    local health=$2
    local container=$3
    
    # kafka-init is ready when exited with code 0
    if [ "$container" == "kafka-init" ]; then
        [ "$health" == "completed" ] && return 0 || return 1
    fi
    
    # Services without health checks are ready when running
    if [ "$health" == "none" ]; then
        [ "$status" == "running" ] && return 0 || return 1
    fi
    
    # Services with health checks are ready when healthy
    [ "$health" == "healthy" ] && return 0 || return 1
}

# Function to display startup progress
display_progress() {
    local timestamp=$(get_timestamp)
    local ready_count=0
    local total_count=${#SERVICES[@]}
    
    clear_screen
    
    # Header
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BOLD}${BLUE}🚀 Controle Financeiro - Startup Monitor${NC}                       ${CYAN}║${NC}"
    echo -e "${CYAN}╠════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  Time: ${timestamp}                                                    ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Service status table
    printf "${BOLD}%-5s %-30s %-35s${NC}\n" "STEP" "SERVICE" "STATUS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    for i in "${!SERVICES[@]}"; do
        local service="${SERVICES[$i]}"
        local container="${CONTAINER_NAMES[$service]}"
        local name="${SERVICE_NAMES[$service]}"
        local step=$((i + 1))
        
        local status=$(get_service_status "$container")
        local health=$(get_health_status "$container")
        local status_display=$(render_status "$status" "$health" "$container")
        
        SERVICE_STATUS[$service]=$status
        SERVICE_HEALTH[$service]=$health
        
        if is_service_ready "$status" "$health" "$container"; then
            ((ready_count++))
            printf "${GREEN}%-5s${NC} %-30s %b\n" "[$step/$total_count]" "$name" "$status_display"
        else
            printf "${GRAY}%-5s${NC} %-30s %b\n" "[$step/$total_count]" "$name" "$status_display"
        fi
    done
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Progress bar
    local progress=$((ready_count * 100 / total_count))
    local bar_width=50
    local filled=$((progress * bar_width / 100))
    local empty=$((bar_width - filled))
    
    echo -n "Progress: ["
    printf "${GREEN}%${filled}s${NC}" | tr ' ' '█'
    printf "${GRAY}%${empty}s${NC}" | tr ' ' '░'
    echo -n "] "
    printf "${BOLD}%d%%${NC} " "$progress"
    echo "($ready_count/$total_count services ready)"
    echo ""
    
    # Status message
    if [ $ready_count -eq $total_count ]; then
        echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}${BOLD}✨ SYSTEM READY! ✨${NC}"
        echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${GREEN}🌐 Frontend:${NC}      http://localhost:8080"
        echo -e "${GREEN}🔧 Backend API:${NC}   http://localhost:5000"
        echo -e "${GREEN}🤖 Embedding API:${NC} http://localhost:5001"
        echo ""
        return 0
    else
        # Find next service to start
        for service in "${SERVICES[@]}"; do
            local container="${CONTAINER_NAMES[$service]}"
            local status="${SERVICE_STATUS[$service]}"
            local health="${SERVICE_HEALTH[$service]}"
            
            if ! is_service_ready "$status" "$health" "$container"; then
                echo -e "${YELLOW}⏳ Waiting for: ${SERVICE_NAMES[$service]}...${NC}"
                break
            fi
        done
        echo ""
        echo -e "${GRAY}Press Ctrl+C to stop monitoring${NC}"
        return 1
    fi
}

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}👋 Monitoring stopped${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    exit 0
}

# Set up trap for clean exit
trap cleanup INT TERM

# Main monitoring loop
echo -e "${BLUE}🚀 Starting startup monitor...${NC}"
echo -e "${GRAY}Monitoring Docker Compose services...${NC}"
echo ""
sleep 2

while true; do
    if display_progress; then
        # System is ready, wait a bit and show final message
        sleep 3
        echo ""
        echo -e "${CYAN}Monitoring will continue. Press Ctrl+C to stop.${NC}"
        echo ""
        
        # Continue monitoring but less frequently
        while true; do
            sleep 5
            # Just check if anything becomes unhealthy
            for service in "${SERVICES[@]}"; do
                container="${CONTAINER_NAMES[$service]}"
                status=$(get_service_status "$container")
                health=$(get_health_status "$container")
                
                if [ "$status" == "running" ] && [ "$health" == "unhealthy" ]; then
                    echo -e "${RED}⚠️  WARNING: ${SERVICE_NAMES[$service]} became unhealthy!${NC}"
                    echo -e "${RED}   Run './diagnose-broker.sh' for diagnostics${NC}"
                fi
            done
        done
    fi
    sleep $CHECK_INTERVAL
done

