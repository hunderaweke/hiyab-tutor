#!/bin/bash

###############################################################################
# VPS Setup Script for Hiyab Tutor (PM2 Deployment)
# This script installs and configures all required tools on a fresh VPS
# - Node.js & npm
# - PM2 process manager
# - Go programming language
# - PostgreSQL database
# - Nginx web server
# - System utilities and security
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_banner() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║    Hiyab Tutor VPS Setup Script (PM2 Deployment)          ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check if running as root or with sudo
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "Please run this script with sudo or as root"
        exit 1
    fi
}

# Detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
        log_info "Detected OS: $OS $VERSION"
    else
        log_error "Cannot detect OS. This script supports Ubuntu/Debian"
        exit 1
    fi
}

# Update system packages
update_system() {
    log_info "Updating system packages..."
    
    if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
        export DEBIAN_FRONTEND=noninteractive
        apt-get update -y
        apt-get upgrade -y
        apt-get install -y curl wget git build-essential software-properties-common
    else
        log_error "Unsupported OS: $OS"
        exit 1
    fi
    
    log_success "System updated"
}

# Install Node.js and npm
install_nodejs() {
    log_info "Installing Node.js and npm..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_warning "Node.js already installed: $NODE_VERSION"
        read -p "Do you want to reinstall? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Skipping Node.js installation"
            return
        fi
    fi
    
    # Install Node.js 24.x LTS (latest)
    log_info "Installing Node.js 24.x LTS..."
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
    apt-get install -y nodejs
    
    # Verify installation
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    
    log_success "Node.js installed: $NODE_VERSION"
    log_success "npm installed: $NPM_VERSION"
}

# Install PM2
install_pm2() {
    log_info "Installing PM2..."
    
    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 --version)
        log_warning "PM2 already installed: $PM2_VERSION"
        return
    fi
    
    npm install -g pm2
    
    # Setup PM2 startup script
    log_info "Setting up PM2 startup script..."
    env PATH=$PATH:/usr/bin pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
    
    PM2_VERSION=$(pm2 --version)
    log_success "PM2 installed: $PM2_VERSION"
}

# Install Go
install_go() {
    log_info "Installing Go programming language..."
    
    if command -v go &> /dev/null; then
        GO_VERSION=$(go version)
        log_warning "Go already installed: $GO_VERSION"
        read -p "Do you want to reinstall? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Skipping Go installation"
            return
        fi
    fi
    
    # Remove old version (if exists)
    if [ -d "/usr/local/go" ]; then
        log_info "Removing old Go installation..."
        rm -rf /usr/local/go
    fi
    
    # Install Go 1.24.0 (latest)
    GO_VERSION="1.24.0"
    log_info "Installing Go $GO_VERSION..."
    
    cd /tmp
    wget https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz
    tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
    rm go${GO_VERSION}.linux-amd64.tar.gz
    
    # Add Go to PATH for all users
    if ! grep -q "/usr/local/go/bin" /etc/profile; then
        echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
        echo 'export GOPATH=$HOME/go' >> /etc/profile
        echo 'export PATH=$PATH:$GOPATH/bin' >> /etc/profile
    fi
    
    # Add to current user's profile
    if [ -n "$SUDO_USER" ]; then
        USER_HOME=$(eval echo ~$SUDO_USER)
        if ! grep -q "/usr/local/go/bin" "$USER_HOME/.bashrc"; then
            echo 'export PATH=$PATH:/usr/local/go/bin' >> "$USER_HOME/.bashrc"
            echo 'export GOPATH=$HOME/go' >> "$USER_HOME/.bashrc"
            echo 'export PATH=$PATH:$GOPATH/bin' >> "$USER_HOME/.bashrc"
        fi
    fi
    
    # Set for current session
    export PATH=$PATH:/usr/local/go/bin
    
    GO_VERSION_INSTALLED=$(/usr/local/go/bin/go version)
    log_success "Go installed: $GO_VERSION_INSTALLED"
}

