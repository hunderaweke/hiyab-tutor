# Hiyab Tutor Deployment Guide

Complete deployment guide for deploying the Hiyab Tutor platform to a VPS (Virtual Private Server).

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Detailed Deployment Steps](#detailed-deployment-steps)
- [Configuration](#configuration)
- [Managing the Application](#managing-the-application)
- [Monitoring and Logs](#monitoring-and-logs)
- [Backup and Restore](#backup-and-restore)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## 🔧 Prerequisites

Before deploying, ensure your VPS has the following:

### System Requirements

- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Minimum 2GB (4GB+ recommended)
- **CPU**: 2+ cores
- **Storage**: 20GB+ available disk space
- **Network**: Public IP address and domain name (optional but recommended)

### Required Software

- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+ (plugin version)
- **Git**: For cloning the repository
- **Bash**: For running deployment scripts

### Installing Docker on Ubuntu/Debian

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### Post-Installation Steps

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and back in for the group change to take effect
# Or run: newgrp docker
```

---

## 🏗️ Architecture Overview

The Hiyab Tutor platform consists of 4 main services:

```
┌─────────────────────────────────────────────────────────────┐
│                         VPS Server                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Frontend   │  │   Dashboard  │  │   Backend API   │  │
│  │  (Port 80)   │  │  (Port 3000) │  │   (Port 8080)   │  │
│  │              │  │              │  │                 │  │
│  │   Nginx +    │  │   Nginx +    │  │   Go + Gin      │  │
│  │   React      │  │   React      │  │   + GORM        │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│         │                 │                    │           │
│         └─────────────────┴────────────────────┘           │
│                           │                                │
│                  ┌────────▼────────┐                       │
│                  │   PostgreSQL    │                       │
│                  │   (Port 5432)   │                       │
│                  └─────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Service Details

1. **Backend API** (Go)

   - RESTful API service
   - JWT authentication
   - File upload handling
   - Swagger documentation at `/swagger/index.html`

2. **Frontend** (React)

   - Public-facing website
   - User interface for booking tutors
   - Service browsing and testimonials

3. **Dashboard** (React)

   - Admin panel
   - Manage tutors, bookings, services
   - User management

4. **PostgreSQL Database**
   - Persistent data storage
   - Automatic backups

---

## 🚀 Quick Start

The fastest way to deploy:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/hiyab-tutor.git
cd hiyab-tutor

# 2. Create environment file
cp .env.example .env
nano .env  # Edit with your configuration

# 3. Make deployment script executable
chmod +x deploy.sh

# 4. Run deployment
./deploy.sh
```

That's it! The script will:

- ✅ Build all Docker images
- ✅ Start all services
- ✅ Run database migrations
- ✅ Perform health checks
- ✅ Display access URLs

---

## 📖 Detailed Deployment Steps

### Step 1: Prepare Your VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install required dependencies
sudo apt-get install -y git curl wget
```

### Step 2: Clone the Repository

```bash
# Navigate to your preferred directory
cd /opt  # or /home/youruser

# Clone the repository
git clone https://github.com/yourusername/hiyab-tutor.git
cd hiyab-tutor
```

### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file
nano .env
```

**Important variables to configure:**

```bash
# Security (MUST CHANGE)
JWT_SECRET=generate-a-strong-random-secret-here
ADMIN_PASSWORD=your-secure-admin-password
BLUEPRINT_DB_PASSWORD=your-secure-database-password

# Application URLs (update with your domain)
WEB_APP_URL=https://yourdomain.com

# Database Configuration
BLUEPRINT_DB_DATABASE=hiyab_tutor
BLUEPRINT_DB_USERNAME=postgres
```

**Generate strong secrets:**

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

### Step 4: Make Deployment Script Executable

```bash
chmod +x deploy.sh
```

### Step 5: Run Initial Deployment

```bash
./deploy.sh
```

The script will guide you through the deployment process with colorful output showing each step.

### Step 6: Verify Deployment

After deployment completes, verify all services are running:

```bash
# Check service status
docker compose -f docker-compose.prod.yml ps

# Expected output:
# NAME              STATUS    PORTS
# hiyab-backend     Up        0.0.0.0:8080->8080/tcp
# hiyab-dashboard   Up        0.0.0.0:3000->80/tcp
# hiyab-frontend    Up        0.0.0.0:80->80/tcp
# hiyab-postgres    Up        0.0.0.0:5432->5432/tcp
```

### Step 7: Access Your Application

- **Frontend**: http://your-vps-ip or http://yourdomain.com
- **Dashboard**: http://your-vps-ip:3000
- **API Documentation**: http://your-vps-ip:8080/swagger/index.html
- **Health Check**: http://your-vps-ip:8080/api/v1/health

---

## ⚙️ Configuration

### Environment Variables

All configuration is done through the `.env` file. Here's a complete reference:

| Variable                | Description               | Default          | Required |
| ----------------------- | ------------------------- | ---------------- | -------- |
| `JWT_SECRET`            | Secret key for JWT tokens | -                | ✅ Yes   |
| `ADMIN_USERNAME`        | Initial admin username    | admin            | ✅ Yes   |
| `ADMIN_PASSWORD`        | Initial admin password    | -                | ✅ Yes   |
| `WEB_APP_URL`           | Frontend URL for CORS     | http://localhost | ✅ Yes   |
| `BLUEPRINT_DB_HOST`     | Database host             | postgres         | No       |
| `BLUEPRINT_DB_PORT`     | Database port             | 5432             | No       |
| `BLUEPRINT_DB_DATABASE` | Database name             | hiyab_tutor      | ✅ Yes   |
| `BLUEPRINT_DB_USERNAME` | Database user             | postgres         | ✅ Yes   |
| `BLUEPRINT_DB_PASSWORD` | Database password         | -                | ✅ Yes   |
| `FRONTEND_PORT`         | Frontend external port    | 80               | No       |
| `DASHBOARD_PORT`        | Dashboard external port   | 3000             | No       |

### Ports

Default ports used by the application:

- **80**: Frontend (public website)
- **3000**: Dashboard (admin panel)
- **8080**: Backend API
- **5432**: PostgreSQL database

To change ports, update the `docker-compose.prod.yml` file or set environment variables.

---

## 🔧 Managing the Application

### Deployment Script Options

```bash
# Full deployment with tests and backup
./deploy.sh

# Skip tests
./deploy.sh --skip-tests

# Skip backup
./deploy.sh --skip-backup

# Build images only, don't deploy
./deploy.sh --build-only

# Show help
./deploy.sh --help
```

### Docker Compose Commands

```bash
# View all running services
docker compose -f docker-compose.prod.yml ps

# View logs (all services)
docker compose -f docker-compose.prod.yml logs -f

# View logs (specific service)
docker compose -f docker-compose.prod.yml logs -f backend

# Restart all services
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend

# Stop all services
docker compose -f docker-compose.prod.yml down

# Start services
docker compose -f docker-compose.prod.yml up -d

# Rebuild and restart a service
docker compose -f docker-compose.prod.yml up -d --build backend
```

### Updating the Application

```bash
# Pull latest changes from repository
git pull origin main

# Run deployment script to rebuild and restart
./deploy.sh

# Or manually rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

---

## 📊 Monitoring and Logs

### Viewing Logs

```bash
# All services (follow mode)
docker compose -f docker-compose.prod.yml logs -f

# Last 100 lines of all services
docker compose -f docker-compose.prod.yml logs --tail=100

# Backend logs only
docker compose -f docker-compose.prod.yml logs -f backend

# Database logs
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Health Checks

All services have built-in health checks:

```bash
# Check service health
docker compose -f docker-compose.prod.yml ps

# Manual health check
curl http://localhost:8080/api/v1/health
```

### Resource Usage

```bash
# View resource usage of containers
docker stats

# View disk usage
docker system df

# View detailed image/container sizes
docker system df -v
```

---

## 💾 Backup and Restore

### Automatic Backups

The deployment script automatically creates backups before each deployment in the `backups/` directory.

### Manual Database Backup

```bash
# Create backup directory
mkdir -p backups

# Backup database
docker exec hiyab-postgres pg_dump -U postgres hiyab_tutor > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backups/
```

### Restore Database

```bash
# Stop the backend to prevent conflicts
docker compose -f docker-compose.prod.yml stop backend

# Restore from backup
cat backups/backup_20231114_120000.sql | docker exec -i hiyab-postgres psql -U postgres -d hiyab_tutor

# Restart backend
docker compose -f docker-compose.prod.yml start backend
```

### Backup Upload Files

```bash
# Create uploads backup
tar -czf backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/

# Restore uploads
tar -xzf backups/uploads_20231114_120000.tar.gz -C backend/
```

### Automated Backup Script

Create a cron job for daily backups:

```bash
# Create backup script
cat > /opt/hiyab-tutor/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/hiyab-tutor/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker exec hiyab-postgres pg_dump -U postgres hiyab_tutor > "$BACKUP_DIR/db_$DATE.sql"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /opt/hiyab-tutor/backend uploads/

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

# Make executable
chmod +x /opt/hiyab-tutor/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/hiyab-tutor/backup.sh >> /var/log/hiyab-backup.log 2>&1") | crontab -
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Services Won't Start

```bash
# Check logs for errors
docker compose -f docker-compose.prod.yml logs

# Check if ports are already in use
sudo netstat -tulpn | grep -E ':(80|3000|8080|5432)'

# Remove conflicting containers
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

#### 2. Database Connection Issues

```bash
# Check if database is running
docker ps | grep postgres

# Check database logs
docker compose -f docker-compose.prod.yml logs postgres

# Verify database credentials in .env file
cat .env | grep BLUEPRINT_DB

# Test database connection
docker exec -it hiyab-postgres psql -U postgres -d hiyab_tutor -c "SELECT 1;"
```

#### 3. Backend Can't Connect to Database

```bash
# Ensure backend starts after database
docker compose -f docker-compose.prod.yml restart backend

# Check network connectivity
docker exec hiyab-backend ping -c 3 postgres

# Verify environment variables
docker exec hiyab-backend env | grep BLUEPRINT_DB
```

#### 4. Frontend/Dashboard Shows 502 Bad Gateway

```bash
# Backend might not be ready
docker compose -f docker-compose.prod.yml restart backend

# Check backend health
curl http://localhost:8080/api/v1/health

# Verify nginx configuration
docker exec hiyab-frontend cat /etc/nginx/conf.d/default.conf
```

#### 5. Permission Issues with Uploads

```bash
# Fix upload directory permissions
sudo chown -R 1000:1000 backend/uploads
sudo chmod -R 755 backend/uploads
```

### Debugging Commands

```bash
# Access container shell
docker exec -it hiyab-backend sh
docker exec -it hiyab-postgres psql -U postgres -d hiyab_tutor

# Check container resource limits
docker stats --no-stream

# Inspect container details
docker inspect hiyab-backend

# View container network
docker network inspect hiyab-network

# Check Docker daemon logs
sudo journalctl -u docker -f
```

### Reset Everything

If you need to start fresh:

```bash
# ⚠️ WARNING: This will delete all data!

# Stop and remove all containers
docker compose -f docker-compose.prod.yml down -v

# Remove all images
docker rmi hiyab-backend hiyab-frontend hiyab-dashboard

# Remove volumes (THIS DELETES DATABASE DATA)
docker volume rm hiyab_postgres_data

# Clean system
docker system prune -a --volumes

# Start fresh deployment
./deploy.sh
```

---

## 🔒 Security Best Practices

### 1. Use Strong Passwords

```bash
# Generate strong passwords
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 24  # For database password
pwgen 32 1               # Alternative method
```

### 2. Configure Firewall

```bash
# Install UFW (Ubuntu)
sudo apt-get install ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow specific ports for internal access only
sudo ufw allow from 127.0.0.1 to any port 5432  # PostgreSQL
sudo ufw allow 8080/tcp  # Backend API (or restrict to internal)

# Enable firewall
sudo ufw enable
```

### 3. Set Up SSL/TLS with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot

# Stop nginx temporarily
docker compose -f docker-compose.prod.yml stop frontend dashboard

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com

# Certificates will be in: /etc/letsencrypt/live/yourdomain.com/
```

Then update your nginx configurations to use SSL.

### 4. Regular Updates

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Update Docker images
docker compose -f docker-compose.prod.yml pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

### 5. Limit Database Access

In `docker-compose.prod.yml`, remove the database port mapping if not needed externally:

```yaml
# Remove or comment out:
# ports:
#   - "5432:5432"
```

### 6. Environment File Security

```bash
# Secure .env file
chmod 600 .env
chown root:root .env

# Never commit .env to git
echo ".env" >> .gitignore
```

### 7. Enable Docker Security Features

```bash
# Run containers as non-root (already configured in Dockerfiles)
# Limit container resources in docker-compose.prod.yml

# Add to each service:
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
```

---

## 📝 Production Checklist

Before going live, ensure:

- [ ] Strong passwords set for all services
- [ ] `.env` file properly configured and secured
- [ ] SSL/TLS certificates configured
- [ ] Firewall rules configured
- [ ] Backup automation set up
- [ ] Monitoring and logging configured
- [ ] Database is not exposed externally
- [ ] Regular update schedule planned
- [ ] Health checks are working
- [ ] All services start correctly
- [ ] Domain DNS configured correctly
- [ ] Email service configured (if needed)
- [ ] File upload limits configured
- [ ] CORS origins properly set

---

## 📞 Support

For issues and questions:

- Check the [Troubleshooting](#troubleshooting) section
- Review application logs
- Check Docker documentation
- Contact your system administrator

---

## 📄 License

[Your License Here]

---

**Last Updated**: November 14, 2025
