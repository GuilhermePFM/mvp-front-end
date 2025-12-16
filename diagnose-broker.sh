#!/bin/bash

# ============================================================================
# Kafka Broker Health Check Diagnostic Script
# ============================================================================
# This script helps diagnose why the Kafka broker container is unhealthy
# 
# Usage: ./diagnose-broker.sh
# ============================================================================

set -e

BROKER_CONTAINER="broker"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "============================================================================"
echo "🔍 Kafka Broker Health Check Diagnostics"
echo "============================================================================"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to print status
print_status() {
    if [ "$1" == "OK" ]; then
        echo -e "${GREEN}✅ $2${NC}"
    elif [ "$1" == "WARN" ]; then
        echo -e "${YELLOW}⚠️  $2${NC}"
    elif [ "$1" == "ERROR" ]; then
        echo -e "${RED}❌ $2${NC}"
    else
        echo -e "ℹ️  $2"
    fi
}

# ============================================================================
# 1. Check if broker container exists
# ============================================================================
print_section "1. Container Existence Check"

if docker ps -a --format '{{.Names}}' | grep -q "^${BROKER_CONTAINER}$"; then
    print_status "OK" "Broker container exists"
    
    # Check if running
    if docker ps --format '{{.Names}}' | grep -q "^${BROKER_CONTAINER}$"; then
        print_status "OK" "Broker container is running"
    else
        print_status "ERROR" "Broker container exists but is NOT running"
        echo ""
        echo "Container status:"
        docker ps -a --filter "name=${BROKER_CONTAINER}" --format "table {{.Names}}\t{{.Status}}\t{{.State}}"
        exit 1
    fi
else
    print_status "ERROR" "Broker container does not exist"
    echo ""
    echo "Please start your Docker Compose services first:"
    echo "  docker-compose up -d"
    exit 1
fi

# ============================================================================
# 2. Check container health status
# ============================================================================
print_section "2. Health Check Status"

HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' ${BROKER_CONTAINER} 2>/dev/null || echo "no-healthcheck")

case $HEALTH_STATUS in
    "healthy")
        print_status "OK" "Container is HEALTHY"
        ;;
    "unhealthy")
        print_status "ERROR" "Container is UNHEALTHY"
        ;;
    "starting")
        print_status "WARN" "Container is STARTING (health checks not yet passing)"
        ;;
    "no-healthcheck")
        print_status "WARN" "No health check configured"
        ;;
    *)
        print_status "WARN" "Unknown health status: $HEALTH_STATUS"
        ;;
esac

# ============================================================================
# 3. Show detailed health check information
# ============================================================================
print_section "3. Health Check Details"

echo "Health check configuration and recent results:"
echo ""
docker inspect ${BROKER_CONTAINER} | jq '.[0].State.Health // "No health check data"' 2>/dev/null || \
    docker inspect ${BROKER_CONTAINER} | grep -A 20 '"Health"' || \
    echo "Could not retrieve health check details"

# ============================================================================
# 4. Test health check command manually
# ============================================================================
print_section "4. Manual Health Check Test"

echo "Attempting to run the health check command manually inside the container..."
echo ""

if docker exec ${BROKER_CONTAINER} /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list 2>&1; then
    print_status "OK" "Manual health check command succeeded"
else
    print_status "ERROR" "Manual health check command failed (see output above)"
fi

# ============================================================================
# 5. Check if Kafka port is listening
# ============================================================================
print_section "5. Port Availability Check"

echo "Checking if Kafka is listening on port 9092..."
echo ""

if docker exec ${BROKER_CONTAINER} bash -c "command -v nc >/dev/null 2>&1 && nc -z localhost 9092" 2>/dev/null; then
    print_status "OK" "Port 9092 is listening"
elif docker exec ${BROKER_CONTAINER} bash -c "command -v netstat >/dev/null 2>&1 && netstat -tln | grep 9092" >/dev/null 2>&1; then
    print_status "OK" "Port 9092 is listening (verified via netstat)"