# Install PostgreSQL
install_postgresql() {
    log_info "Installing PostgreSQL..."
    
    if command -v psql &> /dev/null; then
        PG_VERSION=$(psql --version)
        log_warning "PostgreSQL already installed: $PG_VERSION"
        read -p "Do you want to reconfigure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Skipping PostgreSQL installation"
            return
        fi
    else
        # Install PostgreSQL 16
        log_info "Installing PostgreSQL 17..."
        
        # Add PostgreSQL repository
        sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
        wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
        
        apt-get update -y
        apt-get install -y postgresql-17 postgresql-contrib-17
    fi
    
    # Start PostgreSQL service
    systemctl start postgresql
    systemctl enable postgresql
    
    log_success "PostgreSQL installed and started"
    
    # Configure PostgreSQL
    log_info "Configuring PostgreSQL..."
    
    read -p "Enter database name (default: hiyab_tutor): " DB_NAME
    DB_NAME=${DB_NAME:-hiyab_tutor}
    
    echo ""
    log_info "Create a database user (recommended: create a new user instead of using 'postgres')"
    read -p "Enter database username (default: hiyab_user): " DB_USER
    DB_USER=${DB_USER:-hiyab_user}
    
    echo ""
    read -sp "Enter database password (required): " DB_PASSWORD
    echo
    
    if [ -z "$DB_PASSWORD" ]; then
        log_error "Database password cannot be empty"
        exit 1
    fi
    
    # Confirm password
    read -sp "Confirm database password: " DB_PASSWORD_CONFIRM
    echo
    
    if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
        log_error "Passwords do not match"
        exit 1
    fi
    
    # Create database and user
    sudo -u postgres psql <<EOF
-- Create user
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    ELSE
        ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF
    
    log_success "Database '$DB_NAME' created"
    log_success "User '$DB_USER' configured"
    
    # Save credentials for later
    echo "BLUEPRINT_DB_HOST=localhost" > /tmp/db_config.txt
    echo "BLUEPRINT_DB_PORT=5432" >> /tmp/db_config.txt
    echo "BLUEPRINT_DB_DATABASE=$DB_NAME" >> /tmp/db_config.txt
    echo "BLUEPRINT_DB_USERNAME=$DB_USER" >> /tmp/db_config.txt
    echo "BLUEPRINT_DB_PASSWORD=$DB_PASSWORD" >> /tmp/db_config.txt
    
    log_info "Database credentials saved to /tmp/db_config.txt"
}

