#!/bin/bash

###############################################################################
# Restore Script for Hiyab Tutor
# Restores database and uploaded files from backup
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKUP_DIR="./backups"

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Hiyab Tutor Restore Script              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}\n"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}Error: Backup directory not found at $BACKUP_DIR${NC}"
    exit 1
fi

# List available database backups
echo -e "${BLUE}Available database backups:${NC}"
db_backups=($(ls -1 "$BACKUP_DIR"/db_*.sql 2>/dev/null || echo ""))

if [ ${#db_backups[@]} -eq 0 ]; then
    echo -e "${RED}No database backups found${NC}"
    DB_BACKUP=""
else
    for i in "${!db_backups[@]}"; do
        echo "$((i+1))) ${db_backups[$i]}"
    done
    
    echo -e "\n${YELLOW}Select database backup to restore (number), or press Enter to skip:${NC}"
    read -r selection
    
    if [ -n "$selection" ] && [ "$selection" -ge 1 ] && [ "$selection" -le "${#db_backups[@]}" ]; then
        DB_BACKUP="${db_backups[$((selection-1))]}"
    else
        DB_BACKUP=""
    fi
fi

# List available upload backups
echo -e "\n${BLUE}Available upload backups:${NC}"
upload_backups=($(ls -1 "$BACKUP_DIR"/uploads_*.tar.gz 2>/dev/null || echo ""))

if [ ${#upload_backups[@]} -eq 0 ]; then
    echo -e "${RED}No upload backups found${NC}"
    UPLOAD_BACKUP=""
else
    for i in "${!upload_backups[@]}"; do
        echo "$((i+1))) ${upload_backups[$i]}"
    done
    
    echo -e "\n${YELLOW}Select upload backup to restore (number), or press Enter to skip:${NC}"
    read -r selection
    
    if [ -n "$selection" ] && [ "$selection" -ge 1 ] && [ "$selection" -le "${#upload_backups[@]}" ]; then
        UPLOAD_BACKUP="${upload_backups[$((selection-1))]}"
    else
        UPLOAD_BACKUP=""
    fi
fi

# Confirm restoration
echo -e "\n${YELLOW}╔══════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║             RESTORE CONFIRMATION             ║${NC}"
echo -e "${YELLOW}╚══════════════════════════════════════════════╝${NC}"

if [ -n "$DB_BACKUP" ]; then
    echo -e "${BLUE}Database backup:${NC} $DB_BACKUP"
fi

if [ -n "$UPLOAD_BACKUP" ]; then
    echo -e "${BLUE}Upload backup:${NC} $UPLOAD_BACKUP"
fi

if [ -z "$DB_BACKUP" ] && [ -z "$UPLOAD_BACKUP" ]; then
    echo -e "${RED}No backups selected. Exiting.${NC}"
    exit 0
fi

echo -e "\n${RED}WARNING: This will overwrite existing data!${NC}"
echo -e "${YELLOW}Are you sure you want to continue? (yes/no):${NC}"
read -r confirmation

if [ "$confirmation" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled.${NC}"
    exit 0
fi

# Restore database
if [ -n "$DB_BACKUP" ]; then
    echo -e "\n${BLUE}Restoring database...${NC}"
    
    # Stop backend to prevent conflicts
    echo -e "${BLUE}Stopping backend service...${NC}"
    docker compose -f docker-compose.prod.yml stop backend
    
    # Drop and recreate database
    echo -e "${BLUE}Recreating database...${NC}"
    docker exec hiyab-postgres psql -U postgres -c "DROP DATABASE IF EXISTS hiyab_tutor;"
    docker exec hiyab-postgres psql -U postgres -c "CREATE DATABASE hiyab_tutor;"
    
    # Restore from backup
    echo -e "${BLUE}Restoring from backup file...${NC}"
    cat "$DB_BACKUP" | docker exec -i hiyab-postgres psql -U postgres -d hiyab_tutor
    
    echo -e "${GREEN}✓ Database restored successfully${NC}"
    
    # Restart backend
    echo -e "${BLUE}Starting backend service...${NC}"
    docker compose -f docker-compose.prod.yml start backend
fi

# Restore uploads
if [ -n "$UPLOAD_BACKUP" ]; then
    echo -e "\n${BLUE}Restoring uploads...${NC}"
    
    # Backup current uploads if they exist
    if [ -d "backend/uploads" ]; then
        echo -e "${BLUE}Backing up current uploads...${NC}"
        mv backend/uploads "backend/uploads.old.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Extract backup
    echo -e "${BLUE}Extracting backup...${NC}"
    tar -xzf "$UPLOAD_BACKUP" -C backend/
    
    # Fix permissions
    echo -e "${BLUE}Fixing permissions...${NC}"
    chmod -R 755 backend/uploads
    
    echo -e "${GREEN}✓ Uploads restored successfully${NC}"
fi

echo -e "\n${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      Restore completed successfully!         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"

# Verify services
echo -e "\n${BLUE}Verifying services...${NC}"
sleep 3
docker compose -f docker-compose.prod.yml ps
