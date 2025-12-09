#!/bin/bash

###############################################################################
# Build Script for Hiyab Tutor (Manual/PM2 Deployment)
# This script builds all components of the application
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
echo "║         Hiyab Tutor Build Script                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if .env exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo -e "${YELLOW}WARNING: .env file not found. Creating from example...${NC}"
    if [ -f "$SCRIPT_DIR/.env.example" ]; then
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
        echo -e "${YELLOW}Please edit .env file with your configuration${NC}"
    fi
fi

# Build Backend
build_backend() {
    echo -e "${BLUE}[1/3]${NC} Building Go Backend..."
    
    cd "$SCRIPT_DIR/backend"
    
    # Create bin directory
    mkdir -p bin
    
    # Install swag for documentation
    if ! command -v swag &> /dev/null; then
        echo "   Installing swag..."
        go install github.com/swaggo/swag/cmd/swag@latest
    fi
    
    # Generate swagger docs
    echo "   Generating Swagger documentation..."
    swag init -g cmd/api/main.go -o docs
    
    # Build the binary
    echo "   Compiling Go binary..."
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o bin/hiyab-api cmd/api/main.go
    
    # Make it executable
    chmod +x bin/hiyab-api
    
    echo -e "${GREEN}✓ Backend built successfully${NC}"
    echo "   Binary: backend/bin/hiyab-api"
    
    cd "$SCRIPT_DIR"
}

# Build Frontend
build_frontend() {
    echo -e "${BLUE}[2/3]${NC} Building React Frontend..."
    
    cd "$SCRIPT_DIR/frontend"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "   Installing dependencies..."
        npm install
    fi
    
    # Build production bundle
    echo "   Building production bundle..."
    npm run build
    
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
    echo "   Build output: frontend/dist"
    
    cd "$SCRIPT_DIR"
}

# Build Dashboard
build_dashboard() {
    echo -e "${BLUE}[3/3]${NC} Building React Dashboard..."
    
    cd "$SCRIPT_DIR/dashboard"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "   Installing dependencies..."
        npm install
    fi
    
    # Build production bundle
    echo "   Building production bundle..."
    npm run build
    
    echo -e "${GREEN}✓ Dashboard built successfully${NC}"
    echo "   Build output: dashboard/dist"
    
    cd "$SCRIPT_DIR"
}

# Create logs directory
setup_logs() {
    echo "Setting up logs directory..."
    mkdir -p "$SCRIPT_DIR/logs"
    echo -e "${GREEN}✓ Logs directory created${NC}"
}

# Main build process
main() {
    # Add Go to PATH if it exists in /usr/local/go/bin
    if [ -f "/usr/local/go/bin/go" ]; then
        export PATH=$PATH:/usr/local/go/bin
        export GOPATH=$HOME/go
        export PATH=$PATH:$GOPATH/bin
    fi
    
    # Check for required tools
    echo "Checking requirements..."
    
    if ! command -v go &> /dev/null; then
        echo -e "${RED}ERROR: Go is not installed${NC}"
        echo -e "${YELLOW}If you just ran setup-vps-pm2.sh, reload your shell:${NC}"
        echo -e "${YELLOW}  source ~/.bashrc${NC}"
        echo -e "${YELLOW}Or add Go to PATH:${NC}"
        echo -e "${YELLOW}  export PATH=\$PATH:/usr/local/go/bin${NC}"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}ERROR: Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}ERROR: npm is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All requirements met${NC}"
    echo ""
    
    # Setup logs
    setup_logs
    
    # Build all components
    build_backend
    build_frontend
    build_dashboard
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗"
    echo "║              Build Complete!                               ║"
    echo "╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Ensure PostgreSQL is running"
    echo "  2. Configure .env file with database credentials"
    echo "  3. Run: ${GREEN}./start.sh${NC} or ${GREEN}pm2 start ecosystem.config.js${NC}"
    echo ""
}

# Handle build options
case "${1:-all}" in
    backend)
        setup_logs
        build_backend
        ;;
    frontend)
        setup_logs
        build_frontend
        ;;
    dashboard)
        setup_logs
        build_dashboard
        ;;
    all)
        main
        ;;
    *)
        echo "Usage: $0 {all|backend|frontend|dashboard}"
        exit 1
        ;;
esac
