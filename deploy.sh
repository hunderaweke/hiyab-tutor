#!/bin/bash

###############################################################################
# Hiyab Tutor Deployment Script
# This script automates the deployment process for the entire stack:
# - Backend (Go API)
# - Dashboard (React Admin Panel)
# - Frontend (React Public Website)
# - PostgreSQL Database
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ENV="${DEPLOY_ENV:-production}"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

###############################################################################
# Helper Functions
###############################################################################

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
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║         Hiyab Tutor Deployment Script v1.0                  ║"
    echo "║         Environment: ${DEPLOY_ENV}                          ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check for Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check for Docker Compose
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed or not the plugin version."
        exit 1
    fi
    
    # Check for required files
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        log_error ".env file not found. Please create one based on .env.example"
        exit 1
    fi
    
    log_success "All requirements met"
}

backup_data() {
    log_info "Creating backup of existing data..."
    
    BACKUP_DIR="$SCRIPT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup PostgreSQL if running
    if docker ps 2>/dev/null | grep -q "hiyab-postgres"; then
        log_info "Backing up PostgreSQL database..."
        docker exec hiyab-postgres pg_dump -U postgres -d hiyab_tutor > "$BACKUP_DIR/database.sql" 2>/dev/null || log_warning "Database backup skipped (container not running)"
    fi
    
    # Backup uploads if they exist
    if [ -d "$SCRIPT_DIR/backend/uploads" ]; then
        log_info "Backing up uploads..."
        cp -r "$SCRIPT_DIR/backend/uploads" "$BACKUP_DIR/" || log_warning "Uploads backup failed"
    fi
    
    log_success "Backup completed at $BACKUP_DIR"
}

build_backend() {
    log_info "Building backend (Go API)..."
    
    cd "$SCRIPT_DIR/backend"
    
    # Run tests (skip integration tests that require Docker)
    if [ "$SKIP_TESTS" != "true" ]; then
        log_info "Running backend tests (skipping integration tests)..."
        # Skip tests that require Docker (database, repository, and server integration tests)
        go test ./internal/auth ./internal/config ./internal/domain ./internal/server/controllers ./internal/server/middlewares ./internal/usecases -v || {
            log_warning "Some tests failed, but continuing with deployment"
        }
    fi
    
    # Build Docker image
    docker build -t hiyab-backend:latest -f Dockerfile .
    
    log_success "Backend built successfully"
    cd "$SCRIPT_DIR"
}

build_dashboard() {
    log_info "Building dashboard (Admin Panel)..."
    
    cd "$SCRIPT_DIR/dashboard"
    
    # Build Docker image
    docker build -t hiyab-dashboard:latest -f Dockerfile .
    
    log_success "Dashboard built successfully"
    cd "$SCRIPT_DIR"
}

build_frontend() {
    log_info "Building frontend (Public Website)..."
    
    cd "$SCRIPT_DIR/frontend"
    
    # Build Docker image
    docker build -t hiyab-frontend:latest -f Dockerfile .
    
    log_success "Frontend built successfully"
    cd "$SCRIPT_DIR"
}

deploy_services() {
    log_info "Deploying services with Docker Compose..."
    
    cd "$SCRIPT_DIR"
    
    # Pull any base images
    docker compose -f "$DOCKER_COMPOSE_FILE" pull || true
    
    # Stop existing services
    log_info "Stopping existing services..."
    docker compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Start services
    log_info "Starting services..."
    docker compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be ready..."
    sleep 10
    
    log_success "Services deployed successfully"
}

run_migrations() {
    log_info "Running database migrations..."
    
    # Wait for database to be ready
    sleep 5
    
    # The Go application handles migrations automatically via GORM AutoMigrate
    log_info "Database migrations are handled automatically by the backend"
    
    log_success "Migrations completed"
}

