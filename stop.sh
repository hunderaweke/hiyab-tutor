#!/bin/bash

###############################################################################
# Stop Script for Hiyab Tutor (PM2 Deployment)
# Stops all PM2 services
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Stopping all Hiyab Tutor services...${NC}"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}PM2 is not installed${NC}"
    exit 1
fi

# Stop all processes
pm2 stop ecosystem.config.js

echo -e "${GREEN}✓ All services stopped${NC}"
echo ""
echo "To view status: ${BLUE}pm2 status${NC}"
echo "To start again: ${BLUE}./start.sh${NC}"
echo "To delete processes: ${BLUE}pm2 delete ecosystem.config.js${NC}"
