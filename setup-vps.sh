#!/bin/bash

###############################################################################
# VPS Setup Script for Hiyab Tutor
# Prepares a fresh VPS for deployment
# Run this on a new Ubuntu/Debian server
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         Hiyab Tutor VPS Setup Script                        ║"
echo "║         Prepares server for deployment                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root or with sudo"
    exit 1
fi

# Check OS
if [ ! -f /etc/os-release ]; then
    log_error "Cannot detect OS. This script supports Ubuntu/Debian."
    exit 1
fi

source /etc/os-release
if [[ "$ID" != "ubuntu" ]] && [[ "$ID" != "debian" ]]; then
    log_error "This script is designed for Ubuntu/Debian. Your OS: $ID"
    exit 1
fi

log_success "Detected OS: $PRETTY_NAME"

# Update system
log_info "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install essential packages
log_info "Installing essential packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    git \
    wget \
    vim \
    htop \
    ufw \
    build-essential

# Install Go (for running tests if needed)
log_info "Installing Go..."
GO_VERSION="1.24.2"
if ! command -v go &> /dev/null; then
    wget -q https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz
    rm -rf /usr/local/go
    tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
    rm go${GO_VERSION}.linux-amd64.tar.gz
    
    # Add Go to PATH for all users
    echo 'export PATH=$PATH:/usr/local/go/bin' > /etc/profile.d/go.sh
    chmod +x /etc/profile.d/go.sh
    export PATH=$PATH:/usr/local/go/bin
    
    log_success "Go ${GO_VERSION} installed"
else
    log_info "Go already installed: $(go version)"
fi

# Install Docker
log_info "Installing Docker..."
if command -v docker &> /dev/null; then
    log_info "Docker already installed"
else
    # Add Docker's official GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$ID/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$ID \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    log_success "Docker installed successfully"
fi

# Verify Docker installation
DOCKER_VERSION=$(docker --version)
log_success "Docker version: $DOCKER_VERSION"

# Configure firewall
log_info "Configuring firewall..."
ufw --force enable

# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow custom ports if needed
ufw allow 8080/tcp  # Backend API
ufw allow 3000/tcp  # Dashboard

log_success "Firewall configured"

# Create deployment user (optional)
read -p "Create a deployment user? (yes/no) [yes]: " CREATE_USER
CREATE_USER=${CREATE_USER:-yes}

if [ "$CREATE_USER" = "yes" ]; then
    read -p "Enter username [deployer]: " USERNAME
    USERNAME=${USERNAME:-deployer}
    
    if id "$USERNAME" &>/dev/null; then
        log_info "User $USERNAME already exists"
    else
        useradd -m -s /bin/bash "$USERNAME"
        usermod -aG docker "$USERNAME"
        usermod -aG sudo "$USERNAME"
        
        log_success "User $USERNAME created and added to docker and sudo groups"
        log_info "Set password for $USERNAME:"
        passwd "$USERNAME"
    fi
else
    # Add current sudo user to docker group
    if [ -n "$SUDO_USER" ]; then
        USERNAME="$SUDO_USER"
        usermod -aG docker "$USERNAME"
        log_success "Added $USERNAME to docker group"
    fi
fi

# Create application directory
log_info "Creating application directory..."
APP_DIR="/opt/hiyab-tutor"
mkdir -p "$APP_DIR"

if [ -n "$USERNAME" ] && [ "$USERNAME" != "root" ]; then
    chown -R "$USERNAME:$USERNAME" "$APP_DIR"
fi

log_success "Application directory created at $APP_DIR"

# Configure swap (recommended for servers with <2GB RAM)
if [ $(free -m | awk '/^Swap:/{print $2}') -eq 0 ]; then
    read -p "Create swap file? Recommended for servers with <2GB RAM (yes/no) [yes]: " CREATE_SWAP
    CREATE_SWAP=${CREATE_SWAP:-yes}
    
    if [ "$CREATE_SWAP" = "yes" ]; then
        SWAP_SIZE="2G"
        log_info "Creating ${SWAP_SIZE} swap file..."
        
        fallocate -l $SWAP_SIZE /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        
        # Make swap permanent
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        
        log_success "Swap file created and enabled"
    fi
fi

# Install fail2ban for security (optional)
read -p "Install fail2ban for additional security? (yes/no) [yes]: " INSTALL_FAIL2BAN
INSTALL_FAIL2BAN=${INSTALL_FAIL2BAN:-yes}

if [ "$INSTALL_FAIL2BAN" = "yes" ]; then
    log_info "Installing fail2ban..."
    apt-get install -y fail2ban
    systemctl start fail2ban
    systemctl enable fail2ban
    log_success "fail2ban installed and enabled"
fi

# Display summary
echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            VPS Setup Completed Successfully!                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}Setup Summary:${NC}"
echo -e "  ✓ System packages updated"
echo -e "  ✓ Docker installed and configured"
echo -e "  ✓ Firewall configured (SSH, HTTP, HTTPS allowed)"
if [ -n "$USERNAME" ]; then
    echo -e "  ✓ Deployment user created: $USERNAME"
fi
echo -e "  ✓ Application directory: $APP_DIR"
if [ "$CREATE_SWAP" = "yes" ]; then
    echo -e "  ✓ Swap file created"
fi
if [ "$INSTALL_FAIL2BAN" = "yes" ]; then
    echo -e "  ✓ fail2ban installed"
fi

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "  1. Clone the repository to $APP_DIR"
echo -e "     ${BLUE}cd $APP_DIR${NC}"
echo -e "     ${BLUE}git clone <repository-url> .${NC}"
echo -e ""
echo -e "  2. Create and configure .env file"
echo -e "     ${BLUE}cp .env.example .env${NC}"
echo -e "     ${BLUE}nano .env${NC}"
echo -e ""
if [ -n "$USERNAME" ] && [ "$USERNAME" != "root" ]; then
    echo -e "  ${YELLOW}IMPORTANT: Log out and back in for docker group to take effect${NC}"
    echo -e "  ${BLUE}exit${NC}"
    echo -e "  ${BLUE}ssh $USERNAME@your-server${NC}"
    echo -e ""
fi
echo -e "  3. Run the deployment script"
echo -e "     ${BLUE}chmod +x deploy.sh${NC}"
echo -e "     ${BLUE}./deploy.sh${NC}"
echo -e ""

log_success "VPS is ready for Hiyab Tutor deployment!"