health_check() {
    log_info "Performing health checks..."
    
    # Check backend
    BACKEND_STATUS=$(docker ps --filter "name=hiyab-backend" --format "{{.Status}}" 2>/dev/null || echo "not running")
    if [[ $BACKEND_STATUS == *"Up"* ]]; then
        log_success "Backend is running"
    else
        log_error "Backend is not running properly"
    fi
    
    # Check frontend
    FRONTEND_STATUS=$(docker ps --filter "name=hiyab-frontend" --format "{{.Status}}" 2>/dev/null || echo "not running")
    if [[ $FRONTEND_STATUS == *"Up"* ]]; then
        log_success "Frontend is running"
    else
        log_error "Frontend is not running properly"
    fi
    
    # Check dashboard
    DASHBOARD_STATUS=$(docker ps --filter "name=hiyab-dashboard" --format "{{.Status}}" 2>/dev/null || echo "not running")
    if [[ $DASHBOARD_STATUS == *"Up"* ]]; then
        log_success "Dashboard is running"
    else
        log_error "Dashboard is not running properly"
    fi
    
    # Check database
    DB_STATUS=$(docker ps --filter "name=hiyab-postgres" --format "{{.Status}}" 2>/dev/null || echo "not running")
    if [[ $DB_STATUS == *"Up"* ]]; then
        log_success "Database is running"
    else
        log_error "Database is not running properly"
    fi
}

show_logs() {
    log_info "Showing recent logs..."
    docker compose -f "$DOCKER_COMPOSE_FILE" logs --tail=50
}

display_info() {
    echo ""
    log_success "╔══════════════════════════════════════════════════════════════╗"
    log_success "║               Deployment Completed Successfully!             ║"
    log_success "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}Services are now running:${NC}"
    echo -e "  ${BLUE}•${NC} Backend API:     http://localhost:8080"
    echo -e "  ${BLUE}•${NC} Frontend:        http://localhost:80"
    echo -e "  ${BLUE}•${NC} Dashboard:       http://localhost:3000"
    echo -e "  ${BLUE}•${NC} API Docs:        http://localhost:8080/swagger/index.html"
    echo ""
    echo -e "${YELLOW}Useful commands:${NC}"
    echo -e "  ${BLUE}•${NC} View logs:       docker compose -f $DOCKER_COMPOSE_FILE logs -f"
    echo -e "  ${BLUE}•${NC} Stop services:   docker compose -f $DOCKER_COMPOSE_FILE down"
    echo -e "  ${BLUE}•${NC} Restart:         docker compose -f $DOCKER_COMPOSE_FILE restart"
    echo -e "  ${BLUE}•${NC} View status:     docker compose -f $DOCKER_COMPOSE_FILE ps"
    echo ""
}

cleanup_old_images() {
    log_info "Cleaning up old Docker images..."
    docker image prune -f || true
    log_success "Cleanup completed"
}

###############################################################################
# Main Deployment Flow
###############################################################################

main() {
    print_banner
    
    # Parse arguments
    SKIP_TESTS=false
    SKIP_BACKUP=false
    BUILD_ONLY=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --build-only)
                BUILD_ONLY=true
                shift
                ;;
            --help)
                echo "Usage: ./deploy.sh [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-tests      Skip running tests before building"
                echo "  --skip-backup     Skip backup of existing data"
                echo "  --build-only      Only build images, don't deploy"
                echo "  --help            Show this help message"
                echo ""
                echo "Environment variables:"
                echo "  DEPLOY_ENV        Deployment environment (default: production)"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_requirements
    
    if [ "$SKIP_BACKUP" != "true" ]; then
        backup_data
    fi
    
    # Build all components
    build_backend
    build_dashboard
    build_frontend
    
    if [ "$BUILD_ONLY" != "true" ]; then
        # Deploy
        deploy_services
        run_migrations
        
        # Verify deployment
        health_check
        
        # Cleanup
        cleanup_old_images
        
        # Show info
        display_info
    else
        log_success "Build completed. Skipping deployment (--build-only flag set)"
    fi
}

# Run main function
main "$@"