# Install Nginx
install_nginx() {
    log_info "Installing Nginx..."
    
    if command -v nginx &> /dev/null; then
        NGINX_VERSION=$(nginx -v 2>&1)
        log_warning "Nginx already installed: $NGINX_VERSION"
        read -p "Do you want to reconfigure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Skipping Nginx installation"
            return
        fi
    else
        apt-get install -y nginx
    fi
    
    # Start and enable Nginx
    systemctl start nginx
    systemctl enable nginx
    
    log_success "Nginx installed and started"
    
    # Configure Nginx for Hiyab Tutor
    log_info "Configuring Nginx reverse proxy..."
    
    cat > /etc/nginx/sites-available/hiyab-tutor <<'EOF'
# Hiyab Tutor Nginx Configuration

# Frontend (Public Website)
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Dashboard (Admin Panel)
    location /admin {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API (Backend)
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Swagger Documentation
    location /swagger {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/hiyab-tutor /etc/nginx/sites-enabled/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    log_success "Nginx configured and reloaded"
}

# Configure firewall
configure_firewall() {
    log_info "Configuring firewall (UFW)..."
    
    if ! command -v ufw &> /dev/null; then
        apt-get install -y ufw
    fi
    
    # Allow SSH, HTTP, HTTPS
    ufw --force enable
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # Allow PostgreSQL only from localhost (more secure)
    # If you need external access, uncomment the next line
    # ufw allow 5432/tcp comment 'PostgreSQL'
    
    ufw status
    
    log_success "Firewall configured"
}

# Install additional utilities
install_utilities() {
    log_info "Installing additional utilities..."
    
    apt-get install -y \
        htop \
        vim \
        nano \
        unzip \
        zip \
        certbot \
        python3-certbot-nginx \
        fail2ban \
        ufw
    
    log_success "Utilities installed"
}

# Setup project directory
setup_project_dir() {
    log_info "Setting up project directory..."
    
    if [ -n "$SUDO_USER" ]; then
        USER_HOME=$(eval echo ~$SUDO_USER)
        PROJECT_DIR="$USER_HOME/hiyab-tutor"
        
        mkdir -p "$PROJECT_DIR"
        chown -R $SUDO_USER:$SUDO_USER "$PROJECT_DIR"
        
        log_success "Project directory created: $PROJECT_DIR"
        
        echo "PROJECT_DIR=$PROJECT_DIR" >> /tmp/db_config.txt
    fi
}

# Print summary and next steps
print_summary() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗"
    echo "║              Setup Complete!                               ║"
    echo "╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log_info "Installed components:"
    echo "  ✓ Node.js $(node --version)"
    echo "  ✓ npm $(npm --version)"
    echo "  ✓ PM2 $(pm2 --version)"
    echo "  ✓ Go $(/usr/local/go/bin/go version | awk '{print $3}')"
    echo "  ✓ PostgreSQL $(psql --version | awk '{print $3}')"
    echo "  ✓ Nginx $(nginx -v 2>&1 | awk '{print $3}')"
    echo ""
    
    log_info "Database credentials saved to: /tmp/db_config.txt"
    
    if [ -f /tmp/db_config.txt ]; then
        echo ""
        log_warning "Copy these credentials to your .env file:"
        echo -e "${BLUE}"
        cat /tmp/db_config.txt
        echo -e "${NC}"
    fi
    
    echo ""
    log_info "Next steps:"
    echo "  1. Clone your repository:"
    if [ -n "$SUDO_USER" ]; then
        USER_HOME=$(eval echo ~$SUDO_USER)
        echo "     su - $SUDO_USER"
        echo "     cd $USER_HOME"
        echo "     git clone https://github.com/hunderaweke/hiyab-tutor.git"
        echo "     cd hiyab-tutor"
    fi
    echo ""
    echo "  2. Create .env file with database credentials:"
    echo "     cp .env.example .env"
    echo "     nano .env  # Add the database credentials shown above"
    echo ""
    echo "  3. Deploy the application:"
    echo "     chmod +x deploy-pm2.sh"
    echo "     ./deploy-pm2.sh"
    echo ""
    echo "  4. Access your application:"
    echo "     Frontend:  http://$(curl -s ifconfig.me)"
    echo "     Dashboard: http://$(curl -s ifconfig.me)/admin"
    echo "     API:       http://$(curl -s ifconfig.me)/api"
    echo ""
    
    log_warning "Don't forget to:"
    echo "  - Secure your database password"
    echo "  - Configure SSL/TLS with: certbot --nginx"
    echo "  - Review firewall rules: ufw status"
    echo "  - Delete /tmp/db_config.txt after copying credentials"
    echo ""
}

# Main setup function
main() {
    print_banner
    
    check_root
    detect_os
    
    log_info "This script will install:"
    echo "  - Node.js 24.x LTS (latest)"
    echo "  - PM2 process manager"
    echo "  - Go 1.24.0 (latest)"
    echo "  - PostgreSQL 16"
    echo "  - Nginx web server"
    echo "  - System utilities and security tools"
    echo ""
    
    read -p "Continue with installation? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        log_info "Installation cancelled"
        exit 0
    fi
    
    update_system
    install_utilities
    install_nodejs
    install_pm2
    install_go
    install_postgresql
    install_nginx
    configure_firewall
    setup_project_dir
    
    print_summary
}

# Run main function
main
