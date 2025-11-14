#!/bin/bash

###############################################################################
# Backup Script for Hiyab Tutor
# Creates backups of database and uploaded files
###############################################################################

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting backup process...${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL database
echo -e "${BLUE}Backing up database...${NC}"
if docker ps | grep -q "hiyab-postgres"; then
    docker exec hiyab-postgres pg_dump -U postgres hiyab_tutor > "$BACKUP_DIR/db_$DATE.sql"
    echo -e "${GREEN}✓ Database backup created: db_$DATE.sql${NC}"
else
    echo -e "${RED}✗ Database container not running${NC}"
fi

# Backup uploads directory
echo -e "${BLUE}Backing up uploads...${NC}"
if [ -d "backend/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C backend uploads/
    echo -e "${GREEN}✓ Uploads backup created: uploads_$DATE.tar.gz${NC}"
else
    echo -e "${RED}✗ Uploads directory not found${NC}"
fi

# Backup .env file (optional, be careful with sensitive data)
if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/env_$DATE.backup"
    echo -e "${GREEN}✓ Environment file backed up${NC}"
fi

# Remove old backups
echo -e "${BLUE}Cleaning old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "db_*.sql" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "env_*.backup" -mtime +$RETENTION_DAYS -delete

# Display backup info
echo -e "\n${GREEN}Backup completed successfully!${NC}"
echo -e "Backup location: $BACKUP_DIR"
echo -e "\nBackup files:"
ls -lh "$BACKUP_DIR" | grep "$DATE"

# Display disk usage
echo -e "\n${BLUE}Backup directory size:${NC}"
du -sh "$BACKUP_DIR"
