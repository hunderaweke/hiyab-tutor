# Production Deployment Guide

## Quick Start - Deploy All Services

### 1. Prepare Your VPS

SSH into your VPS:

```bash
ssh root@YOUR_VPS_IP
```

### 2. Clone and Setup Repository

```bash
# Clone the repository
cd ~/projects
git clone https://github.com/hunderaweke/hiyab-tutor.git
cd hiyab-tutor

# Pull latest changes (if already cloned)
git pull origin main
```

### 3. Create Production Environment File

Create `.env` file in the repository root:

```bash
nano .env
```

Paste this configuration (replace values with your production settings):

```env
# =============================================================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# =============================================================================

# -----------------------------------------------------------------------------
# JWT Configuration
# -----------------------------------------------------------------------------
JWT_SECRET=CHANGE_THIS_TO_STRONG_RANDOM_SECRET_KEY_32_CHARS_MIN

# -----------------------------------------------------------------------------
# Admin Credentials (Initial Setup)
# -----------------------------------------------------------------------------
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecureAdminPassword123!

# -----------------------------------------------------------------------------
# Application URLs
# -----------------------------------------------------------------------------
WEB_APP_URL=http://YOUR_VPS_IP

# -----------------------------------------------------------------------------
# Server Configuration
# -----------------------------------------------------------------------------
SERVER_PORT=8080

# -----------------------------------------------------------------------------
# PostgreSQL Database Configuration
# -----------------------------------------------------------------------------
BLUEPRINT_DB_HOST=postgres
BLUEPRINT_DB_PORT=5432
BLUEPRINT_DB_DATABASE=hiyab_tutor
BLUEPRINT_DB_USERNAME=postgres
BLUEPRINT_DB_PASSWORD=YourSecureDatabasePassword123!
BLUEPRINT_DB_SCHEMA=public

# -----------------------------------------------------------------------------
# Frontend Configuration
# -----------------------------------------------------------------------------
FRONTEND_PORT=80

# -----------------------------------------------------------------------------
# Dashboard Configuration
# -----------------------------------------------------------------------------
DASHBOARD_PORT=3000
```

**Important:** Generate a strong JWT secret:

```bash
# Generate a random 32-character secret
openssl rand -base64 32
```

### 4. Deploy the Stack

Run the automated deployment script:

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment (builds images and starts all services)
./deploy.sh
```

The script will:

1. Create a backup of existing data
2. Build Docker images for:
   - Backend (Go API)
   - Frontend (React Website)
   - Dashboard (React Admin Panel)
3. Start all services with health checks
4. Verify deployment

### 5. Verify Deployment

Check all services are running:

```bash
# View all containers
docker ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f dashboard

# Check health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### 6. Test Services

**Backend Health Check:**

```bash
curl http://localhost:8080/api/v1/health
```

**Frontend:**

```bash
# Access at: http://YOUR_VPS_IP:80
curl http://localhost:80
```

**Dashboard:**

```bash
# Access at: http://YOUR_VPS_IP:3000
curl http://localhost:3000
```

### 7. Access Your Application

