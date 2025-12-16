#!/bin/bash

# ============================================================================
# Docker Compose Health Status Monitor
# ============================================================================
# Real-time monitoring of all container health statuses
# Alerts when health status changes occur
#
# Usage: ./monitor-health.sh [interval]
#   interval: Check interval in seconds (default: 5)
#
# Example:
#   ./monitor-health.sh 3    # Check every 3 seconds
# ============================================================================

set -e

# Configuration
CHECK_INTERVAL=${1:-5}
PROJECT_NAME="finance"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Icons
ICON_HEALTHY="✅"
ICON_UNHEALTHY="❌"
ICON_STARTING="⏳"
ICON_NONE="⚪"
ICON_RUNNING="🟢"
ICON_STOPPED="🔴"
ICON_EXITED="💤"

# Store previous states
declare -A PREV_HEALTH_STATUS
declare -A PREV_CONTAINER_STATUS
FIRST_RUN=true

# Function to clear screen and move cursor to top
clear_screen() {
    printf "\033[2J\033[H"
}

# Function to get timestamp
get_timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# Function to get health status with color
get_health_display() {
    local status=$1
    case $status in
        "healthy")
            echo -e "${GREEN}${ICON_HEALTHY} HEALTHY${NC}"
            ;;
        "unhealthy")
            echo -e "${RED}${ICON_UNHEALTHY} UNHEALTHY${NC}"
            ;;
        "starting")
            echo -e "${YELLOW}${ICON_STARTING} STARTING${NC}"
            ;;
        "none")
            echo -e "${GRAY}${ICON_NONE} NO CHECK${NC}"
            ;;
        *)
            echo -e "${GRAY}${ICON_NONE} UNKNOWN${NC}"
            ;;
    esac
}

# Function to get container status with color
get_status_display() {
    local status=$1
    case $status in
        "running")
            echo -e "${GREEN}${ICON_RUNNING} RUNNING${NC}"
            ;;
        "exited")
            echo -e "${RED}${ICON_STOPPED} EXITED${NC}"
            ;;
        "restarting")
            echo -e "${YELLOW}🔄 RESTARTING${NC}"
            ;;
        "paused")
            echo -e "${CYAN}⏸️  PAUSED${NC}"
            ;;
        "dead")
            echo -e "${RED}💀 DEAD${NC}"
            ;;
        "created")
            echo -e "${BLUE}🆕 CREATED${NC}"
            ;;
        *)
            echo -e "${GRAY}❓ UNKNOWN${NC}"
            ;;
    esac
}

# Function to check and display container statuses
check_containers() {
    local timestamp=$(get_timestamp)
    local containers=$(docker ps -a --filter "name=${PROJECT_NAME}" --format "{{.Names}}" | sort)
    
    if [ -z "$containers" ]; then
        echo -e "${YELLOW}⚠️  No containers found matching project name '${PROJECT_NAME}'${NC}"
        echo ""
        echo "Make sure your Docker Compose services are running:"
        echo "  docker-compose up -d"
        return
    fi
    
    # Print header
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}🏥 Docker Container Health Monitor${NC}                               ${CYAN}║${NC}"
    echo -e "${CYAN}╠════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  Timestamp: ${timestamp}                                  ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  Interval: ${CHECK_INTERVAL}s                                                  ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    printf "%-35s %-25s %-25s\n" "CONTAINER" "STATUS" "HEALTH"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local changes_detected=false
    local unhealthy_count=0
    local healthy_count=0
    local starting_count=0
    
    for container in $containers; do
        # Get container status
        local container_status=$(docker inspect --format='{{.State.Status}}' $container 2>/dev/null || echo "unknown")
        
        # Get health status
        local health_status=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' $container 2>/dev/null || echo "none")
        
        # Track changes
        if [ "$FIRST_RUN" = false ]; then
            if [ "${PREV_HEALTH_STATUS[$container]}" != "$health_status" ] || [ "${PREV_CONTAINER_STATUS[$container]}" != "$container_status" ]; then
                changes_detected=true
            fi
        fi
        
        # Update counts
        case $health_status in
            "healthy") ((healthy_count++)) ;;
            "unhealthy") ((unhealthy_count++)) ;;
            "starting") ((starting_count++)) ;;
        esac
        
        # Store current state
        PREV_HEALTH_STATUS[$container]=$health_status
        PREV_CONTAINER_STATUS[$container]=$container_status
        
        # Display status
        local status_display=$(get_status_display "$container_status")
        local health_display=$(get_health_display "$health_status")
        
        printf "%-35s " "$container"
        printf "%-25b " "$status_display"
        printf "%-25b\n" "$health_display"
    done
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Summary
    echo ""
    echo -e "${BLUE}📊 Summary:${NC}"
    echo -e "   ${GREEN}${ICON_HEALTHY} Healthy:${NC} $healthy_count"
    echo -e "   ${YELLOW}${ICON_STARTING} Starting:${NC} $starting_count"
    echo -e "   ${RED}${ICON_UNHEALTHY} Unhealthy:${NC} $unhealthy_count"
    
    # Alert on changes
    if [ "$changes_detected" = true ]; then
        echo ""
        echo -e "${YELLOW}⚡ STATUS CHANGE DETECTED!${NC}"
        
        # Play bell if terminal supports it
        echo -ne '\007'
    fi
    
    # Warnings
    if [ $unhealthy_count -gt 0 ]; then
        echo ""
        echo -e "${RED}⚠️  WARNING: $unhealthy_count container(s) are unhealthy!${NC}"
        echo -e "${RED}   Run './diagnose-broker.sh' for detailed diagnostics${NC}"
    fi
    
    echo ""
    echo -e "${GRAY}Press Ctrl+C to stop monitoring${NC}"
    
    FIRST_RUN=false
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
echo -e "${BLUE}🚀 Starting health monitor...${NC}"
echo ""
sleep 1

while true; do
    clear_screen
    check_containers
    sleep $CHECK_INTERVAL
done