else
    print_status "WARN" "Could not verify if port 9092 is listening (netcat/netstat not available)"
fi

# ============================================================================
# 6. Show recent broker logs
# ============================================================================
print_section "6. Recent Broker Logs (last 50 lines)"

echo "Last 50 log lines from the broker:"
echo ""
docker logs --tail 50 ${BROKER_CONTAINER} 2>&1

# ============================================================================
# 7. Check for common issues
# ============================================================================
print_section "7. Common Issue Detection"

echo "Checking for common error patterns in logs..."
echo ""

ERROR_COUNT=$(docker logs ${BROKER_CONTAINER} 2>&1 | grep -i "error" | wc -l)
EXCEPTION_COUNT=$(docker logs ${BROKER_CONTAINER} 2>&1 | grep -i "exception" | wc -l)
FATAL_COUNT=$(docker logs ${BROKER_CONTAINER} 2>&1 | grep -i "fatal" | wc -l)

if [ "$ERROR_COUNT" -gt 0 ]; then
    print_status "WARN" "Found $ERROR_COUNT lines with 'ERROR' in logs"
fi

if [ "$EXCEPTION_COUNT" -gt 0 ]; then
    print_status "WARN" "Found $EXCEPTION_COUNT lines with 'EXCEPTION' in logs"
fi

if [ "$FATAL_COUNT" -gt 0 ]; then
    print_status "ERROR" "Found $FATAL_COUNT lines with 'FATAL' in logs"
fi

if [ "$ERROR_COUNT" -eq 0 ] && [ "$EXCEPTION_COUNT" -eq 0 ] && [ "$FATAL_COUNT" -eq 0 ]; then
    print_status "OK" "No obvious error patterns found in logs"
fi

# ============================================================================
# 8. Resource usage
# ============================================================================
print_section "8. Container Resource Usage"

echo "Current resource consumption:"
echo ""
docker stats ${BROKER_CONTAINER} --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

# ============================================================================
# 9. Recommendations
# ============================================================================
print_section "9. Troubleshooting Recommendations"

if [ "$HEALTH_STATUS" == "unhealthy" ]; then
    echo "The broker is unhealthy. Try the following:"
    echo ""
    echo "1. Check the logs above for specific error messages"
    echo "2. Increase health check timeouts in docker-compose.yml:"
    echo "     timeout: 10s"
    echo "     start_period: 60s"
    echo "     retries: 10"
    echo ""
    echo "3. For WSL2, ensure adequate resources are allocated:"
    echo "   - Edit ~/.wslconfig"
    echo "   - Set memory=4GB or higher"
    echo "   - Set processors=2 or higher"
    echo ""
    echo "4. Restart the broker:"
    echo "     docker-compose restart broker"
    echo ""
    echo "5. If issues persist, do a clean restart:"
    echo "     docker-compose down"
    echo "     docker-compose up -d"
    echo ""
elif [ "$HEALTH_STATUS" == "starting" ]; then
    echo "The broker is still starting. This is normal during initialization."
    echo ""
    echo "If it stays in 'starting' state for more than 2 minutes:"
    echo "1. Check if the start_period is sufficient (should be 60s+)"
    echo "2. Monitor logs: docker logs -f broker"
    echo "3. Check resource availability on your system"
    echo ""
elif [ "$HEALTH_STATUS" == "healthy" ]; then
    echo "The broker is healthy! No issues detected."
    echo ""
    echo "If you're still experiencing problems with dependent services,"
    echo "check their logs individually:"
    echo "  docker-compose logs <service-name>"
    echo ""
else
    echo "Unable to determine broker health status."
    echo "Please ensure Docker Compose services are running."
    echo ""
fi

# ============================================================================
# End of diagnostics
# ============================================================================
echo ""
echo "============================================================================"
echo "🏁 Diagnostics Complete"
echo "============================================================================"
echo ""

