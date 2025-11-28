#!/bin/bash

###############################################################################
# Complete Deployment Script for Hiyab Tutor (PM2 Deployment)
# Builds and deploys the entire application
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
echo "║      Hiyab Tutor Complete Deployment (PM2)                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check requirements
check_requirements() {
    echo "Checking requirements..."
    
    local missing=0
    
    if ! command -v go &> /dev/null; then
        echo -e "${RED}✗ Go is not installed${NC}"
        missing=1
    else
        echo -e "${GREEN}✓ Go installed${NC}"
    fi
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}✗ Node.js is not installed${NC}"
        missing=1
    else
        echo -e "${GREEN}✓ Node.js installed${NC}"
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}✗ npm is not installed${NC}"
        missing=1
    else
        echo -e "${GREEN}✓ npm installed${NC}"
    fi
    
    if ! command -v psql &> /dev/null; then
        echo -e "${YELLOW}⚠ PostgreSQL client not installed (optional)${NC}"
    else
        echo -e "${GREEN}✓ PostgreSQL client installed${NC}"
    fi
    
    if [ $missing -eq 1 ]; then
        echo -e "${RED}Please install missing requirements${NC}"
        exit 1
    fi
    
    # Install PM2 if not present
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}Installing PM2...${NC}"
        npm install -g pm2
        echo -e "${GREEN}✓ PM2 installed${NC}"
    else
        echo -e "${GREEN}✓ PM2 installed${NC}"
    fi
    
    echo ""
}

# Check .env file
check_env() {
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        echo -e "${RED}ERROR: .env file not found${NC}"
        echo ""
        echo "Please create .env file with your configuration:"
        echo -e "${YELLOW}cp .env.example .env${NC}"
        echo -e "${YELLOW}nano .env${NC}"
        echo ""
        exit 1
    fi
    echo -e "${GREEN}✓ Environment file found${NC}"
}

# Run build script
run_build() {
    echo ""
    echo -e "${BLUE}Running build script...${NC}"
    chmod +x "$SCRIPT_DIR/build.sh"
    "$SCRIPT_DIR/build.sh"
}

# Start services
start_services() {
    echo ""
    echo -e "${BLUE}Starting services...${NC}"
    chmod +x "$SCRIPT_DIR/start.sh"
    "$SCRIPT_DIR/start.sh"
}

# Main deployment
main() {
    check_requirements
    check_env
    run_build
    start_services
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗"
    echo "║          Deployment Complete!                              ║"
    echo "╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

main