- **Public Website:** `http://YOUR_VPS_IP` (port 80)
- **Admin Dashboard:** `http://YOUR_VPS_IP:3000`
- **API Documentation:** `http://YOUR_VPS_IP:8080/swagger/index.html`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Docker Network                   │
│                   (hiyab-network)                   │
│                                                     │
│  ┌──────────────┐      ┌──────────────┐           │
│  │   Frontend   │      │  Dashboard   │           │
│  │  (Nginx:80)  │      │ (Nginx:3000) │           │
│  └──────┬───────┘      └──────┬───────┘           │
│         │                     │                    │
│         │  /api/* proxied     │  /api/* proxied   │
│         └──────────┬──────────┘                    │
│                    │                               │
│              ┌─────▼──────┐                        │
│              │  Backend   │                        │
│              │ (Go:8080)  │                        │
│              └─────┬──────┘                        │
│                    │                               │
│              ┌─────▼──────┐                        │
│              │ PostgreSQL │                        │
│              │  (5432)    │                        │
│              └────────────┘                        │
└─────────────────────────────────────────────────────┘
```

**How Integration Works:**

1. **Frontend & Dashboard** run in Nginx containers
2. Nginx proxies all `/api/*` requests to `backend:8080`
3. **Backend** is accessible via Docker network DNS name
4. All API calls from browser → Nginx → Backend
5. Backend connects to PostgreSQL via `postgres:5432`

**No additional configuration needed** - it works out of the box!

---

## Manual Build & Deploy (Alternative)

If you prefer manual control:

### Build Images

```bash
cd ~/projects/hiyab-tutor

# Copy .env to backend for Docker build
cp .env backend/.env

# Build backend
docker build -t hiyab-backend:latest -f backend/Dockerfile backend/

# Clean up
rm backend/.env

# Build frontend
docker build -t hiyab-frontend:latest -f frontend/Dockerfile frontend/

# Build dashboard
docker build -t hiyab-dashboard:latest -f dashboard/Dockerfile dashboard/
```

### Start Services

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Or start individually
docker compose -f docker-compose.prod.yml up -d postgres
docker compose -f docker-compose.prod.yml up -d backend
docker compose -f docker-compose.prod.yml up -d frontend
docker compose -f docker-compose.prod.yml up -d dashboard
```

### Stop Services

```bash
# Stop all
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (careful - deletes database!)
docker compose -f docker-compose.prod.yml down -v
```

---

## Troubleshooting

### Backend showing `:0` port

**Symptom:** Logs show `Starting server on :0`

**Solution:**

```bash
# Ensure SERVER_PORT is set in .env
grep SERVER_PORT .env

# Rebuild backend
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend
```

### Health checks failing

**Check container logs:**

```bash
docker compose -f docker-compose.prod.yml logs backend
```

**Test health endpoint inside container:**

```bash
docker exec -it hiyab-backend sh -c "wget -qO- http://localhost:8080/api/v1/health"
```

**Verify .env was copied into container:**

```bash
docker exec -it hiyab-backend cat /app/.env
```

### Database connection errors

**Check PostgreSQL is healthy:**

```bash
docker ps --filter "name=postgres" --format "table {{.Names}}\t{{.Status}}"
```

**Test connection:**

```bash
docker exec -it hiyab-postgres psql -U postgres -d hiyab_tutor -c "SELECT 1;"
```

### API requests from frontend fail

**Check Nginx proxy configuration:**

```bash
# View frontend nginx logs
docker compose -f docker-compose.prod.yml logs frontend

# Test API from frontend container
docker exec -it hiyab-frontend wget -qO- http://backend:8080/api/v1/health
```

**Verify network:**

```bash
docker network inspect hiyab-network
# All containers should be listed
```

---

## Production Best Practices

### 1. Enable SSL/TLS (HTTPS)

Use Let's Encrypt with nginx-proxy or Caddy:

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get certificate (requires domain name)
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 2. Set Up Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # Dashboard
ufw enable
```

### 3. Regular Backups

Use the provided backup script:

```bash
./backup.sh
```

Or manually:

```bash
# Create backups directory
mkdir -p backups/$(date +%Y%m%d)

# Backup database
docker exec hiyab-postgres pg_dump -U postgres hiyab_tutor > backups/$(date +%Y%m%d)/db.sql

# Backup uploads
cp -r backend/uploads backups/$(date +%Y%m%d)/
```

### 4. Monitor Logs

```bash
# Follow all logs
docker compose -f docker-compose.prod.yml logs -f

# Follow specific service
docker compose -f docker-compose.prod.yml logs -f backend

# View last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

### 5. Update Application

```bash
cd ~/projects/hiyab-tutor

# Pull latest code
git pull origin main

# Rebuild and restart
./deploy.sh

# Or manually
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

---

## Management Scripts

### Quick Commands

**Start everything:**

```bash
docker compose -f docker-compose.prod.yml up -d
```

**Stop everything:**

```bash
docker compose -f docker-compose.prod.yml down
```

**Restart a service:**

```bash
docker compose -f docker-compose.prod.yml restart backend
```

**View resource usage:**

```bash
docker stats
```

**Clean up (removes stopped containers, unused images):**

```bash
docker system prune -a
```

---

## Ports Summary

| Service    | Container Port | Host Port | Access URL                         |
| ---------- | -------------- | --------- | ---------------------------------- |
| Frontend   | 80             | 80        | `http://YOUR_VPS_IP`               |
| Dashboard  | 80             | 3000      | `http://YOUR_VPS_IP:3000`          |
| Backend    | 8080           | 8080      | `http://YOUR_VPS_IP:8080`          |
| PostgreSQL | 5432           | 5432      | Internal (Docker network only)     |
| Swagger UI | -              | 8080      | `http://YOUR_VPS_IP:8080/swagger/` |

---

## Next Steps After Deployment

1. **Set up domain name** and point DNS to your VPS IP
2. **Configure SSL/TLS** certificates for HTTPS
3. **Set up monitoring** (optional: Prometheus, Grafana)
4. **Configure automated backups** (cron job)
5. **Set up CI/CD** (optional: GitHub Actions)
6. **Review security settings** (firewall, user permissions)

---

## Support

For issues or questions:

- Check logs: `docker compose -f docker-compose.prod.yml logs -f`
- Review `DEPLOYMENT.md` for detailed documentation
- Check `QUICK_REFERENCE.md` for command reference
