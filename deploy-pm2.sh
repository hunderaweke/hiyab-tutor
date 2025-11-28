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
    
    # Add Go to PATH if it exists in /usr/local/go/bin
    if [ -f "/usr/local/go/bin/go" ]; then
        export PATH=$PATH:/usr/local/go/bin
    fi
    
    if ! command -v go &> /dev/null; then
        echo -e "${RED}✗ Go is not installed${NC}"
        echo -e "${YELLOW}  If you just ran setup-vps-pm2.sh, try: source ~/.bashrc${NC}"
        echo -e "${YELLOW}  Or run: export PATH=\$PATH:/usr/local/go/bin${NC}"
        missing=1
    else
        echo -e "${GREEN}✓ Go installed$(go version | awk '{print " (" $3 ")"}')"
        export PATH=$PATH:/usr/local/go/bin
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

# Check and setup PostgreSQL database
check_database() {
    echo -e "${BLUE}Checking database connection...${NC}"
    
    # Source .env to get database credentials
    set -a
    source "$SCRIPT_DIR/.env"
    set +a
    
    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        echo -e "${YELLOW}⚠ PostgreSQL not installed${NC}"
        echo "Please run setup-vps-pm2.sh to install PostgreSQL"
        return
    fi
    
    # Try to connect to the database
    DB_HOST=${BLUEPRINT_DB_HOST:-localhost}
    DB_PORT=${BLUEPRINT_DB_PORT:-5432}
    DB_NAME=${BLUEPRINT_DB_DATABASE:-hiyab_tutor}
    DB_USER=${BLUEPRINT_DB_USERNAME:-hiyab_user}
    DB_PASSWORD=${BLUEPRINT_DB_PASSWORD}
    
    if [ -z "$DB_PASSWORD" ]; then
        echo -e "${YELLOW}⚠ Database password not set in .env${NC}"
        return
    fi
    
    # Check if database exists
    export PGPASSWORD="$DB_PASSWORD"
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; then
        echo -e "${GREEN}✓ Database connection successful${NC}"
    else
        echo -e "${YELLOW}⚠ Cannot connect to database '$DB_NAME'${NC}"
        echo "Creating database..."
        
        # Try to create the database using postgres user
        sudo -u postgres psql <<EOF 2>/dev/null
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF
        
        # Test connection again
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; then
            echo -e "${GREEN}✓ Database created successfully${NC}"
        else
            echo -e "${RED}Failed to create database${NC}"
            echo "Please check your PostgreSQL installation and credentials"
        fi
    fi
    
    unset PGPASSWORD
    echo ""
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
    check_database
    run_build
    start_services
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗"
    echo "║          Deployment Complete!                              ║"
    echo "╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

main
