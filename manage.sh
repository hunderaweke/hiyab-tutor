#!/bin/bash

###############################################################################
# Status and Management Script for Hiyab Tutor
# Provides quick access to common management tasks
###############################################################################

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"

show_header() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║           Hiyab Tutor Management Console                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

show_menu() {
    echo -e "${BLUE}Management Options:${NC}"
    echo "  1) View service status"
    echo "  2) View logs (all services)"
    echo "  3) View logs (specific service)"
    echo "  4) Restart all services"
    echo "  5) Restart specific service"
    echo "  6) Stop all services"
    echo "  7) Start all services"
    echo "  8) View resource usage"
    echo "  9) Run backup"
    echo " 10) Access database console"
    echo " 11) View health status"
    echo " 12) Clean up old images/containers"
    echo " 13) Update application"
    echo "  0) Exit"
    echo ""
}

view_status() {
    echo -e "${BLUE}Service Status:${NC}"
    docker compose -f "$COMPOSE_FILE" ps
    echo ""
}

view_all_logs() {
    echo -e "${BLUE}Showing logs (Ctrl+C to exit)...${NC}"
    docker compose -f "$COMPOSE_FILE" logs -f --tail=50
}

view_service_logs() {
    echo -e "${BLUE}Available services:${NC}"
    echo "  1) backend"
    echo "  2) frontend"
    echo "  3) dashboard"
    echo "  4) postgres"
    echo ""
    read -p "Select service (1-4): " service_choice
    
    case $service_choice in
        1) SERVICE="backend" ;;
        2) SERVICE="frontend" ;;
        3) SERVICE="dashboard" ;;
        4) SERVICE="postgres" ;;
        *) echo -e "${RED}Invalid choice${NC}"; return ;;
    esac
    
    echo -e "${BLUE}Showing $SERVICE logs (Ctrl+C to exit)...${NC}"
    docker compose -f "$COMPOSE_FILE" logs -f --tail=100 "$SERVICE"
}

restart_all() {
    echo -e "${YELLOW}Restarting all services...${NC}"
    docker compose -f "$COMPOSE_FILE" restart
    echo -e "${GREEN}✓ All services restarted${NC}"
}

restart_service() {
    echo -e "${BLUE}Available services:${NC}"
    echo "  1) backend"
    echo "  2) frontend"
    echo "  3) dashboard"
    echo "  4) postgres"
    echo ""
    read -p "Select service to restart (1-4): " service_choice
    
    case $service_choice in
        1) SERVICE="backend" ;;
        2) SERVICE="frontend" ;;
        3) SERVICE="dashboard" ;;
        4) SERVICE="postgres" ;;
        *) echo -e "${RED}Invalid choice${NC}"; return ;;
    esac
    
    echo -e "${YELLOW}Restarting $SERVICE...${NC}"
    docker compose -f "$COMPOSE_FILE" restart "$SERVICE"
    echo -e "${GREEN}✓ $SERVICE restarted${NC}"
}

stop_all() {
    read -p "Are you sure you want to stop all services? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}Stopping all services...${NC}"
        docker compose -f "$COMPOSE_FILE" down
        echo -e "${GREEN}✓ All services stopped${NC}"
    fi
}

start_all() {
    echo -e "${YELLOW}Starting all services...${NC}"
    docker compose -f "$COMPOSE_FILE" up -d
    echo -e "${GREEN}✓ All services started${NC}"
    sleep 2
    view_status
}

view_resources() {
    echo -e "${BLUE}Resource Usage:${NC}"
    docker stats --no-stream
    echo ""
}

run_backup() {
    if [ -f "./backup.sh" ]; then
        ./backup.sh
    else
        echo -e "${RED}Backup script not found${NC}"
    fi
}

database_console() {
    echo -e "${BLUE}Connecting to database console...${NC}"
    echo -e "${YELLOW}Type \\q to exit${NC}"
    docker exec -it hiyab-postgres psql -U postgres -d hiyab_tutor
}

health_check() {
    echo -e "${BLUE}Health Check Results:${NC}\n"
    
    # Check backend
    if curl -sf http://localhost:8080/api/v1/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend API: Healthy${NC}"
    else
        echo -e "${RED}✗ Backend API: Unhealthy${NC}"
    fi
    
    # Check frontend
    if curl -sf http://localhost > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend: Healthy${NC}"
    else
        echo -e "${RED}✗ Frontend: Unhealthy${NC}"
    fi
    
    # Check dashboard
    if curl -sf http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Dashboard: Healthy${NC}"
    else
        echo -e "${RED}✗ Dashboard: Unhealthy${NC}"
    fi
    
    # Check database
    if docker exec hiyab-postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database: Healthy${NC}"
    else
        echo -e "${RED}✗ Database: Unhealthy${NC}"
    fi
    
    echo ""
}

cleanup() {
    echo -e "${YELLOW}Cleaning up unused images and containers...${NC}"
    docker system prune -f
    echo -e "${GREEN}✓ Cleanup completed${NC}"
}

update_app() {
    echo -e "${YELLOW}Updating application...${NC}"
    
    # Pull latest code
    echo -e "${BLUE}Pulling latest code from repository...${NC}"
    git pull origin main
    
    # Run deployment
    if [ -f "./deploy.sh" ]; then
        ./deploy.sh
    else
        echo -e "${YELLOW}Deployment script not found, rebuilding manually...${NC}"
        docker compose -f "$COMPOSE_FILE" build
        docker compose -f "$COMPOSE_FILE" up -d
    fi
    
    echo -e "${GREEN}✓ Update completed${NC}"
}

# Main loop
while true; do
    show_header
    show_menu
    read -p "Enter your choice: " choice
    
    case $choice in
        1) view_status ;;
        2) view_all_logs ;;
        3) view_service_logs ;;
        4) restart_all ;;
        5) restart_service ;;
        6) stop_all ;;
        7) start_all ;;
        8) view_resources ;;
        9) run_backup ;;
        10) database_console ;;
        11) health_check ;;
        12) cleanup ;;
        13) update_app ;;
        0) echo -e "${GREEN}Goodbye!${NC}"; exit 0 ;;
        *) echo -e "${RED}Invalid choice. Please try again.${NC}" ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
