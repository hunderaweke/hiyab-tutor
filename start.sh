#!/bin/bash

###############################################################################
# Start Script for Hiyab Tutor (PM2 Deployment)
# Starts all services using PM2
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Hiyab Tutor Start Script                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 is not installed. Installing globally...${NC}"
    npm install -g pm2
fi

# Check if built files exist
check_builds() {
    local missing=0
    
    if [ ! -f "$SCRIPT_DIR/backend/bin/hiyab-api" ]; then
        echo -e "${RED}✗ Backend binary not found${NC}"
        missing=1
    fi
    
    if [ ! -d "$SCRIPT_DIR/frontend/dist" ]; then
        echo -e "${RED}✗ Frontend build not found${NC}"
        missing=1
    fi
    
    if [ ! -d "$SCRIPT_DIR/dashboard/dist" ]; then
        echo -e "${RED}✗ Dashboard build not found${NC}"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        echo ""
        echo -e "${YELLOW}Run ./build.sh first to build all components${NC}"
        exit 1
    fi
}

# Check PostgreSQL
check_postgres() {
    echo "Checking PostgreSQL..."
    
    if ! command -v psql &> /dev/null; then
        echo -e "${YELLOW}WARNING: PostgreSQL client not found. Skipping database check.${NC}"
        return
    fi
    
    # Source .env to get DB credentials
    if [ -f "$SCRIPT_DIR/.env" ]; then
        source "$SCRIPT_DIR/.env"
        
        # Try to connect to PostgreSQL
        if PGPASSWORD="$BLUEPRINT_DB_PASSWORD" psql -h "${BLUEPRINT_DB_HOST:-localhost}" \
            -U "${BLUEPRINT_DB_USERNAME:-postgres}" \
            -d "${BLUEPRINT_DB_DATABASE:-hiyab_tutor}" \
            -c "SELECT 1;" &> /dev/null; then
            echo -e "${GREEN}✓ PostgreSQL is running and accessible${NC}"
        else
            echo -e "${YELLOW}WARNING: Cannot connect to PostgreSQL${NC}"
            echo "  Make sure PostgreSQL is running and credentials in .env are correct"
        fi
    fi
}

echo "Checking build files..."
check_builds
echo -e "${GREEN}✓ All build files present${NC}"

check_postgres

# Stop existing PM2 processes
echo ""
echo "Stopping existing processes..."
pm2 delete ecosystem.config.js 2>/dev/null || true

# Start with PM2
echo ""
echo "Starting all services with PM2..."
cd "$SCRIPT_DIR"
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗"
echo "║              Services Started!                             ║"
echo "╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Show status
pm2 status

echo ""
echo -e "${YELLOW}Access your application:${NC}"
echo "  Backend API:    ${GREEN}http://localhost:8080${NC}"
echo "  Frontend:       ${GREEN}http://localhost:4000${NC}"
echo "  Dashboard:      ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Useful PM2 commands:${NC}"
echo "  View logs:      ${BLUE}pm2 logs${NC}"
echo "  View status:    ${BLUE}pm2 status${NC}"
echo "  Restart all:    ${BLUE}pm2 restart ecosystem.config.js${NC}"
echo "  Stop all:       ${BLUE}pm2 stop ecosystem.config.js${NC}"
echo "  Monitor:        ${BLUE}pm2 monit${NC}"
echo ""
