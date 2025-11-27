#!/bin/bash

###############################################################################
# Quick Production Deployment Script
# Run this on your VPS to deploy the complete Hiyab Tutor platform
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Hiyab Tutor Quick Production Deploy               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo ""
    echo "Please create a .env file in the repository root."
    echo "You can copy from the example:"
    echo ""
    echo -e "${YELLOW}cp .env.production.example .env${NC}"
    echo -e "${YELLOW}nano .env${NC}"
    echo ""
    echo "Then configure the following required values:"
    echo "  - JWT_SECRET (generate with: openssl rand -base64 32)"
    echo "  - ADMIN_PASSWORD"
    echo "  - BLUEPRINT_DB_PASSWORD"
    echo "  - WEB_APP_URL (your VPS IP or domain)"
    exit 1
fi

echo -e "${BLUE}[1/6]${NC} Validating environment configuration..."

# Check required variables
REQUIRED_VARS=(
    "JWT_SECRET"
    "SERVER_PORT"
    "ADMIN_USERNAME"
    "ADMIN_PASSWORD"
    "BLUEPRINT_DB_HOST"
    "BLUEPRINT_DB_DATABASE"
    "BLUEPRINT_DB_USERNAME"
    "BLUEPRINT_DB_PASSWORD"
)

source .env
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}ERROR: Missing required environment variables:${NC}"
    printf '%s\n' "${MISSING_VARS[@]}"
    exit 1
fi

echo -e "${GREEN}✓ Environment validated${NC}"

echo -e "${BLUE}[2/6]${NC} Stopping existing containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
echo -e "${GREEN}✓ Containers stopped${NC}"

echo -e "${BLUE}[3/6]${NC} Building Docker images..."
echo "   This may take several minutes on first run..."

# Copy .env to backend for build
cp .env backend/.env

# Build all images
docker compose -f docker-compose.prod.yml build --no-cache

# Clean up
rm backend/.env

echo -e "${GREEN}✓ Images built successfully${NC}"

echo -e "${BLUE}[4/6]${NC} Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}✓ Services started${NC}"

echo -e "${BLUE}[5/6]${NC} Waiting for services to be healthy..."
echo "   This may take up to 60 seconds..."

# Wait for health checks
sleep 10

MAX_WAIT=60
ELAPSED=0
INTERVAL=5

while [ $ELAPSED -lt $MAX_WAIT ]; do
    UNHEALTHY=$(docker ps --filter "health=unhealthy" --filter "name=hiyab-" --format "{{.Names}}" | wc -l)
    STARTING=$(docker ps --filter "health=starting" --filter "name=hiyab-" --format "{{.Names}}" | wc -l)
    
    if [ "$UNHEALTHY" -eq 0 ] && [ "$STARTING" -eq 0 ]; then
        echo -e "${GREEN}✓ All services are healthy!${NC}"
        break
    fi
    
    echo "   Waiting for health checks... ($ELAPSED/$MAX_WAIT seconds)"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

echo -e "${BLUE}[6/6]${NC} Deployment Summary"
echo ""

# Get container status
docker ps --filter "name=hiyab-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗"
echo "║              Deployment Complete!                          ║"
echo "╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get VPS IP
VPS_IP=$(hostname -I | awk '{print $1}')

echo -e "${YELLOW}Access your application:${NC}"
echo ""
echo "  Frontend (Public Website):"
echo -e "    ${GREEN}http://${VPS_IP}${NC}"
echo ""
echo "  Admin Dashboard:"
echo -e "    ${GREEN}http://${VPS_IP}:3000${NC}"
echo "    Login with: $ADMIN_USERNAME"
echo ""
echo "  Backend API:"
echo -e "    ${GREEN}http://${VPS_IP}:8080${NC}"
echo ""
echo "  API Documentation (Swagger):"
echo -e "    ${GREEN}http://${VPS_IP}:8080/swagger/index.html${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo ""
echo "  View logs:"
echo "    docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "  Restart services:"
echo "    docker compose -f docker-compose.prod.yml restart"
echo ""
echo "  Stop all:"
echo "    docker compose -f docker-compose.prod.yml down"
echo ""
echo -e "${BLUE}For more information, see PRODUCTION_DEPLOYMENT.md${NC}"
echo ""
